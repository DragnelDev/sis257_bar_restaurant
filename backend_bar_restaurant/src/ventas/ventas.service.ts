import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from 'src/detalle-ventas/entities/detalle-venta.entity';
import { Receta } from 'src/recetas/entities/receta.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { ClientesService } from 'src/clientes/clientes.service';
import { MesasService } from 'src/mesas/mesas.service';
import { Mesa } from 'src/mesas/entities/mesa.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta) private ventaRepository: Repository<Venta>,
    private readonly dataSource: DataSource,
    private readonly clientesService: ClientesService,
    private readonly mesasService: MesasService,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction(); // 1. INICIAR TRANSACCIÓN

      // Desestructurar los nuevos campos opcionales del DTO
      const { detalles, idCliente, nitCI, nombreFiscal, ...cabeceraData } =
        createVentaDto;

      // --- 2. LÓGICA DE CLIENTE / FACTURACIÓN ---
      let clienteIdFinal: number | null = null;

      if (idCliente) {
        clienteIdFinal = idCliente;
      } else if (nitCI && nombreFiscal) {
        const cliente = await this.clientesService.findOrCreateByNit({
          nitCI,
          nombreFiscal,
        });
        clienteIdFinal = cliente.id;
      }

      // 3. CREAR LA VENTA (CABECERA)
      let nuevaVenta = queryRunner.manager.create(Venta, {
        ...cabeceraData,
        idCliente: clienteIdFinal,
        estado: 'PAGADA', // Estado inicial
      });
      nuevaVenta = await queryRunner.manager.save(Venta, nuevaVenta);

      // 4. 🔴 CONTROL DE MESA: OCUPAR 🔴
      if (nuevaVenta.idMesa) {
        // Usamos el manager del queryRunner para asegurar la atomicidad del estado de la mesa
        const mesa = await queryRunner.manager.findOneBy(Mesa, {
          id: nuevaVenta.idMesa,
        });

        if (!mesa) {
          throw new NotFoundException(
            `Mesa con ID ${nuevaVenta.idMesa} no encontrada.`,
          );
        }

        mesa.estado = 'OCUPADA';
        await queryRunner.manager.save(Mesa, mesa);
      }

      // 5. PROCESAR DETALLES Y CONSUMO DE INVENTARIO
      for (const itemVendido of detalles) {
        // b. Cargar la Receta y su fórmula (Detalles de Receta)
        const receta = await queryRunner.manager.findOne(Receta, {
          where: { id: itemVendido.idReceta },
          relations: ['ingredientes'],
        });

        if (!receta) {
          throw new NotFoundException(
            `Receta con ID ${itemVendido.idReceta} no encontrada.`,
          );
        }

        // Capturar el costo de la receta al momento de la venta
        const costoUnitarioReceta = receta.costoActual;

        // a. Registrar el Detalle de Venta
        const detalleVenta = queryRunner.manager.create(DetalleVenta, {
          ...itemVendido,
          idVenta: nuevaVenta.id,
          costo_unitario: costoUnitarioReceta,
        });
        await queryRunner.manager.save(DetalleVenta, detalleVenta);

        // c. Disminuir el Stock de los Productos base
        for (const detalleConsumo of receta.ingredientes) {
          const producto = await queryRunner.manager.findOneBy(Producto, {
            id: detalleConsumo.idProducto,
          });

          if (!producto) {
            throw new NotFoundException(
              `Producto base ID ${detalleConsumo.idProducto} no encontrado para la receta.`,
            );
          }

          // Consumo Total = Cantidad de Materia Prima * Cantidad de Platos Vendidos
          const consumoTotal =
            Number(detalleConsumo.cantidadConsumida) *
            Number(itemVendido.cantidad);

          if (Number(producto.stockActual) < consumoTotal) {
            throw new Error(
              `Stock insuficiente para ${producto.nombre}. Se requiere ${consumoTotal}, solo hay ${producto.stockActual}.`,
            );
          }

          // Disminuir Stock
          producto.stockActual = Number(producto.stockActual) - consumoTotal;
          await queryRunner.manager.save(Producto, producto);
          // 🛑 Eliminación de la llamada incorrecta a commitTransaction()
        }
      }

      await queryRunner.commitTransaction(); // 5. ✅ CONFIRMAR UNA SOLA VEZ AL FINAL
      return nuevaVenta;
    } catch (error: any) {
      if (queryRunner.isTransactionActive) {
        // Asegurar que la transacción haya iniciado
        await queryRunner.rollbackTransaction(); // 6. REVERTIR
      }
      let msg = 'Error desconocido en la transacción de venta.';
      if (error instanceof Error && error.message) msg = error.message;
      throw new InternalServerErrorException(msg);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Venta[]> {
    return await this.ventaRepository.find({
      relations: ['mesa', 'usuario', 'cliente', 'detalleVentas'],
    });
  }

  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['mesa', 'usuario', 'cliente', 'detalleVentas'],
    });

    if (!venta) {
      throw new NotFoundException(`No se encontró la venta con ${id}`);
    }

    return venta;
  }

  async updateStatus(id: number, newStatus: string): Promise<Venta> {
    const venta = await this.findOne(id); // Usa tu método existente findOne para cargar la venta

    const currentStatus = venta.estado;

    // --- LÓGICA DE VALIDACIÓN DE TRANSICIÓN ACTUALIZADA ---
    if (currentStatus === 'PAGADA' && newStatus === 'PREPARANDO') {
      // Transición 1: De Pagada a Preparando (Inicio de elaboración)
      venta.estado = newStatus;
    } else if (currentStatus === 'PREPARANDO' && newStatus === 'LISTO') {
      // Transición 2: De Preparando a Listo (Fin de elaboración)
      venta.estado = newStatus;
    } else if (currentStatus === 'LISTO' && newStatus === 'ARCHIVADA') {
      // Transición 3: De Lista a Archivada (Entrega final al cliente)
      venta.estado = newStatus;
      // 🔴 CONTROL DE MESA: LIBERAR 🔴
      if (venta.idMesa) {
        // Llama al servicio de mesas inyectado para liberar la mesa
        await this.mesasService.updateStatus(venta.idMesa, 'LIBRE');
      }
    } else if (currentStatus === 'ARCHIVADA') {
      // La orden ya está en el estado final.
      throw new BadRequestException(`La Venta ${id} ya está ARCHIVADA.`);
    } else {
      // Cualquier otro intento (incluyendo saltos no secuenciales)
      throw new BadRequestException(
        `Transición no permitida: No se puede cambiar de ${currentStatus} a ${newStatus}.`,
      );
    }

    return await this.ventaRepository.save(venta);
  }

  async update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    const venta = await this.findOne(id);

    if (!venta) {
      throw new NotFoundException(`No se encontró la venta con ${id}`);
    }

    this.ventaRepository.merge(venta, updateVentaDto);
    return await this.ventaRepository.save(venta);
  }

  async remove(id: number): Promise<void> {
    const venta = await this.findOne(id);

    if (!venta) {
      throw new NotFoundException(`No se encontró la venta con ${id}`);
    }

    await this.ventaRepository.softDelete(id);
  }
}

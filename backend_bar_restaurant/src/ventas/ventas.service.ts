import {
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

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta) private ventaRepository: Repository<Venta>,
    private readonly dataSource: DataSource,
    private readonly clientesService: ClientesService,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); // 1. INICIAR TRANSACCIÓN

    try {
      //  Desestructurar los nuevos campos opcionales del DTO
      const { detalles, idCliente, nitCI, nombreFiscal, ...cabeceraData } =
        createVentaDto;

      // --- 2. LÓGICA DE CLIENTE / FACTURACIÓN ---
      let clienteIdFinal: number | null = null;

      if (idCliente) {
        // Opción 1: El DTO ya trae el ID de un cliente registrado.
        clienteIdFinal = idCliente;
      } else if (nitCI && nombreFiscal) {
        // Opción 2: Se pide factura (se envía NIT y Nombre). Se busca o crea.

        // Nota: El método findOrCreateByNit debe ser implementado en ClientesService
        // Se encarga de buscar por NIT y, si no existe, crea el nuevo cliente fiscal.
        const cliente = await this.clientesService.findOrCreateByNit({
          nitCI,
          nombreFiscal,
        });
        clienteIdFinal = cliente.id;
      }
      // Si nit_ci no existe y id_cliente no existe, clienteIdFinal se mantiene NULL (venta anónima).

      // 3. CREAR LA VENTA (CABECERA)
      // Usamos el manager del queryRunner para que esté dentro de la transacción
      let nuevaVenta = queryRunner.manager.create(Venta, {
        ...cabeceraData,
        id_cliente: clienteIdFinal, //  ASIGNACIÓN FINAL: Será NULL o el ID del cliente
      });
      nuevaVenta = await queryRunner.manager.save(Venta, nuevaVenta);

      // 4. PROCESAR DETALLES Y CONSUMO DE INVENTARIO
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
          // Registrar el costo en la tabla detalle_ventas
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
        }
      }

      await queryRunner.commitTransaction(); // 5. CONFIRMAR
      return nuevaVenta;
    } catch (error: any) {
      await queryRunner.rollbackTransaction(); // 6. REVERTIR
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

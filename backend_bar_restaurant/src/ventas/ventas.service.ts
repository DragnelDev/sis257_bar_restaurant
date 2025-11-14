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

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta) private ventaRepository: Repository<Venta>,
    private readonly dataSource: DataSource, // 👈 Inyectar DataSource
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); // 1. INICIAR TRANSACCIÓN

    try {
      const { detalles, ...cabeceraData } = createVentaDto;

      // 2. CREAR LA VENTA (CABECERA)
      // Usamos el manager del queryRunner para que esté dentro de la transacción
      let nuevaVenta = queryRunner.manager.create(Venta, cabeceraData);
      nuevaVenta = await queryRunner.manager.save(Venta, nuevaVenta);

      // 3. PROCESAR DETALLES Y CONSUMO DE INVENTARIO
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

        // 🚨 CAMBIO 1: CAPTURAR EL COSTO DE LA RECETA AL MOMENTO DE LA VENTA
        const costoUnitarioReceta = receta.costoActual; // Asumimos que el costo ya fue calculado.

        // a. Registrar el Detalle de Venta
        const detalleVenta = queryRunner.manager.create(DetalleVenta, {
          ...itemVendido,
          idVenta: nuevaVenta.id,
          // 🚨 CAMBIO 2: REGISTRAR EL COSTO EN LA TABLA DETALLE_VENTAS
          costo_unitario: costoUnitarioReceta,
        });
        await queryRunner.manager.save(DetalleVenta, detalleVenta);

        // c. Disminuir el Stock de los Productos base
        for (const detalleConsumo of receta.ingredientes) {
          // 🚨 CÓDIGO FALTANTE QUE CAUSA EL ERROR
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

          // El resto del código que usa 'producto' ahora es válido:
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

      await queryRunner.commitTransaction(); // 4. CONFIRMAR
      return nuevaVenta;
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 5. REVERTIR
      // Si es un error de negocio (ej. Stock insuficiente), lo lanzamos. Si es un error interno, lo registramos.
      throw new InternalServerErrorException(
        error.message || 'Error desconocido en la transacción de venta.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Venta[]> {
    return await this.ventaRepository.find({
      relations: ['mesa', 'usuario', 'detalleVentas'],
    });
  }

  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['mesa', 'usuario', 'detalleVentas'],
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

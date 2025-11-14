import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Compra } from './entities/compra.entity';
import { DataSource, Repository } from 'typeorm';
import { DetalleCompra } from 'src/detalle-compras/entities/detalle-compra.entity';
import { Producto } from 'src/productos/entities/producto.entity';
@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra) private comprasRepository: Repository<Compra>,

    @InjectRepository(DetalleCompra)
    private detalleCompraRepository: Repository<DetalleCompra>,

    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createCompraDto: CreateCompraDto): Promise<Compra> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction(); // 1. INICIAR TRANSACCIÓN (ACID)

    try {
      // Separar cabecera y detalles para la creación
      const { detalles, ...cabeceraData } = createCompraDto;

      // 2. CREAR LA COMPRA (CABECERA)
      let nuevaCompra = this.comprasRepository.create(cabeceraData);
      nuevaCompra = await queryRunner.manager.save(Compra, nuevaCompra);

      // 3. PROCESAR DETALLES Y ACTUALIZAR STOCK
      for (const item of detalles) {
        // a. Registrar el Detalle de la Compra
        const detalle = queryRunner.manager.create(DetalleCompra, {
          idCompra: nuevaCompra.id,
          idProducto: item.idProducto,
          cantidad: item.cantidad,
          precioUnitarioCompra: item.precioUnitarioCompra,
          subTotal: item.cantidad * item.precioUnitarioCompra, // Calcular subtotal
        });
        await queryRunner.manager.save(DetalleCompra, detalle);

        // b. AUMENTAR EL STOCK del Producto
        const producto = await queryRunner.manager.findOneBy(Producto, {
          id: item.idProducto,
        });

        if (!producto) {
          // Si un producto no existe, abortamos la transacción
          throw new NotFoundException(
            `Producto con ID ${item.idProducto} no encontrado para actualizar stock.`,
          );
        }

        // Actualizar el stock: sumar la cantidad comprada
        // Asegúrate de manejar los tipos de datos (PostgreSQL usa NUMERIC, TypeORM lo lee como string/number)
        producto.stockActual =
          Number(producto.stockActual || 0) + Number(item.cantidad);

        await queryRunner.manager.save(Producto, producto);
      }

      await queryRunner.commitTransaction(); // 4. CONFIRMAR (COMMIT)
      return nuevaCompra;
    } catch (error) {
      // 5. REVERTIR (ROLLBACK) si cualquier paso falla
      await queryRunner.rollbackTransaction();
      throw error; // Relanzar el error para que NestJS lo maneje
    } finally {
      // 6. LIBERAR el QueryRunner
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Compra[]> {
    return this.comprasRepository.find({
      relations: ['proveedor', 'usuario'],
      // Opcional: ordenar por fecha
      order: {
        fechaCreacion: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Compra> {
    const compra = await this.comprasRepository.findOneBy({ id });
    if (!compra) throw new NotFoundException('La compra no existe');
    return compra;
  }

  async update(id: number, updateCompraDto: UpdateCompraDto): Promise<Compra> {
    const compra = await this.findOne(id);
    Object.assign(compra, updateCompraDto);
    return this.comprasRepository.save(compra);
  }

  async remove(id: number): Promise<Compra> {
    const compra = await this.findOne(id);
    return this.comprasRepository.softRemove(compra);
  }
}

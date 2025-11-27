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
    await queryRunner.startTransaction();

    try {
      const { detalles, ...cabeceraData } = createCompraDto;

      let nuevaCompra = this.comprasRepository.create(cabeceraData);
      nuevaCompra = await queryRunner.manager.save(Compra, nuevaCompra);

      for (const item of detalles) {
        const detalle = queryRunner.manager.create(DetalleCompra, {
          idCompra: nuevaCompra.id,
          idProducto: item.idProducto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subTotal: item.cantidad * item.precioUnitario,
        });
        await queryRunner.manager.save(DetalleCompra, detalle);

        const producto = await queryRunner.manager.findOneBy(Producto, {
          id: item.idProducto,
        });

        if (!producto) {
          throw new NotFoundException(
            `Producto con ID ${item.idProducto} no encontrado para actualizar stock.`,
          );
        }

        producto.stockActual =
          Number(producto.stockActual || 0) + Number(item.cantidad);

        await queryRunner.manager.save(Producto, producto);
      }

      await queryRunner.commitTransaction();
      return nuevaCompra;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Compra[]> {
    return this.comprasRepository.find({
      relations: [
        'proveedor',
        'usuario',
        'detalleCompras',
        'detalleCompras.producto',
      ],
      order: { fechaCreacion: 'DESC' },
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

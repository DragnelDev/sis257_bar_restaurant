import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleCompra } from './entities/detalle-compra.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DetalleComprasService {
  constructor(
    @InjectRepository(DetalleCompra)
    private detalleComprasRepository: Repository<DetalleCompra>,
  ) {}

  async findAll(): Promise<DetalleCompra[]> {
    return this.detalleComprasRepository.find({
      relations: ['compra', 'producto'],
    });
  }

  async findAllDetailed(): Promise<DetalleCompra[]> {
    // Nota: Asume que las entidades DetalleCompra, Compra, Producto, Proveedor y Usuario están relacionadas.
    return this.detalleComprasRepository.find({
      // Carga recursiva de relaciones
      relations: [
        'producto', // Para el nombre y unidad del producto
        'compra', // Para acceder a la cabecera
        'compra.proveedor', // Para el nombre del proveedor
        'compra.usuario', // Para el nombre del usuario
      ],
      order: {
        compra: { fechaCreacion: 'DESC' }, // Ordenar por fecha de la compra
        id: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<DetalleCompra> {
    const detalleCompra = await this.detalleComprasRepository.findOne({
      where: { id },
      relations: ['compra', 'producto'],
    });
    if (!detalleCompra)
      throw new NotFoundException('El detalle compra no existe');
    return detalleCompra;
  }
}

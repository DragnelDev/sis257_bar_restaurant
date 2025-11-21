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
    return this.detalleComprasRepository.find({
      relations: ['producto', 'compra', 'compra.proveedor', 'compra.usuario'],
      order: {
        compra: { fechaCreacion: 'DESC' },
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DetalleVentasService {
  constructor(
    @InjectRepository(DetalleVenta)
    private detalleVentasRepository: Repository<DetalleVenta>,
  ) {}

  async findAll(): Promise<DetalleVenta[]> {
    return this.detalleVentasRepository.find();
  }

  async findOne(id: number): Promise<DetalleVenta> {
    const detalleVenta = await this.detalleVentasRepository.findOneBy({ id });
    if (!detalleVenta)
      throw new NotFoundException('El detalle venta no existe');
    return detalleVenta;
  }
}

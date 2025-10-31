import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta } from './entities/venta.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventaRepository: Repository<Venta>,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const venta = this.ventaRepository.create(createVentaDto);
    return await this.ventaRepository.save(venta);
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

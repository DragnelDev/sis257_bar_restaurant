import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DetalleVentasService {
  constructor(
    @InjectRepository(DetalleVenta)
    private detalleVentasRepository: Repository<DetalleVenta>,
  ) {}

  async create(
    createDetalleVentaDto: CreateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    let detalleVenta = await this.detalleVentasRepository.findOneBy({
      idVenta: createDetalleVentaDto.idVenta,
      idProducto: createDetalleVentaDto.idProducto,
      cantidad: createDetalleVentaDto.cantidad,
      precioUnitarioVenta: createDetalleVentaDto.precioUnitarioVenta,
    });
    if (detalleVenta) throw new ConflictException('El detalle venta ya existe');

    detalleVenta = new DetalleVenta();
    Object.assign(detalleVenta, createDetalleVentaDto);
    return this.detalleVentasRepository.save(detalleVenta);
  }

  async findAll(): Promise<DetalleVenta[]> {
    return this.detalleVentasRepository.find();
  }

  async findOne(id: number): Promise<DetalleVenta> {
    const detalleVenta = await this.detalleVentasRepository.findOneBy({ id });
    if (!detalleVenta)
      throw new NotFoundException('El detalle venta no existe');
    return detalleVenta;
  }

  async update(
    id: number,
    updateDetalleVentaDto: UpdateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    const detalleVenta = await this.findOne(id);
    Object.assign(detalleVenta, updateDetalleVentaDto);
    return this.detalleVentasRepository.save(detalleVenta);
  }

  async remove(id: number): Promise<DetalleVenta> {
    const detalleVenta = await this.findOne(id);
    return this.detalleVentasRepository.softRemove(detalleVenta);
  }
}

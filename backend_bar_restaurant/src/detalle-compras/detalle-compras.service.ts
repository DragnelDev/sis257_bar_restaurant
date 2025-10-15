import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDetalleCompraDto } from './dto/create-detalle-compra.dto';
import { UpdateDetalleCompraDto } from './dto/update-detalle-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleCompra } from './entities/detalle-compra.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DetalleComprasService {
  constructor(
    @InjectRepository(DetalleCompra)
    private detalleComprasRepository: Repository<DetalleCompra>,
  ) {}

  async create(
    createDetalleCompraDto: CreateDetalleCompraDto,
  ): Promise<DetalleCompra> {
    let detalleCompra = await this.detalleComprasRepository.findOneBy({
      idCompra: createDetalleCompraDto.idCompra,
      idProducto: createDetalleCompraDto.idProducto,
      cantidad: createDetalleCompraDto.cantidad,
      precioUnitarioCompra: createDetalleCompraDto.precioUnitarioCompra,
    });
    if (detalleCompra)
      throw new ConflictException('El detalle compra ya existe');

    detalleCompra = new DetalleCompra();
    Object.assign(detalleCompra, createDetalleCompraDto);
    return this.detalleComprasRepository.save(detalleCompra);
  }

  async findAll(): Promise<DetalleCompra[]> {
    return this.detalleComprasRepository.find();
  }

  async findOne(id: number): Promise<DetalleCompra> {
    const detalleCompra = await this.detalleComprasRepository.findOneBy({ id });
    if (!detalleCompra)
      throw new NotFoundException('El detalle compra no existe');
    return detalleCompra;
  }

  async update(
    id: number,
    updateDetalleCompraDto: UpdateDetalleCompraDto,
  ): Promise<DetalleCompra> {
    const detalleCompra = await this.findOne(id);
    Object.assign(detalleCompra, updateDetalleCompraDto);
    return this.detalleComprasRepository.save(detalleCompra);
  }

  async remove(id: number): Promise<DetalleCompra> {
    const detalleCompra = await this.findOne(id);
    return this.detalleComprasRepository.softRemove(detalleCompra);
  }
}

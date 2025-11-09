import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetalleRecetaDto } from './dto/create-detalle-receta.dto';
import { UpdateDetalleRecetaDto } from './dto/update-detalle-receta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleReceta } from './entities/detalle-receta.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DetalleRecetasService {
  constructor(
    @InjectRepository(DetalleReceta)
    private detalleRecetasRepository: Repository<DetalleReceta>,
  ) {}

  async create(
    createDetalleRecetaDto: CreateDetalleRecetaDto,
  ): Promise<DetalleReceta> {
    let detalleReceta = await this.detalleRecetasRepository.findOneBy({});
    detalleReceta = new DetalleReceta();
    Object.assign(detalleReceta, createDetalleRecetaDto);
    return this.detalleRecetasRepository.save(detalleReceta);
  }

  async findAll(): Promise<DetalleReceta[]> {
    return this.detalleRecetasRepository.find();
  }

  async findOne(id: number): Promise<DetalleReceta> {
    const detalleReceta = await this.detalleRecetasRepository.findOneBy({ id });
    if (!detalleReceta)
      throw new NotFoundException('El detalle receta no existe');
    return detalleReceta;
  }

  async update(
    id: number,
    updateDetalleRecetaDto: UpdateDetalleRecetaDto,
  ): Promise<DetalleReceta> {
    const detalleReceta = await this.findOne(id);
    Object.assign(detalleReceta, updateDetalleRecetaDto);
    return this.detalleRecetasRepository.save(detalleReceta);
  }

  async remove(id: number): Promise<DetalleReceta> {
    const detalleReceta = await this.findOne(id);
    return this.detalleRecetasRepository.softRemove(detalleReceta);
  }
}

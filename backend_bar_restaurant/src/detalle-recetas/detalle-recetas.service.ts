import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleReceta } from './entities/detalle-receta.entity';

@Injectable()
export class DetalleRecetasService {
  constructor(
    @InjectRepository(DetalleReceta)
    private detalleRecetasRepository: Repository<DetalleReceta>,
  ) {}

  async findAll(): Promise<DetalleReceta[]> {
    return this.detalleRecetasRepository.find();
  }

  async findOne(id: number): Promise<DetalleReceta> {
    const detalleReceta = await this.detalleRecetasRepository.findOneBy({ id });
    if (!detalleReceta)
      throw new NotFoundException('El detalle receta no existe');
    return detalleReceta;
  }
}

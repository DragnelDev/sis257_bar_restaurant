import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleReceta } from './entities/detalle-receta.entity';

@Injectable()
export class DetalleRecetaService {
  constructor(
    @InjectRepository(DetalleReceta)
    private detalleRecetasRepository: Repository<DetalleReceta>,
  ) {}

  async findAll(): Promise<DetalleReceta[]> {
    return this.detalleRecetasRepository.find({
      relations: ['producto', 'unidadConsumo', 'receta'],
    });
  }

  async findOne(id: number): Promise<DetalleReceta> {
    const detalleReceta = await this.detalleRecetasRepository.findOne({
      where: { id },
      relations: ['producto', 'unidadConsumo', 'receta'],
    });
    if (!detalleReceta)
      throw new NotFoundException('El detalle receta no existe');
    return detalleReceta;
  }
}

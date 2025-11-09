import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Receta } from './entities/receta.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta) private recetasRepository: Repository<Receta>,
  ) {}

  async create(createRecetaDto: CreateRecetaDto): Promise<Receta> {
    let receta = await this.recetasRepository.findOneBy({});
    receta = new Receta();
    Object.assign(receta, createRecetaDto);
    return this.recetasRepository.save(receta);
  }

  async findAll(): Promise<Receta[]> {
    return this.recetasRepository.find({ where: {}, order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Receta> {
    const receta = await this.recetasRepository.findOneBy({ id });
    if (!receta) throw new NotFoundException('La receta no existe');
    return receta;
  }

  async update(id: number, updateRecetaDto: UpdateRecetaDto): Promise<Receta> {
    const receta = await this.findOne(id);
    Object.assign(receta, updateRecetaDto);
    return this.recetasRepository.save(receta);
  }

  async remove(id: number): Promise<Receta> {
    const receta = await this.findOne(id);
    return this.recetasRepository.softRemove(receta);
  }
}

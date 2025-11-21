import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Mesa } from './entities/mesa.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MesasService {
  constructor(
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
  ) {}

  async create(createMesaDto: CreateMesaDto): Promise<Mesa> {
    const nuevaMesa = this.mesaRepository.create(createMesaDto);
    return this.mesaRepository.save(nuevaMesa);
  }

  async findAll(): Promise<Mesa[]> {
    return await this.mesaRepository.find();
  }

  async findOne(id: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOneBy({ id });
    if (!mesa)
      throw new NotFoundException(`No se encontró la mesa con ID ${id}`);
    return mesa;
  }

  async updateStatus(id: number, newStatus: string): Promise<Mesa> {
    const mesa = await this.findOne(id);
    mesa.estado = newStatus;
    return this.mesaRepository.save(mesa);
  }
  async update(id: number, updateMesaDto: UpdateMesaDto): Promise<Mesa> {
    const mesa = await this.findOne(id);
    this.mesaRepository.merge(mesa, updateMesaDto);
    return await this.mesaRepository.save(mesa);
  }

  async remove(id: number): Promise<void> {
    const mesa = await this.findOne(id);
    await this.mesaRepository.remove(mesa);
  }
}

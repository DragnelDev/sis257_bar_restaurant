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

  // 🟢 Crear mesa
  async create(createMesaDto: CreateMesaDto): Promise<Mesa> {
    const nuevaMesa = this.mesaRepository.create(createMesaDto);
    return await this.mesaRepository.save(nuevaMesa);
  }

  // 🔵 Listar todas las mesas
  async findAll(): Promise<Mesa[]> {
    return await this.mesaRepository.find();
  }

  // 🟣 Buscar una mesa por ID
  async findOne(id: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOneBy({ id });
    if (!mesa)
      throw new NotFoundException(`No se encontró la mesa con ID ${id}`);
    return mesa;
  }

  // 🟠 Actualizar mesa
  async update(id: number, updateMesaDto: UpdateMesaDto): Promise<Mesa> {
    const mesa = await this.findOne(id);
    Object.assign(mesa, updateMesaDto);
    return await this.mesaRepository.save(mesa);
  }

  // 🔴 Eliminar mesa
  async remove(id: number): Promise<void> {
    const mesa = await this.findOne(id);
    await this.mesaRepository.remove(mesa);
  }
}

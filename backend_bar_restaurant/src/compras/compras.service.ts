import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Compra } from './entities/compra.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra) private comprasRepository: Repository<Compra>,
  ) {}

  async create(createCompraDto: CreateCompraDto): Promise<Compra> {
    let compra = await this.comprasRepository.findOneBy({});
    compra = new Compra();
    Object.assign(compra, createCompraDto);
    return this.comprasRepository.save(compra);
  }

  async findAll(): Promise<Compra[]> {
    return this.comprasRepository.find({ order: { total: 'ASC' } });
  }

  async findOne(id: number): Promise<Compra> {
    const compra = await this.comprasRepository.findOneBy({ id });
    if (!compra) throw new NotFoundException('La compra no existe');
    return compra;
  }

  async update(id: number, updateCompraDto: UpdateCompraDto): Promise<Compra> {
    const compra = await this.findOne(id);
    Object.assign(compra, updateCompraDto);
    return this.comprasRepository.save(compra);
  }

  async remove(id: number): Promise<Compra> {
    const compra = await this.findOne(id);
    return this.comprasRepository.softRemove(compra);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
  ) {}
  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const cliente = this.clientesRepository.create(createClienteDto);
    return await this.clientesRepository.save(cliente);
  }

  async findOrCreateByNit(payload: {
    nitCI: string;
    nombreFiscal: string;
  }): Promise<Cliente> {
    const { nitCI, nombreFiscal } = payload;

    const existente = await this.clientesRepository.findOneBy({ nitCI });
    if (existente) return existente;

    const nuevo = this.clientesRepository.create({
      nombreFiscal,
      nitCI,
    });
    return await this.clientesRepository.save(nuevo);
  }

  async findAll(): Promise<Cliente[]> {
    return await this.clientesRepository.find();
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOneBy({ id });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
  ): Promise<Cliente> {
    const cliente = await this.findOne(id);
    Object.assign(cliente, updateClienteDto);
    return await this.clientesRepository.save(cliente);
  }

  async remove(id: number): Promise<Cliente> {
    const cliente = await this.findOne(id);
    return await this.clientesRepository.softRemove(cliente);
  }
}

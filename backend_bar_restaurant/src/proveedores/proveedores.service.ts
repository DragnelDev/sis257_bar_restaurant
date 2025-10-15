import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedoresRepository: Repository<Proveedor>,
  ) {}

  async create(CreateProveedorDto: CreateProveedorDto): Promise<Proveedor> {
    let proveedor = await this.proveedoresRepository.findOneBy({
      nit: CreateProveedorDto.nit.trim(),
    });
    if (proveedor) throw new ConflictException('El NIT ya está registrado');
    proveedor = new Proveedor();
    Object.assign(proveedor, CreateProveedorDto);
    return this.proveedoresRepository.save(proveedor);
  }

  async findAll(): Promise<Proveedor[]> {
    return this.proveedoresRepository.find();
  }

  async findOne(id: number): Promise<Proveedor> {
    const proveedor = await this.proveedoresRepository.findOneBy({ id });
    if (!proveedor) throw new ConflictException('El proveedor no existe');
    return proveedor;
  }

  async update(
    id: number,
    UpdateProveedorDto: UpdateProveedorDto,
  ): Promise<Proveedor> {
    const proveedor = await this.findOne(id);
    Object.assign(proveedor, UpdateProveedorDto);
    return this.proveedoresRepository.save(proveedor);
  }

  async remove(id: number): Promise<Proveedor> {
    const proveedor = await this.findOne(id);
    return this.proveedoresRepository.softRemove(proveedor);
  }
}

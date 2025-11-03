import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>,
  ) {}

  // 🟢 Crear categoría
  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const nuevaCategoria = this.categoriasRepository.create(createCategoriaDto);
    return await this.categoriasRepository.save(nuevaCategoria);
  }

  // 🔵 Listar todas las categorías
  async findAll(): Promise<Categoria[]> {
    return await this.categoriasRepository.find();
  }

  // 🟣 Buscar una categoría por ID
  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriasRepository.findOneBy({ id });
    if (!categoria) {
      throw new NotFoundException(`No se encontró la categoría ${id}`);
    }
    return categoria;
  }

  // 🟠 Actualizar una categoría
  async update(
    id: number,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    const categoria = await this.findOne(id);
    Object.assign(categoria, updateCategoriaDto);
    return await this.categoriasRepository.save(categoria);
  }

  // 🔴 Eliminar una categoría
  async remove(id: number): Promise<Categoria> {
    const categoria = await this.findOne(id);
    return await this.categoriasRepository.softRemove(categoria);
  }
}

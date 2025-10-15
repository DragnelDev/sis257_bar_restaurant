import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  // 🟢 Crear categoría
  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    const nuevaCategoria = this.categoriaRepository.create(createCategoriaDto);
    return await this.categoriaRepository.save(nuevaCategoria);
  }

  // 🔵 Listar todas las categorías
  async findAll(): Promise<Categoria[]> {
    return await this.categoriaRepository.find();
  }

  // 🟣 Buscar una categoría por ID
  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOneBy({ id });
    if (!categoria) {
      throw new NotFoundException(`No se encontró la categoría con ID ${id}`);
    }
    return categoria;
  }

  // 🟠 Actualizar una categoría
  async update(
    id: number,
    updateData: Partial<CreateCategoriaDto>,
  ): Promise<Categoria> {
    const categoria = await this.findOne(id);
    Object.assign(categoria, updateData);
    return await this.categoriaRepository.save(categoria);
  }

  // 🔴 Eliminar una categoría
  async remove(id: number): Promise<void> {
    const categoria = await this.findOne(id);
    await this.categoriaRepository.remove(categoria);
  }
}

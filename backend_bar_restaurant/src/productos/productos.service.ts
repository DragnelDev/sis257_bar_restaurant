import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    let producto = await this.productosRepository.findOneBy({
      idCategoria: createProductoDto.idCategoria,
      nombre: createProductoDto.nombre.trim(),
      descripcion: createProductoDto.descripcion.trim(),
      unidadMedida: createProductoDto.unidadMedida,
      stockActual: createProductoDto.stockActual,
      stockMinimo: createProductoDto.stockMinimo,
      costoPromedio: createProductoDto.costoPromedio,
    });
    if (producto) throw new ConflictException('El Producto ya existe');

    producto = new Producto();
    Object.assign(producto, createProductoDto);
    return this.productosRepository.save(producto);
  }

  async findAll(): Promise<Producto[]> {
    return this.productosRepository.find({
      relations: { categoria: true },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        unidadMedida: true,
        stockActual: true,
        stockMinimo: true,
        costoPromedio: true,
        categoria: {
          id: true,
          nombre: true,
        },
      },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOneBy({ id });
    if (!producto) throw new NotFoundException('El producto no existe');
    return producto;
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const producto = await this.findOne(id);
    Object.assign(producto, updateProductoDto);
    return this.productosRepository.save(producto);
  }

  async remove(id: number): Promise<Producto> {
    const producto = await this.findOne(id);
    return this.productosRepository.softRemove(producto);
  }
}

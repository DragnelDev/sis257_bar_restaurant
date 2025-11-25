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
    const { nombre, descripcion, idUnidadAlmacenamiento, idCategoria } =
      createProductoDto;

    const productoExistente = await this.productosRepository.findOne({
      where: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        idUnidadAlmacenamiento,
        idCategoria,
      },
    });

    if (productoExistente) throw new ConflictException('El Producto ya existe');

    const producto = this.productosRepository.create(createProductoDto);
    return this.productosRepository.save(producto);
  }

  async findAll(): Promise<Producto[]> {
    return this.productosRepository.find({
      relations: { categoria: true },
      select: {
        id: true,
        nombre: true,
        urlImagen: true,
        descripcion: true,
        idUnidadAlmacenamiento: true,
        stockActual: true,
        stockMinimo: true,
        costoUnitarioPromedio: true,
        perecedero: true,
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

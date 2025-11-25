import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Receta } from './entities/receta.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { DetalleReceta } from 'src/detalle-recetas/entities/detalle-receta.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta) private recetasRepository: Repository<Receta>,
    @InjectRepository(DetalleReceta)
    private detalleRecetasRepository: Repository<DetalleReceta>,
    private readonly dataSource: DataSource,
  ) {}

  async calcularCostoReceta(
    idReceta: number,
    queryRunnerManager?: EntityManager,
  ): Promise<number> {
    const manager: EntityManager =
      queryRunnerManager || this.recetasRepository.manager;

    const receta = await manager.findOne(Receta, {
      where: { id: idReceta },
      relations: [
        'ingredientes',
        'ingredientes.producto',
        'ingredientes.unidadConsumo',
      ],
    });

    if (!receta) return 0;

    let nuevoCosto = 0;

    for (const detalle of receta.ingredientes) {
      const costoProducto = detalle.producto?.costoUnitarioPromedio || 0;

      const costoDetalle =
        Number(detalle.cantidadConsumida) * Number(costoProducto);
      nuevoCosto += costoDetalle;
    }

    const costoFinal = Number(nuevoCosto.toFixed(2));
    receta.costoActual = costoFinal;

    await manager.save(Receta, receta);

    return costoFinal;
  }

  async create(createRecetaDto: CreateRecetaDto): Promise<Receta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { detalles, categoria, ...recetaData } = createRecetaDto;

      const existente = await queryRunner.manager.findOneBy(Receta, {
        nombreReceta: recetaData.nombreReceta,
      });
      if (existente) {
        throw new ConflictException('La receta con ese nombre ya existe.');
      }

      // Resolver la categoría por nombre (el DTO trae `categoria` como string)
      const categoriaEntity = await queryRunner.manager.findOne(Categoria, {
        where: { nombre: categoria },
      });
      if (!categoriaEntity) {
        throw new NotFoundException(`La categoría '${categoria}' no existe`);
      }

      let nuevaReceta = queryRunner.manager.create(Receta, {
        ...recetaData,
        idCategoria: categoriaEntity.id,
      });
      nuevaReceta = await queryRunner.manager.save(Receta, nuevaReceta);

      if (Array.isArray(detalles) && detalles.length > 0) {
        //  INICIO DE LA VALIDACIÓN CLAVE - Verificar que los productos ingredientes no sean vendibles
        for (const detalle of detalles) {
          const productoIngrediente = await queryRunner.manager.findOneBy(
            Producto,
            {
              id: detalle.idProducto,
            },
          );

          if (!productoIngrediente) {
            throw new NotFoundException(
              `Producto ingrediente ID ${detalle.idProducto} no encontrado.`,
            );
          }

          if (productoIngrediente.esVendible) {
            throw new BadRequestException(
              `El producto "${productoIngrediente.nombre}" no puede ser usado como ingrediente porque está marcado como vendible directamente.`,
            );
          }
        }

        const detallesReceta = detalles.map((detalle) =>
          queryRunner.manager.create(DetalleReceta, {
            ...detalle,
            idReceta: nuevaReceta.id,
          }),
        );
        await queryRunner.manager.save(DetalleReceta, detallesReceta);
      }

      await this.calcularCostoReceta(nuevaReceta.id, queryRunner.manager);

      await queryRunner.commitTransaction();
      return nuevaReceta;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateRecetaDto: UpdateRecetaDto): Promise<Receta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { detalles, categoria, ...recetaData } = updateRecetaDto;

      const receta = await queryRunner.manager.findOneBy(Receta, { id });
      if (!receta) {
        throw new NotFoundException(`La receta con ID ${id} no existe`);
      }

      // Si el DTO trae `categoria` como nombre, resolver y usar `idCategoria`.
      const patch: Partial<Receta> = { ...recetaData };
      if (typeof categoria === 'string' && categoria.trim().length > 0) {
        const categoriaEntity = await queryRunner.manager.findOne(Categoria, {
          where: { nombre: categoria },
        });
        if (!categoriaEntity) {
          throw new NotFoundException(`La categoría '${categoria}' no existe`);
        }
        patch.idCategoria = categoriaEntity.id;
      }

      queryRunner.manager.merge(Receta, receta, patch);
      await queryRunner.manager.save(Receta, receta);

      if (Array.isArray(detalles) && detalles.length > 0) {
        // INICIO DE LA VALIDACIÓN CLAVE: Verificar que los productos ingredientes no sean vendibles
        for (const detalle of detalles) {
          // Nota: Asegúrate de que la entidad 'Producto' esté accesible (importada o disponible en el scope)
          const productoIngrediente = await queryRunner.manager.findOneBy(
            Producto,
            {
              id: detalle.idProducto,
            },
          );

          if (!productoIngrediente) {
            throw new NotFoundException(
              `Producto ingrediente ID ${detalle.idProducto} no encontrado.`,
            );
          }

          if (productoIngrediente.esVendible) {
            throw new BadRequestException(
              `El producto "${productoIngrediente.nombre}" no puede ser usado como ingrediente porque está marcado como vendible directamente.`,
            );
          }
        }

        await queryRunner.manager.delete(DetalleReceta, { idReceta: id });

        const nuevosDetalles = detalles.map((detalle) =>
          queryRunner.manager.create(DetalleReceta, {
            ...detalle,
            idReceta: id,
          }),
        );
        await queryRunner.manager.save(DetalleReceta, nuevosDetalles);

        await this.calcularCostoReceta(id, queryRunner.manager);
      }

      await queryRunner.commitTransaction();
      return receta;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Receta[]> {
    return this.recetasRepository.find({
      relations: [
        'ingredientes',
        'ingredientes.producto',
        'ingredientes.unidadConsumo',
      ],
      order: { nombreReceta: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Receta> {
    const receta = await this.recetasRepository.findOne({
      where: { id },
      relations: [
        'ingredientes',
        'ingredientes.producto',
        'ingredientes.unidadConsumo',
      ],
    });
    if (!receta) throw new NotFoundException('La receta no existe');
    return receta;
  }

  async remove(id: number): Promise<Receta> {
    const receta = await this.findOne(id);
    return this.recetasRepository.softRemove(receta);
  }
}

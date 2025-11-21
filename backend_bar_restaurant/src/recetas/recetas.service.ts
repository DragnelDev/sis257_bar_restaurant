import {
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
      relations: ['ingredientes', 'ingredientes.producto'],
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
      const { detalles, ...recetaData } = createRecetaDto;

      const existente = await queryRunner.manager.findOneBy(Receta, {
        nombreReceta: recetaData.nombreReceta,
      });
      if (existente) {
        throw new ConflictException('La receta con ese nombre ya existe.');
      }

      let nuevaReceta = queryRunner.manager.create(Receta, recetaData);
      nuevaReceta = await queryRunner.manager.save(Receta, nuevaReceta);

      const detallesReceta = detalles.map((detalle) =>
        queryRunner.manager.create(DetalleReceta, {
          ...detalle,
          idReceta: nuevaReceta.id,
        }),
      );
      await queryRunner.manager.save(DetalleReceta, detallesReceta);

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
      const { detalles, ...recetaData } = updateRecetaDto;

      const receta = await queryRunner.manager.findOneBy(Receta, { id });
      if (!receta) {
        throw new NotFoundException(`La receta con ID ${id} no existe`);
      }

      queryRunner.manager.merge(Receta, receta, recetaData);
      await queryRunner.manager.save(Receta, receta);

      if (detalles && detalles.length > 0) {
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
      relations: ['ingredientes', 'ingredientes.producto'],
      order: { nombreReceta: 'ASC' },
    });
  }
  async findOne(id: number): Promise<Receta> {
    const receta = await this.recetasRepository.findOne({
      where: { id },
      relations: ['ingredientes'],
    });
    if (!receta) throw new NotFoundException('La receta no existe');
    return receta;
  }
  async remove(id: number): Promise<Receta> {
    const receta = await this.findOne(id);
    return this.recetasRepository.softRemove(receta);
  }
}

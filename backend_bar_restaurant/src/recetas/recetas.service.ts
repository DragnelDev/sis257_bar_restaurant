import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto'; // Asumimos que este DTO también incluye 'detalles'
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

  // -----------------------------------------------------
  //  MÉTODO AUXILIAR: CALCULAR Y ACTUALIZAR COSTO
  // -----------------------------------------------------

  async calcularCostoReceta(
    idReceta: number,
    queryRunnerManager?: EntityManager,
  ): Promise<number> {
    // Usamos el manager pasado si estamos dentro de una transacción, sino el repositorio normal.
    const manager: EntityManager =
      queryRunnerManager || this.recetasRepository.manager;

    const receta = await manager.findOne(Receta, {
      where: { id: idReceta },
      // Es vital que tu entidad Producto tenga una relación y un campo de costo
      relations: ['ingredientes', 'ingredientes.producto'],
    });

    if (!receta) return 0;

    let nuevoCosto = 0;

    for (const detalle of receta.ingredientes) {
      // Asegúrate de que el Producto tenga un campo de costo (ej. costoUnitarioPromedio)
      const costoProducto = detalle.producto?.costoUnitarioPromedio || 0;

      // Costo del ingrediente = Cantidad Consumida * Costo Unitario del Producto
      const costoDetalle =
        Number(detalle.cantidadConsumida) * Number(costoProducto);
      nuevoCosto += costoDetalle;
    }

    // 1. Redondear y actualizar
    const costoFinal = Number(nuevoCosto.toFixed(2));
    receta.costoActual = costoFinal;

    // 2. Guardar el cambio de costo
    await manager.save(Receta, receta);

    return costoFinal;
  }

  // -----------------------------------------------------
  //  MÉTODO: CREATE (Creación Atómica y Cálculo de Costo)
  // -----------------------------------------------------
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

      // 1. Guardar la Cabecera
      let nuevaReceta = queryRunner.manager.create(Receta, recetaData);
      nuevaReceta = await queryRunner.manager.save(Receta, nuevaReceta);

      // 2. Guardar los Detalles (Ingredientes)
      const detallesReceta = detalles.map((detalle) =>
        queryRunner.manager.create(DetalleReceta, {
          ...detalle,
          idReceta: nuevaReceta.id,
        }),
      );
      await queryRunner.manager.save(DetalleReceta, detallesReceta);

      // Se llama con el manager del queryRunner para que use los detalles que acabamos de guardar
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

  // -----------------------------------------------------
  // MÉTODO: UPDATE (Actualización Transaccional de Cabecera y Fórmula)
  // -----------------------------------------------------
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

      // 1. Actualizar la Cabecera de la Receta
      queryRunner.manager.merge(Receta, receta, recetaData);
      await queryRunner.manager.save(Receta, receta);

      // 2. Si se enviaron detalles, actualizar la fórmula
      if (detalles && detalles.length > 0) {
        // a. Eliminar detalles antiguos
        await queryRunner.manager.delete(DetalleReceta, { idReceta: id });

        // b. Crear nuevos detalles
        const nuevosDetalles = detalles.map((detalle) =>
          queryRunner.manager.create(DetalleReceta, {
            ...detalle,
            idReceta: id,
          }),
        );
        await queryRunner.manager.save(DetalleReceta, nuevosDetalles);

        // RECALCULAR COSTO después de modificar la fórmula
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
      relations: ['ingredientes'], // Cargar la fórmula
      order: { nombreReceta: 'ASC' },
    });
  }
  async findOne(id: number): Promise<Receta> {
    const receta = await this.recetasRepository.findOne({
      where: { id },
      relations: ['ingredientes'], // Cargar la fórmula
    });
    if (!receta) throw new NotFoundException('La receta no existe');
    return receta;
  }
  async remove(id: number): Promise<Receta> {
    const receta = await this.findOne(id);
    return this.recetasRepository.softRemove(receta);
  }
}

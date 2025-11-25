import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';
import { UnidadMedida } from './entities/unidad-medida.entity';

@Injectable()
export class UnidadMedidasService {
  constructor(
    @InjectRepository(UnidadMedida)
    private readonly unidadMedidasRepository: Repository<UnidadMedida>,
  ) {}
  async create(
    createUnidadMedidaDto: CreateUnidadMedidaDto,
  ): Promise<UnidadMedida> {
    const { nombre, simbolo /*factorConversion*/ } = createUnidadMedidaDto;

    const existente = await this.unidadMedidasRepository.findOne({
      where: [
        { nombre: nombre.toUpperCase() },
        { simbolo: simbolo.toUpperCase() },
      ],
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una unidad de medida con el nombre '${nombre}' o símbolo '${simbolo}'.`,
      );
    }

    /*if (factorConversion <= 0) {
      throw new BadRequestException(
        'El factor de conversión debe ser un número positivo.',
      );
    }*/

    const nuevaUnidad = this.unidadMedidasRepository.create({
      ...createUnidadMedidaDto,
      nombre: nombre.toUpperCase(),
      simbolo: simbolo.toUpperCase(),
    });

    return this.unidadMedidasRepository.save(nuevaUnidad);
  }

  async findAll(): Promise<UnidadMedida[]> {
    return this.unidadMedidasRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<UnidadMedida> {
    const unidad = await this.unidadMedidasRepository.findOneBy({ id });

    if (!unidad) {
      throw new NotFoundException(
        `Unidad de medida con ID ${id} no encontrada.`,
      );
    }

    return unidad;
  }

  async update(
    id: number,
    updateUnidadMedidaDto: UpdateUnidadMedidaDto,
  ): Promise<UnidadMedida> {
    const unidadExistente = await this.findOne(id);
    const unidadFusionada = this.unidadMedidasRepository.merge(
      unidadExistente,
      {
        ...updateUnidadMedidaDto,
        nombre: updateUnidadMedidaDto.nombre
          ? updateUnidadMedidaDto.nombre.toUpperCase()
          : unidadExistente.nombre,
        simbolo: updateUnidadMedidaDto.simbolo
          ? updateUnidadMedidaDto.simbolo.toUpperCase()
          : unidadExistente.simbolo,
      },
    );

    if (updateUnidadMedidaDto.nombre || updateUnidadMedidaDto.simbolo) {
      const duplicado = await this.unidadMedidasRepository.findOne({
        where: [
          { nombre: unidadFusionada.nombre },
          { simbolo: unidadFusionada.simbolo },
        ],
      });

      if (duplicado && duplicado.id !== id) {
        throw new ConflictException(`Otra unidad ya usa ese nombre o símbolo.`);
      }
    }

    return this.unidadMedidasRepository.save(unidadFusionada);
  }

  async remove(id: number): Promise<UnidadMedida> {
    const unidad = await this.findOne(id);

    await this.unidadMedidasRepository.softRemove(unidad);

    return unidad;
  }
}

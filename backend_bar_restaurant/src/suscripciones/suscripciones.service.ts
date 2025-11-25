import { Injectable } from '@nestjs/common';
import { CreateSuscripcionDto } from './dto/create-suscripcione.dto';
import { UpdateSuscripcionDto } from './dto/update-suscripcione.dto';

@Injectable()
export class SuscripcionesService {
  create(createSuscripcionDto: CreateSuscripcionDto) {
    return 'This action adds a new suscripcione';
  }

  findAll() {
    return `This action returns all suscripciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} suscripcione`;
  }

  update(id: number, updateSuscripcionDto: UpdateSuscripcionDto) {
    return `This action updates a #${id} suscripcione`;
  }

  remove(id: number) {
    return `This action removes a #${id} suscripcione`;
  }
}

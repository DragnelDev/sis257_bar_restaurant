import { Injectable } from '@nestjs/common';
import { CreateMiembroEquipoDto } from './dto/create-miembro-equipo.dto';
import { UpdateMiembroEquipoDto } from './dto/update-miembro-equipo.dto';

@Injectable()
export class MiembroEquiposService {
  create(createMiembroEquipoDto: CreateMiembroEquipoDto) {
    return 'This action adds a new miembroEquipo';
  }

  findAll() {
    return `This action returns all miembroEquipos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} miembroEquipo`;
  }

  update(id: number, updateMiembroEquipoDto: UpdateMiembroEquipoDto) {
    return `This action updates a #${id} miembroEquipo`;
  }

  remove(id: number) {
    return `This action removes a #${id} miembroEquipo`;
  }
}

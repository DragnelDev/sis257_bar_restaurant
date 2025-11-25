import { Injectable } from '@nestjs/common';
import { CreateAsignacionReservaDto } from './dto/create-asignacion-reserva.dto';
import { UpdateAsignacionReservaDto } from './dto/update-asignacion-reserva.dto';

@Injectable()
export class AsignacionReservasService {
  create(createAsignacionReservaDto: CreateAsignacionReservaDto) {
    return 'This action adds a new asignacionReserva';
  }

  findAll() {
    return `This action returns all asignacionReservas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asignacionReserva`;
  }

  update(id: number, updateAsignacionReservaDto: UpdateAsignacionReservaDto) {
    return `This action updates a #${id} asignacionReserva`;
  }

  remove(id: number) {
    return `This action removes a #${id} asignacionReserva`;
  }
}

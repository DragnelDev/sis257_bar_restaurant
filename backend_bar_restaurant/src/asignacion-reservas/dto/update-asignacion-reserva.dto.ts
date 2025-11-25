import { PartialType } from '@nestjs/swagger';
import { CreateAsignacionReservaDto } from './create-asignacion-reserva.dto';

export class UpdateAsignacionReservaDto extends PartialType(
  CreateAsignacionReservaDto,
) {}

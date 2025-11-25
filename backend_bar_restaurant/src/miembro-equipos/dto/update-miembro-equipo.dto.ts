import { PartialType } from '@nestjs/swagger';
import { CreateMiembroEquipoDto } from './create-miembro-equipo.dto';

export class UpdateMiembroEquipoDto extends PartialType(
  CreateMiembroEquipoDto,
) {}

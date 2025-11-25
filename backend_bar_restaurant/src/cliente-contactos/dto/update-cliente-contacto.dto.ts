import { PartialType } from '@nestjs/swagger';
import { CreateClienteContactoDto } from './create-cliente-contacto.dto';

export class UpdateClienteContactoDto extends PartialType(
  CreateClienteContactoDto,
) {}

import { PartialType } from '@nestjs/swagger';
import { CreateSuscripcionDto } from './create-suscripcione.dto';

export class UpdateSuscripcionDto extends PartialType(CreateSuscripcionDto) {}

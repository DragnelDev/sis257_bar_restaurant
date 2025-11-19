import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo idEmpleado es obligatorio' })
  @IsNumber({}, { message: 'El campo idEmpleado debe ser un número' })
  readonly idEmpleado: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre usuario es obligatorio' })
  @IsString({ message: 'El campo nombre usuario debe ser de tipo cadena' })
  @MaxLength(15, {
    message: 'El campo nombre usuario no debe ser mayor a 15 caracteres',
  })
  readonly usuario: string;

  @ApiProperty()
  @IsString({ message: 'El campo rol debe ser tipo cadena' })
  @IsEnum(['CAJERO', 'ADMINISTRADOR', 'CONTADOR', 'CHEF', 'MESERO'], {
    message: 'El rol debe ser: CAJERO, ADMINISTRADOR, CONTADOR, CHEF, MESERO',
  })
  readonly rol: string;

  @ApiProperty()
  @IsDefined({ message: 'El campo activo debe estar definido' })
  readonly activo: boolean;
}

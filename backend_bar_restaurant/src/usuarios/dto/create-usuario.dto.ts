import { ApiProperty } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre usuario es obligatorio' })
  @IsString({ message: 'El campo nombre usuario debe ser de tipo cadena' })
  @MaxLength(10, {
    message: 'El campo nombre usuario no debe ser mayor a 10 caracteres',
  })
  readonly nombreUsuario: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo rol es obligatorio' })
  @IsString({ message: 'El campo rol debe ser de tipo cadena' })
  @MaxLength(15, { message: 'El campo rol no debe ser mayor a 15 caracteres' })
  readonly rol: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo email es obligatorio' })
  @IsString({ message: 'El campo email debe ser de tipo cadena' })
  @MaxLength(70, {
    message: 'El campo email no debe ser mayor a 70 caracteres',
  })
  readonly correoElectronico: string;

  @ApiProperty()
  @IsDefined({ message: 'El campo activo debe estar definido' })
  @IsBooleanString({ message: 'El campo activo debe ser de tipo verdadero' })
  readonly activo: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProveedorDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo el nombre de empresa es obligatorio' })
  @MaxLength(50, {
    message:
      'El campo del nombre de empresa no puede tener más de 50 caracteres',
  })
  @IsString({
    message: 'El campo del nombre de empresa debe ser una cadena de texto',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  nombreEmpresa: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo NIT es obligatorio' })
  @MaxLength(14, {
    message: 'El campo NIT no puede tener más de 14 caracteres',
  })
  @IsString({ message: 'El campo NIT debe ser una cadena de texto' })
  nit: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo responsable es obligatorio' })
  @MaxLength(50, {
    message: 'El campo responsable no puede tener más de 50 caracteres',
  })
  @IsString({ message: 'El campo responsable debe ser una cadena de texto' })
  responsable: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo dirección es obligatorio' })
  @MaxLength(60, {
    message: 'El campo dirección no puede tener más de 60 caracteres',
  })
  @IsString({ message: 'El campo dirección debe ser una cadena de texto' })
  direccion: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo celular es obligatorio' })
  @MaxLength(12, {
    message: 'El campo celular no puede tener más de 12 caracteres',
  })
  @IsString({ message: 'El campo celular debe ser una cadena de texto' })
  celular: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo email es obligatorio' })
  @MaxLength(50, {
    message: 'El campo email no puede tener más de 50 caracteres',
  })
  @IsString({ message: 'El campo email debe ser una cadena de texto' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo condición de pago es obligatorio' })
  @MaxLength(80, {
    message: 'El campo condición de pago no puede tener más de 80 caracteres',
  })
  @IsString({
    message: 'El campo condición de pago debe ser una cadena de texto',
  })
  condicionPago: string;
}

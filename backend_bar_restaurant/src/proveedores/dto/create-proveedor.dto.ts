import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateProveedorDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo el nombre es obligatorio' })
  @MaxLength(50, {
    message: 'El campo del nombre no puede tener más de 50 caracteres',
  })
  @IsString({ message: 'El campo del nombre debe ser una cadena de texto' })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo NIT es obligatorio' })
  @MaxLength(14, {
    message: 'El campo NIT no puede tener más de 14 caracteres',
  })
  @IsString({ message: 'El campo NIT debe ser una cadena de texto' })
  nit: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo teléfono es obligatorio' })
  @IsNumber({}, { message: 'El campo teléfono debe ser un número' })
  telefono: number;
}

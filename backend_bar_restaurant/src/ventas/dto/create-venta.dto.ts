import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateVentaDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo Mesa no debe estar vacío' })
  @IsNumber({}, { message: 'El campo Mesa debe ser un número' })
  readonly idMesa: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo idUsuario no debe estar vacío' })
  @IsNumber({}, { message: 'El campo idUsuario debe ser un número' })
  readonly idUsuario: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo total no debe estar vacío' })
  @IsNumber({}, { message: 'El campo total debe ser un número' })
  readonly total: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo estado no debe estar vacío' })
  @IsString({ message: 'El campo estado debe ser una cadena' })
  readonly estado: string;
}

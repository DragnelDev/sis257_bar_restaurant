import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateMesaDto {
  @ApiProperty()
  @IsInt({ message: 'El número de mesa debe ser un número entero' })
  @Min(1, { message: 'El número de mesa debe ser mayor que 0' })
  numeroMesa: number;

  @ApiProperty()
  @IsInt({ message: 'La capacidad debe ser un número entero' })
  @Min(1, { message: 'La capacidad mínima es de 1 persona' })
  capacidad: number;

  @ApiProperty()
  @IsString({ message: 'El estado debe ser un texto' })
  estado: string;
}

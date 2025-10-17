import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateMesaDto {
  @IsInt({ message: 'El número de mesa debe ser un número entero' })
  @Min(1, { message: 'El número de mesa debe ser mayor que 0' })
  numeroMesa: number;

  @IsInt({ message: 'La capacidad debe ser un número entero' })
  @Min(1, { message: 'La capacidad mínima es de 1 persona' })
  capacidad: number;

  @IsString({ message: 'El estado debe ser un texto' })
  @MinLength(3, { message: 'El estado debe tener al menos 3 caracteres' })
  estado: string;
}

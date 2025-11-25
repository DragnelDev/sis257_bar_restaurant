import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUnidadMedidaDto {
  @ApiProperty({
    example: 'Kilogramo',
    description:
      'Nombre de la unidad de medida, ej: Kilogramo, Gramo, Litro, Onza, Unidad',
  })
  @IsString()
  @IsNotEmpty()
  readonly nombre: string; // Ej: Kilogramo, Gramo, Litro, Onza, Unidad

  @ApiProperty({
    example: 'kg',
    description: 'Símbolo de la unidad de medida, ej: kg, g, L, oz, und',
  })
  @IsString()
  @IsNotEmpty()
  readonly simbolo: string; // Ej: kg, g, L, oz, und

  /*@ApiProperty({
    example: 1000,
    description:
      'Factor de conversión respecto a la unidad base de su grupo (ej. 1000 si la base es el gramo y esta es el kilogramo)',
  })
  factorConversion: number;*/
}

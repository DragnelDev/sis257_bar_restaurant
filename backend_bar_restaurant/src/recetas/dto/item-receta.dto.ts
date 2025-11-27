import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsNumber, Min } from 'class-validator';

export class ItemRecetaDto {
  @ApiProperty({ description: 'ID del producto (ingrediente) consumido.' })
  @IsDefined({ message: 'El campo idProducto debe estar definido' })
  @IsInt({ message: 'El campo idProducto debe ser un número entero' })
  readonly idProducto: number;

  @ApiProperty({
    description:
      'Cantidad de la materia prima que se consume para UNA unidad de la Receta/Plato.',
  })
  @IsDefined({ message: 'El campo cantidadConsumida debe estar definido' })
  @IsNumber(
    {},
    { message: 'El campo cantidadConsumida debe ser de tipo numérico' },
  )
  @Min(0.001, { message: 'La cantidad consumida debe ser mayor a cero' })
  readonly cantidadConsumida: number;
}

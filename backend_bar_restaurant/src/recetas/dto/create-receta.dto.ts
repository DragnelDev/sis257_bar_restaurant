import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ItemRecetaDto } from './item-receta.dto';

export class CreateRecetaDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre es obligatorio' })
  @IsString({ message: 'El campo nombre debe ser de tipo cadena' })
  @MaxLength(100, {
    message: 'El campo nombre no debe ser mayor a 100 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly nombreReceta: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo descripcion es obligatorio' })
  @IsString({ message: 'El campo descripcion debe ser de tipo cadena' })
  @MaxLength(255, {
    message: 'El campo descripcion no debe ser mayor a 255 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly descripcion: string;

  @ApiProperty({ description: 'Precio actual al que se vende esta receta.' })
  @IsNotEmpty({ message: 'El precio de venta actual es obligatorio' })
  @IsNumber({}, { message: 'El precio de venta debe ser numérico' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  readonly precioVentaActual: number;

  @ApiProperty({
    description: 'ID de la categoría a la que pertenece la receta.',
  })
  @IsNotEmpty({ message: 'El ID de la categoría es obligatorio' })
  @IsNumber({}, { message: 'El ID de la categoría debe ser numérico' })
  readonly idCategoria: number;

  @ApiProperty({ description: 'URL de la imagen representativa de la receta.' })
  @IsNotEmpty({ message: 'La URL de la imagen es obligatoria' })
  @IsString({ message: 'La URL de la imagen debe ser de tipo cadena' })
  @MaxLength(255, {
    message: 'La URL de la imagen no debe ser mayor a 255 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly urlImagen: string;

  // --- Detalles de la Receta (ingredientes y cantidades) ---

  @ApiProperty({
    type: [ItemRecetaDto],
    description: 'Lista de ingredientes y sus cantidades consumidas.',
  })
  @IsArray({ message: 'Los detalles de la receta deben ser un array.' })
  @ValidateNested({ each: true })
  @Type(() => ItemRecetaDto)
  readonly detalles: ItemRecetaDto[];
}

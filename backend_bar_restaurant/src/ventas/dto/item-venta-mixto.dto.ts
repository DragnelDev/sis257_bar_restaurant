import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsInt,
  IsNumber,
  Min,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class ItemVentaMixtoDto {
  // ----------------------------------------------------
  // IDs (Solo uno debe existir, el otro es undefined/null)
  // ----------------------------------------------------

  // Si idProducto no está definido, verificamos idReceta
  @ValidateIf((o: ItemVentaMixtoDto) => !o.idReceta)
  @ApiProperty({
    required: false,
    description: 'ID del Producto (para venta directa).',
  })
  @IsInt({ message: 'idProducto debe ser entero' })
  @IsOptional()
  readonly idProducto?: number;

  // Si idProducto no está definido, verificamos idReceta
  @ValidateIf((o: ItemVentaMixtoDto) => !o.idProducto)
  @ApiProperty({
    required: false,
    description: 'ID de la Receta (para platos/bebidas).',
  })
  @IsInt({ message: 'idReceta debe ser entero' })
  @IsOptional()
  readonly idReceta?: number; // Ambos son opcionales a nivel de DTO

  // ----------------------------------------------------
  // Datos Comunes
  // ----------------------------------------------------

  @ApiProperty({ description: 'Cantidad de unidades vendidas.' })
  @IsDefined()
  @IsNumber()
  @Min(0.001)
  readonly cantidad: number;

  @ApiProperty({ description: 'Precio unitario de venta final.' })
  @IsDefined()
  @IsNumber()
  @Min(0)
  readonly precioUnitario: number;
}

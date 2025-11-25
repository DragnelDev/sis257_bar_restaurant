import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsNumber, Min } from 'class-validator';

export class ItemVentaProductoDto {
  @ApiProperty({
    description: 'ID del Producto (Artículo sin elaboración) vendido.',
  })
  @IsDefined({ message: 'El campo idProducto debe estar definido' })
  @IsInt({ message: 'El campo idProducto debe ser un número entero' })
  readonly idProducto: number;

  @ApiProperty({ description: 'Cantidad de unidades del Producto vendidas.' })
  @IsDefined({ message: 'El campo cantidad debe estar definido' })
  @IsNumber({}, { message: 'El campo cantidad debe ser numérico' })
  @Min(0.001, { message: 'La cantidad debe ser mayor a cero' })
  readonly cantidad: number;

  @ApiProperty({ description: 'Precio unitario de venta final.' })
  @IsDefined({ message: 'El campo precioUnitarioVenta debe estar definido' })
  @IsNumber({}, { message: 'El campo precioUnitarioVenta debe ser numérico' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  readonly precioUnitario: number;
}

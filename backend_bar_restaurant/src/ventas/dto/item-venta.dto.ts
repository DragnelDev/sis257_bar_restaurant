import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsNumber, Min } from 'class-validator';

export class ItemVentaDto {
  @ApiProperty({ description: 'ID de la Receta (Plato/Bebida) vendida.' })
  @IsDefined({ message: 'El campo idReceta debe estar definido' })
  @IsInt({ message: 'El campo idReceta debe ser un número entero' })
  readonly idReceta: number;

  @ApiProperty({ description: 'Cantidad de unidades de la Receta vendidas.' })
  @IsDefined({ message: 'El campo cantidad debe estar definido' })
  @IsNumber({}, { message: 'El campo cantidad debe ser numérico' })
  @Min(0.001, { message: 'La cantidad debe ser mayor a cero' }) // Asegurar que sea positivo
  readonly cantidad: number;

  @ApiProperty({ description: 'Precio unitario de venta final.' })
  @IsDefined({ message: 'El campo precioUnitarioVenta debe estar definido' })
  @IsNumber({}, { message: 'El campo precioUnitarioVenta debe ser numérico' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  readonly precioUnitarioVenta: number;

  // NOTA: Se ha removido idVenta, ya que se asigna en el servicio.
}

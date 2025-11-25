import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDefined,
  IsInt,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// 1. DTO para CADA ÍTEM (basado en tu DetalleCompraDto)
export class ItemCompraDto {
  @ApiProperty({ description: 'ID del producto comprado.' })
  @IsDefined()
  @IsInt({ message: 'El campo idProducto debe ser un entero.' })
  readonly idProducto: number;

  @ApiProperty({ description: 'Cantidad de unidades compradas.' })
  @IsDefined()
  @IsNumber({}, { message: 'El campo cantidad debe ser numérico.' })
  @Min(1, { message: 'La cantidad debe ser al menos 1.' })
  readonly cantidad: number;

  @ApiProperty({ description: 'Precio unitario pagado por el producto.' })
  @IsDefined()
  @IsNumber({}, { message: 'El campo precioUnitarioCompra debe ser numérico.' })
  @Min(0, { message: 'El precio unitario no puede ser negativo.' })
  readonly precioUnitario: number;
}

// 2. DTO PRINCIPAL para la Transacción de Compra
export class CreateCompraDto {
  @ApiProperty({ description: 'ID del proveedor.' })
  @IsDefined({ message: 'El campo idProveedor debe estar definido' })
  @IsInt({ message: 'El campo idProveedor debe ser de tipo numérico' })
  readonly idProveedor: number;

  @ApiProperty({ description: 'ID del usuario que registra la compra.' })
  @IsDefined({ message: 'El campo idUsuario debe estar definido' })
  @IsInt({ message: 'El campo idUsuario debe ser de tipo numérico' })
  readonly idUsuario: number;

  @ApiProperty({ description: 'Número de factura de la compra.' })
  @IsDefined({ message: 'El campo numeroFactura debe estar definido' })
  readonly numeroFactura: string;

  @ApiProperty({ description: 'Fecha de recepción física de los productos.' })
  @IsDefined({ message: 'El campo fechaRecepcion debe estar definido' })
  @IsDateString(
    {},
    { message: 'El campo fecha de Recepción debe ser una fecha válida' },
  )
  readonly fechaRecepcion: string; // Usar string para fechas ISO/DateString

  // --- CAMPO DE LOS DETALLES (Maneja el array de ítems) ---

  @ApiProperty({
    type: [ItemCompraDto],
    description: 'Lista de productos incluidos en la compra.',
  })
  @IsArray({ message: 'El detalle de compra debe ser un array.' })
  @ValidateNested({ each: true })
  @Type(() => ItemCompraDto)
  readonly detalles: ItemCompraDto[];
}

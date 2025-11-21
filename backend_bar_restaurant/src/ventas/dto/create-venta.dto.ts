import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { ItemVentaDto } from './item-venta.dto';
import { Type } from 'class-transformer';

export class CreateVentaDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El campo Mesa no debe estar vacío' })
  @IsNumber({}, { message: 'El campo Mesa debe ser un número' })
  readonly idMesa: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo idUsuario no debe estar vacío' })
  @IsNumber({}, { message: 'El campo idUsuario debe ser un número' })
  readonly idUsuario: number;

  @ApiProperty({
    description: 'Total de la Venta. Puede ser calculado en el backend.',
  })
  @IsNotEmpty({ message: 'El campo total no debe estar vacío' })
  @IsNumber({}, { message: 'El campo total debe ser un número' })
  readonly total: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo estado no debe estar vacío' })
  @IsString({ message: 'El campo estado debe ser una cadena' })
  readonly estado: string;

  @ApiProperty({
    description: 'Tipo de pago de la venta (e.g., "EFECTIVO", "TARJETA").',
  })
  @IsNotEmpty({ message: 'El campo tipoPago no debe estar vacío' })
  @IsString({ message: 'El campo tipoPago debe ser una cadena' })
  readonly tipoPago: string;

  // --- Detalles de la Venta (CRÍTICO: El array anidado) ---

  @ApiProperty({
    type: [ItemVentaDto],
    description: 'Lista de ítems (Recetas) incluidos en la venta.',
  })
  @IsArray({ message: 'El detalle de venta debe ser un array.' })
  @ValidateNested({ each: true })
  @Type(() => ItemVentaDto)
  readonly detalles: ItemVentaDto[];

  // --- Campos Opcionales para Clientes Ocasionales ---
  /*@ApiProperty({
    description:
      'ID del Cliente asociado a la venta. Puede ser null si es un cliente ocasional.',
    nullable: true,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El campo idCliente debe ser un número' })*/
  readonly idCliente: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'El campo nitCI debe ser una cadena' })
  readonly nitCI?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'El campo nombreFiscal debe ser una cadena' })
  readonly nombreFiscal?: string;
}

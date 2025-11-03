import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsNumber } from 'class-validator';

export class CreateDetalleCompraDto {
  @ApiProperty()
  @IsDefined({ message: 'El campo idCompra debe estar definido' })
  @IsInt({ message: 'El campo idCompra debe ser de tipo numérico' })
  readonly idCompra: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo idProducto debe estar definido' })
  @IsInt({ message: 'El campo idProducto debe ser de tipo numérico' })
  readonly idProducto: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo cantidad debe estar definido' })
  @IsNumber({}, { message: 'El campo cantidad debe ser de tipo numérico' })
  readonly cantidad: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo precioUnitarioCompra debe estar definido' })
  @IsNumber(
    {},
    { message: 'El campo precioUnitarioCompra debe ser de tipo numérico' },
  )
  readonly precioUnitarioCompra: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo total debe estar definido' })
  @IsNumber({}, { message: 'El campo total debe ser de tipo numérico' })
  readonly subTotal: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsNumber } from 'class-validator';

export class CreateDetalleVentaDto {
  @ApiProperty()
  @IsDefined({ message: 'El campo idVenta debe estar definido' })
  @IsInt({ message: 'El campo idVenta debe ser de tipo numérico' })
  idVenta: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo idReceta debe estar definido' })
  @IsInt({ message: 'El campo idReceta debe ser de tipo numérico' })
  idReceta: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo cantidad debe estar definido' })
  @IsNumber({}, { message: 'El campo cantidad debe ser de tipo numérico' })
  cantidad: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo precioUnitarioVenta debe estar definido' })
  @IsNumber(
    {},
    { message: 'El campo precioUnitarioVenta debe ser de tipo numérico' },
  )
  precioUnitarioVenta: number;
}

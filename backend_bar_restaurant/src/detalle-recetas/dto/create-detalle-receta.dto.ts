import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsNumber } from 'class-validator';

export class CreateDetalleRecetaDto {
  @ApiProperty()
  @IsDefined({ message: 'El campo idReceta debe estar definido' })
  @IsInt({ message: 'El campo idReceta debe ser de tipo numérico' })
  idReceta: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo idProducto debe estar definido' })
  @IsInt({ message: 'El campo idProducto debe ser de tipo numérico' })
  idProducto: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo cantidadConsumida debe estar definido' })
  @IsNumber(
    {},
    { message: 'El campo cantidadConsumida debe ser de tipo numérico' },
  )
  cantidadConsumida: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDefined, IsInt, IsNumber } from 'class-validator';

export class CreateCompraDto {
  @ApiProperty()
  @IsDefined({ message: 'El campo total debe estar definido' })
  @IsNumber({}, { message: 'El campo total debe ser de tipo numérico' })
  readonly total: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo fechaCompra debe estar definido' })
  @IsDateString(
    {},
    { message: 'El campo fecha de Compra debe ser una fecha válida' },
  )
  readonly fechaCompra: Date;

  @ApiProperty()
  @IsDefined({ message: 'El campo idProveedor debe estar definido' })
  @IsInt({ message: 'El campo idProveedor debe ser de tipo numérico' })
  readonly idProveedor: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo idUsuario debe estar definido' })
  @IsInt({ message: 'El campo idUsuario debe ser de tipo numérico' })
  readonly idUsuario: number;
}

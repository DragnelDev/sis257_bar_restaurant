import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProductoDto {
  @ApiProperty()
  @IsDefined({ message: 'El campo idCategoria debe estar definido' })
  @IsInt({ message: 'El campo idCategoria debe ser de tipo numérico' })
  readonly idCategoria: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo nombre no debe estar vacío' })
  @IsString({ message: 'El campo nombre debe ser de tipo cadena' })
  @MaxLength(50, {
    message: 'El campo nombre no debe exceder los 50 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly nombre: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El campo descripcion no debe estar vacío' })
  @IsString({ message: 'El campo descripcion debe ser de tipo cadena' })
  @MaxLength(100, {
    message: 'El campo descripcion no debe exceder los 100 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly descripcion: string;

  @ApiProperty()
  @IsDefined({ message: 'El campo precioVenta debe estar definido' })
  @IsNumber({}, { message: 'El campo precioVenta debe ser de tipo numérico' })
  readonly precioVenta: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo stock debe estar definido' })
  @IsNumber({}, { message: 'El campo stock debe ser de tipo numérico' })
  readonly stock: number;
}

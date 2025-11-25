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

  @ApiProperty({ description: 'URL de la imagen representativa de la receta.' })
  @IsNotEmpty({ message: 'La URL de la imagen es obligatoria' })
  @IsString({ message: 'La URL de la imagen debe ser de tipo cadena' })
  @MaxLength(255, {
    message: 'La URL de la imagen no debe ser mayor a 255 caracteres',
  })
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : value,
  )
  readonly urlImagen: string;

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
  @IsDefined({ message: 'El campo idUnidadAlmacenamiento debe estar definido' })
  @IsInt({
    message: 'El campo idUnidadAlmacenamiento debe ser de tipo numérico',
  })
  readonly idUnidadAlmacenamiento: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo costoUnitarioPromedio debe estar definido' })
  @IsNumber(
    {},
    { message: 'El campo costoUnitarioPromedio debe ser de tipo numérico' },
  )
  readonly costoUnitarioPromedio: number;

  @ApiProperty()
  @IsDefined({ message: 'El campo perecedero debe estar definido' })
  readonly perecedero: boolean;

  @ApiProperty()
  @IsDefined({ message: 'El campo esVendible debe estar definido' })
  readonly esVendible: boolean;
}

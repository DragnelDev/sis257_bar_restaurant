import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateProveedorDto {
  @IsNotEmpty({ message: 'El campo el proveedor es obligatorio' })
  @MaxLength(50, {
    message: 'El campo del proveedor no puede tener más de 50 caracteres',
  })
  @IsString({ message: 'El campo del proveedor debe ser una cadena de texto' })
  nombre: string;
  @IsNotEmpty({ message: 'El campo NIT es obligatorio' })
  @MaxLength(14, {
    message: 'El campo NIT no puede tener más de 14 caracteres',
  })
  @IsString({ message: 'El campo NIT debe ser una cadena de texto' })
  nit: string;
  @IsNotEmpty({ message: 'El campo teléfono es obligatorio' })
  @IsNumber({}, { message: 'El campo teléfono debe ser un número' })
  @MaxLength(10, {
    message: 'El campo teléfono no puede tener más de 10 caracteres',
  })
  telefono: number;
}

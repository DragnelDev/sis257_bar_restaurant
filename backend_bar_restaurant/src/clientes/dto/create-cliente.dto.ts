import { ApiProperty } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty()
  readonly nombreFiscal: string;

  @ApiProperty()
  readonly nitCI: string;
}

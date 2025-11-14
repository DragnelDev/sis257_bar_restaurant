import { Controller, Get, Param } from '@nestjs/common';
import { DetalleComprasService } from './detalle-compras.service';

@Controller('detalle-compras')
export class DetalleComprasController {
  constructor(private readonly detalleComprasService: DetalleComprasService) {}

  @Get()
  findAll() {
    return this.detalleComprasService.findAll();
  }

  @Get('detailed-list')
  findAllDetailed() {
    return this.detalleComprasService.findAllDetailed();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleComprasService.findOne(+id);
  }
}

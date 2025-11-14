import { Controller, Get, Param } from '@nestjs/common';
import { DetalleVentasService } from './detalle-ventas.service';

@Controller('detalle-ventas')
export class DetalleVentasController {
  constructor(private readonly detalleVentasService: DetalleVentasService) {}

  @Get()
  findAll() {
    return this.detalleVentasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleVentasService.findOne(+id);
  }
}

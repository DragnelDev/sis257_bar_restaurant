import { Controller, Get, Param } from '@nestjs/common';
import { DetalleRecetasService } from './detalle-recetas.service';

@Controller('detalle-recetas')
export class DetalleRecetasController {
  constructor(private readonly detalleRecetasService: DetalleRecetasService) {}

  @Get()
  findAll() {
    return this.detalleRecetasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detalleRecetasService.findOne(+id);
  }
}

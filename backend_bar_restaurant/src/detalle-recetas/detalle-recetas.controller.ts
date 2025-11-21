import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DetalleRecetasService } from './detalle-recetas.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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

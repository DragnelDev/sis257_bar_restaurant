import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DetalleVentasService } from './detalle-ventas.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DetalleComprasService } from './detalle-compras.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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

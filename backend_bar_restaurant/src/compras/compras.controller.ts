import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';

@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  // Aplica la validación a nivel de controlador.
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  // Usa HttpCode para devolver 201 Created
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCompraDto: CreateCompraDto) {
    // La transacción completa (guardar compra + actualizar stock) ocurre aquí.
    return this.comprasService.create(createCompraDto);
  }

  @Get()
  findAll() {
    return this.comprasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comprasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompraDto: UpdateCompraDto) {
    return this.comprasService.update(+id, updateCompraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comprasService.remove(+id);
  }
}

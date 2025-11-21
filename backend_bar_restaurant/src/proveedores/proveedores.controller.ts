import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  create(@Body() CreateProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(CreateProveedorDto);
  }

  @Get()
  findAll() {
    return this.proveedoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProveedoreDto: UpdateProveedorDto,
  ) {
    return this.proveedoresService.update(+id, updateProveedoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proveedoresService.remove(+id);
  }
}

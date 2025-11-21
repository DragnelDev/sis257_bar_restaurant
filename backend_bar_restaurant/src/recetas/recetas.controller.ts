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
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recetas')
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @Post()
  create(@Body() createRecetaDto: CreateRecetaDto) {
    return this.recetasService.create(createRecetaDto);
  }

  @Get()
  findAll() {
    return this.recetasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recetasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecetaDto: UpdateRecetaDto) {
    return this.recetasService.update(+id, updateRecetaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recetasService.remove(+id);
  }
}

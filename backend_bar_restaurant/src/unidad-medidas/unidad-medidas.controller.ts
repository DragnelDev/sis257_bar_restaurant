import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UnidadMedidasService } from './unidad-medidas.service';
import { CreateUnidadMedidaDto } from './dto/create-unidad-medida.dto';
import { UpdateUnidadMedidaDto } from './dto/update-unidad-medida.dto';

@Controller('unidad-medidas')
export class UnidadMedidasController {
  constructor(private readonly unidadMedidasService: UnidadMedidasService) {}

  @Post()
  create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto) {
    return this.unidadMedidasService.create(createUnidadMedidaDto);
  }

  @Get()
  findAll() {
    return this.unidadMedidasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unidadMedidasService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUnidadMedidaDto: UpdateUnidadMedidaDto,
  ) {
    return this.unidadMedidasService.update(+id, updateUnidadMedidaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unidadMedidasService.remove(+id);
  }
}

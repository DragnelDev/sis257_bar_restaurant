import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MiembroEquiposService } from './miembro-equipos.service';
import { CreateMiembroEquipoDto } from './dto/create-miembro-equipo.dto';
import { UpdateMiembroEquipoDto } from './dto/update-miembro-equipo.dto';

@Controller('miembro-equipos')
export class MiembroEquiposController {
  constructor(private readonly miembroEquiposService: MiembroEquiposService) {}

  @Post()
  create(@Body() createMiembroEquipoDto: CreateMiembroEquipoDto) {
    return this.miembroEquiposService.create(createMiembroEquipoDto);
  }

  @Get()
  findAll() {
    return this.miembroEquiposService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.miembroEquiposService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMiembroEquipoDto: UpdateMiembroEquipoDto,
  ) {
    return this.miembroEquiposService.update(+id, updateMiembroEquipoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.miembroEquiposService.remove(+id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AsignacionReservasService } from './asignacion-reservas.service';
import { CreateAsignacionReservaDto } from './dto/create-asignacion-reserva.dto';
import { UpdateAsignacionReservaDto } from './dto/update-asignacion-reserva.dto';

@Controller('asignacion-reservas')
export class AsignacionReservasController {
  constructor(
    private readonly asignacionReservasService: AsignacionReservasService,
  ) {}

  @Post()
  create(@Body() createAsignacionReservaDto: CreateAsignacionReservaDto) {
    return this.asignacionReservasService.create(createAsignacionReservaDto);
  }

  @Get()
  findAll() {
    return this.asignacionReservasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asignacionReservasService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAsignacionReservaDto: UpdateAsignacionReservaDto,
  ) {
    return this.asignacionReservasService.update(
      +id,
      updateAsignacionReservaDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asignacionReservasService.remove(+id);
  }
}

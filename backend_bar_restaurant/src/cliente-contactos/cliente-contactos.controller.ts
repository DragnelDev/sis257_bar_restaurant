import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClienteContactosService } from './cliente-contactos.service';
import { CreateClienteContactoDto } from './dto/create-cliente-contacto.dto';
import { UpdateClienteContactoDto } from './dto/update-cliente-contacto.dto';

@Controller('cliente-contactos')
export class ClienteContactosController {
  constructor(
    private readonly clienteContactosService: ClienteContactosService,
  ) {}

  @Post()
  create(@Body() createClienteContactoDto: CreateClienteContactoDto) {
    return this.clienteContactosService.create(createClienteContactoDto);
  }

  @Get()
  findAll() {
    return this.clienteContactosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clienteContactosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClienteContactoDto: UpdateClienteContactoDto,
  ) {
    return this.clienteContactosService.update(+id, updateClienteContactoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clienteContactosService.remove(+id);
  }
}

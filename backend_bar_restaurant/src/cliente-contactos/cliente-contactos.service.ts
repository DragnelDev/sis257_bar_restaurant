import { Injectable } from '@nestjs/common';
import { CreateClienteContactoDto } from './dto/create-cliente-contacto.dto';
import { UpdateClienteContactoDto } from './dto/update-cliente-contacto.dto';

@Injectable()
export class ClienteContactosService {
  create(createClienteContactoDto: CreateClienteContactoDto) {
    return 'This action adds a new clienteContacto';
  }

  findAll() {
    return `This action returns all clienteContactos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clienteContacto`;
  }

  update(id: number, updateClienteContactoDto: UpdateClienteContactoDto) {
    return `This action updates a #${id} clienteContacto`;
  }

  remove(id: number) {
    return `This action removes a #${id} clienteContacto`;
  }
}

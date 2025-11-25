import { Module } from '@nestjs/common';
import { ClienteContactosService } from './cliente-contactos.service';
import { ClienteContactosController } from './cliente-contactos.controller';
import { ClienteContacto } from './entities/cliente-contacto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ClienteContacto])],
  controllers: [ClienteContactosController],
  providers: [ClienteContactosService],
})
export class ClienteContactosModule {}

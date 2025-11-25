import { Module } from '@nestjs/common';
import { AsignacionReservasService } from './asignacion-reservas.service';
import { AsignacionReservasController } from './asignacion-reservas.controller';
import { AsignacionReserva } from './entities/asignacion-reserva.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AsignacionReserva])],
  controllers: [AsignacionReservasController],
  providers: [AsignacionReservasService],
})
export class AsignacionReservasModule {}

import { Module } from '@nestjs/common';
import { MiembroEquiposService } from './miembro-equipos.service';
import { MiembroEquiposController } from './miembro-equipos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiembroEquipo } from './entities/miembro-equipo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MiembroEquipo])],
  controllers: [MiembroEquiposController],
  providers: [MiembroEquiposService],
})
export class MiembroEquiposModule {}

import { Module } from '@nestjs/common';
import { MiembroEquiposService } from './miembro-equipos.service';
import { MiembroEquiposController } from './miembro-equipos.controller';

@Module({
  controllers: [MiembroEquiposController],
  providers: [MiembroEquiposService],
})
export class MiembroEquiposModule {}

import { Module } from '@nestjs/common';
import { UnidadMedidasService } from './unidad-medidas.service';
import { UnidadMedidasController } from './unidad-medidas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadMedida } from './entities/unidad-medida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UnidadMedida])],
  controllers: [UnidadMedidasController],
  providers: [UnidadMedidasService],
})
export class UnidadMedidasModule {}

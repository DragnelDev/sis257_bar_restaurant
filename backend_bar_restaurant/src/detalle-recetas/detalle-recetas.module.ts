import { Module } from '@nestjs/common';
import { DetalleRecetasService } from './detalle-recetas.service';
import { DetalleRecetasController } from './detalle-recetas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleReceta } from './entities/detalle-receta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleReceta])],
  controllers: [DetalleRecetasController],
  providers: [DetalleRecetasService],
})
export class DetalleRecetasModule {}

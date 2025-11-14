import { Module } from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { RecetasController } from './recetas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receta } from './entities/receta.entity';
import { DetalleReceta } from 'src/detalle-recetas/entities/detalle-receta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Receta, DetalleReceta])],
  controllers: [RecetasController],
  providers: [RecetasService],
})
export class RecetasModule {}

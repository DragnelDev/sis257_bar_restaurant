import { Module } from '@nestjs/common';
import { DetalleRecetaService } from './detalle-recetas.service';
import { DetalleRecetasController } from './detalle-recetas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleReceta } from './entities/detalle-receta.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleReceta, Producto])],
  controllers: [DetalleRecetasController],
  providers: [DetalleRecetaService],
})
export class DetalleRecetasModule {}

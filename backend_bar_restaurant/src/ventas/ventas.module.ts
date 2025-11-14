import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleReceta } from 'src/detalle-recetas/entities/detalle-receta.entity';
import { DetalleVenta } from 'src/detalle-ventas/entities/detalle-venta.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Receta } from 'src/recetas/entities/receta.entity';
import { Venta } from './entities/venta.entity';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta, // Venta (Creación)
      DetalleVenta, // DetalleVenta (Creación)
      Producto, // Producto (Actualización de stock)
      Receta, // Receta (Consulta)
      DetalleReceta,
    ]),
  ],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}

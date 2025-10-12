import { Module } from '@nestjs/common';
import { DetalleVentasService } from './detalle-ventas.service';
import { DetalleVentasController } from './detalle-ventas.controller';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleVenta])],
  controllers: [DetalleVentasController],
  providers: [DetalleVentasService],
})
export class DetalleVentasModule {}

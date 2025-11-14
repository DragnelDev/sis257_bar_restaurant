import { Module } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compra } from './entities/compra.entity';
import { DetalleCompra } from 'src/detalle-compras/entities/detalle-compra.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Compra, DetalleCompra, Producto])],
  controllers: [ComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}

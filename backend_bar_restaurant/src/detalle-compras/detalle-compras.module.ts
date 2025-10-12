import { Module } from '@nestjs/common';
import { DetalleComprasService } from './detalle-compras.service';
import { DetalleComprasController } from './detalle-compras.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleCompra } from './entities/detalle-compra.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleCompra])],
  controllers: [DetalleComprasController],
  providers: [DetalleComprasService],
})
export class DetalleComprasModule {}

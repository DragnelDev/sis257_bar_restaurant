import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ComprasModule } from './compras/compras.module';
import { DetalleComprasModule } from './detalle-compras/detalle-compras.module';
import { DetalleVentasModule } from './detalle-ventas/detalle-ventas.module';
import { MesasModule } from './mesas/mesas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VentasModule } from './ventas/ventas.module';
import { EmpleadosModule } from './empleados/empleados.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '*/**/entities/*.{ts|js}'],
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProductosModule,
    CategoriasModule,
    ProveedoresModule,
    ComprasModule,
    DetalleComprasModule,
    DetalleVentasModule,
    MesasModule,
    UsuariosModule,
    VentasModule,
    EmpleadosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

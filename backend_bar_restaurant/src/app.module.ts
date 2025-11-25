import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AsignacionReservasModule } from './asignacion-reservas/asignacion-reservas.module';
import { AuthModule } from './auth/auth.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ClienteContactosModule } from './cliente-contactos/cliente-contactos.module';
import { ClientesModule } from './clientes/clientes.module';
import { ComprasModule } from './compras/compras.module';
import { DetalleComprasModule } from './detalle-compras/detalle-compras.module';
import { DetalleRecetasModule } from './detalle-recetas/detalle-recetas.module';
import { DetalleVentasModule } from './detalle-ventas/detalle-ventas.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { MesasModule } from './mesas/mesas.module';
import { MiembroEquiposModule } from './miembro-equipos/miembro-equipos.module';
import { ProductosModule } from './productos/productos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { RecetasModule } from './recetas/recetas.module';
import { ReservasModule } from './reservas/reservas.module';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { TestimoniosModule } from './testimonios/testimonios.module';
import { UnidadMedidasModule } from './unidad-medidas/unidad-medidas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VentasModule } from './ventas/ventas.module';
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
      entities: [__dirname + '/**/entities/*{.ts,.js}'],
      autoLoadEntities: true,
      synchronize: true,
    }),
    EmpleadosModule,
    UsuariosModule,
    AuthModule,
    ProveedoresModule,
    CategoriasModule,
    ProductosModule,
    ComprasModule,
    DetalleComprasModule,
    RecetasModule,
    DetalleRecetasModule,
    MesasModule,
    VentasModule,
    DetalleVentasModule,
    ClientesModule,
    UnidadMedidasModule,
    SuscripcionesModule,
    ClienteContactosModule,
    TestimoniosModule,
    ReservasModule,
    AsignacionReservasModule,
    MiembroEquiposModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

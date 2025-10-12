import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
<<<<<<< HEAD
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
=======
>>>>>>> 04ce6a9faece93539df60e77f84dd41fc49d77e4

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
      synchronize: true,
<<<<<<< HEAD
    }),
    ProductosModule,
    CategoriasModule,
    ProveedoresModule,
=======
      autoLoadEntities: true,
    }),
>>>>>>> 04ce6a9faece93539df60e77f84dd41fc49d77e4
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

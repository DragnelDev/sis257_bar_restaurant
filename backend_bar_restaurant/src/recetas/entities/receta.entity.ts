import { DetalleReceta } from 'src/detalle-recetas/entities/detalle-receta.entity';
import { DetalleVenta } from 'src/detalle-ventas/entities/detalle-venta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('recetas')
export class Receta {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 100, unique: true, name: 'nombre_receta' })
  nombreReceta: string;

  @Column('varchar', { length: 255, nullable: true })
  descripcion: string;

  @Column('numeric', { precision: 10, scale: 2, name: 'precio_venta_actual' })
  precioVentaActual: number;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    name: 'costo_actual',
    default: 0,
  })
  costoActual: number;

  @Column('varchar', { length: 50, nullable: true })
  categoria: string;

  @Column('varchar', { length: 255, nullable: true, name: 'url_imagen' })
  urlImagen: string;

  // Columnas de auditoria
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  // Relación: Una Receta tiene muchos ingredientes (detalles)
  @OneToMany(() => DetalleReceta, (detalle) => detalle.receta)
  ingredientes: DetalleReceta[];

  // Relación: Una Receta puede estar en muchos detalles de venta
  @OneToMany(() => DetalleVenta, (detalle) => detalle.receta)
  detallesVenta: DetalleVenta[];
}

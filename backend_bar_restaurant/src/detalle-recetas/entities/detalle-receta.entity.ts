import { Producto } from 'src/productos/entities/producto.entity';
import { Receta } from 'src/recetas/entities/receta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('detalle_recetas')
export class DetalleReceta {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('integer', { name: 'id_receta' })
  idReceta: number;

  @Column('integer', { name: 'id_producto' })
  idProducto: number;

  // Cantidad de la materia prima que se consume para hacer UNA unidad de la Receta/Plato
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 3,
    name: 'cantidad_consumida',
  })
  cantidadConsumida: number;

  @Column('varchar', { length: 30, name: 'unidad_consumo' })
  unidadConsumo: string;

  // Columnas de auditoria
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  // Relación N:1 (Muchos detalles de receta a una sola Receta)
  @ManyToOne(() => Receta, (receta) => receta.ingredientes)
  @JoinColumn({ name: 'id_receta', referencedColumnName: 'id' })
  receta: Receta;

  // Relación N:1 (Muchos detalles de receta a un solo Producto/Materia Prima)
  @ManyToOne(() => Producto, (producto) => producto.detallesReceta)
  @JoinColumn({ name: 'id_producto', referencedColumnName: 'id' })
  producto: Producto;
}

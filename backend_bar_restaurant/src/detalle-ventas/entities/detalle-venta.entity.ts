import { Receta } from 'src/recetas/entities/receta.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
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

@Entity('detalle_ventas')
export class DetalleVenta {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer', { name: 'id_venta' })
  idVenta: number;

  @Column('integer', { name: 'id_receta' })
  idReceta: number;

  @Column('int')
  cantidad: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'precio_unitario_venta',
  })
  precioUnitarioVenta: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'costo_unitario' })
  costo_unitario: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @ManyToOne(() => Venta, (venta) => venta.detalleVentas)
  @JoinColumn({ name: 'id_venta', referencedColumnName: 'id' })
  venta: Venta;

  // Relación N:1 (El detalle de venta hace referencia a la Receta/Plato vendido)
  @ManyToOne(() => Receta, (receta) => receta.detallesVenta)
  @JoinColumn({ name: 'id_receta', referencedColumnName: 'id' })
  receta: Receta;
}

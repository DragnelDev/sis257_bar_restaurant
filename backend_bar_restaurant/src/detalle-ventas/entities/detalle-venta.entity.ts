import { Producto } from 'src/productos/entities/producto.entity';
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

  @Column('integer', { name: 'id_receta', nullable: true })
  idReceta: number;

  @Column('integer', { name: 'id_producto', nullable: true })
  idProducto: number;

  @Column('int')
  cantidad: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'precio_unitario',
  })
  precioUnitario: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'costo_unitario' })
  costoUnitario: number;

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

  @ManyToOne(() => Producto, (producto) => producto.detalleVentas)
  @JoinColumn({ name: 'id_producto', referencedColumnName: 'id' })
  producto: Producto;
}

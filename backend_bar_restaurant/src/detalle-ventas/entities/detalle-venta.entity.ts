import { Compra } from 'src/compras/entities/compra.entity';
import { Producto } from 'src/productos/entities/producto.entity';
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

  @Column('integer', { name: 'id_producto' })
  idProducto: number;

  @Column('int')
  cantidad: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'precio_unitario_venta',
  })
  precioUnitarioVenta: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
  @ManyToOne(() => Compra, (compra) => compra.detalleVentas)
  @JoinColumn({ name: 'id_compra', referencedColumnName: 'id' })
  compra: Compra;
  
  @ManyToOne(() => Producto, (producto) => producto.detalleVentas)
  @JoinColumn({ name: 'id_producto', referencedColumnName: 'id' })
  producto: Producto;
}

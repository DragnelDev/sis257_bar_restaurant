import { Compra } from 'src/compras/entities/compra.entity';
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

@Entity('detalle_compras')
export class DetalleCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer', { name: 'id_compra' })
  idCompra: number;

  @Column('integer', { name: 'id_producto' })
  idProducto: number;

  @Column('int')
  cantidad: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    name: 'precio_unitario_compra',
  })
  precioUnitarioCompra: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @ManyToOne(() => Compra, (compra) => compra.detalles)
  @JoinColumn({ name: 'id_compra', referencedColumnName: 'id' })
  compra: Compra;
}

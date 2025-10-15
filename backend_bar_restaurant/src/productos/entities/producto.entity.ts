import { Categoria } from 'src/categorias/entities/categoria.entity';
import { DetalleCompra } from 'src/detalle-compras/entities/detalle-compra.entity';
import { DetalleVenta } from 'src/detalle-ventas/entities/detalle-venta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('integer', { name: 'id_categoria' })
  idCategoria: number;

  @Column('varchar', { length: 50 })
  nombre: string;

  @Column('varchar', { length: 100 })
  descripcion: string;

  @Column('decimal', { name: 'precio_venta' })
  precioVenta: number;

  @Column('integer')
  stock: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  @JoinColumn({ name: 'id_categoria', referencedColumnName: 'id' })
  categoria: Categoria;

  @OneToMany(() => DetalleCompra, (detalleCompra) => detalleCompra.producto)
  detalleCompras: DetalleCompra[];
  @OneToMany(()=> DetalleVenta, (detalleVenta) => detalleVenta.producto)
  detalleVentas: DetalleVenta[];
}

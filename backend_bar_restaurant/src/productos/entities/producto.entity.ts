import { Categoria } from 'src/categorias/entities/categoria.entity';
import { DetalleCompra } from 'src/detalle-compras/entities/detalle-compra.entity';
import { DetalleReceta } from 'src/detalle-recetas/entities/detalle-receta.entity';
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

  @Column('varchar', { length: 30, name: 'unidad_medida' })
  unidadMedida: string;

  // El stock actual. Se usa 'numeric' para precisión con decimales.
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 3,
    default: 0,
    name: 'stock_actual',
  })
  stockActual: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 3,
    default: 10,
    name: 'stock_minimo',
  })
  stockMinimo: number;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    name: 'costo_promedio_unitario',
  })
  costoUnitarioPromedio: number;

  @Column('boolean', { default: false })
  perecedero: boolean;

  // Columnas de auditoria
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

  // Relación inversa con RecetaDetalle
  @OneToMany(() => DetalleReceta, (detalle) => detalle.producto)
  detallesReceta: DetalleReceta[];
}

import { Producto } from 'src/productos/entities/producto.entity';
import { Receta } from 'src/recetas/entities/receta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 20 })
  nombre: string;

  @Column('varchar', { length: 20, name: 'tipo_categoria' })
  tipoCategoria: 'INVENTARIO' | 'MENÚ';

  @Column('varchar', { length: 120 })
  descripcion: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];

  @OneToMany(() => Receta, (receta) => receta.categoria)
  recetas: Receta[];
}

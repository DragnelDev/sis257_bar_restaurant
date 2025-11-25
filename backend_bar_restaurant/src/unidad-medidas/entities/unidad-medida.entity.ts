import { DetalleReceta } from 'src/detalle-recetas/entities/detalle-receta.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('unidad_medidas')
export class UnidadMedida {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 50, unique: true })
  nombre: string; // Ej: Kilogramo, Gramo, Litro, Onza, Unidad

  @Column('varchar', { length: 10, unique: true })
  simbolo: string; // Ej: kg, g, L, oz, und

  // Factor de conversión respecto a la unidad base de su grupo (ej. 1000 si la base es el gramo y esta es el kilogramo)
  /*@Column('numeric', {
    precision: 10,
    scale: 5,
    name: 'factor_conversion',
    default: 1,
  })
  factorConversion: number;*/

  // --- Relaciones inversas ---

  // 1. Relación inversa con Producto (Unidad de Almacenamiento)
  @OneToMany(() => Producto, (producto) => producto.unidadAlmacenamiento)
  productosAlmacenados: Producto[];

  // 2. Relación inversa con DetalleReceta (Unidad de Consumo)
  @OneToMany(() => DetalleReceta, (detalle) => detalle.unidadConsumo)
  detallesConsumo: DetalleReceta[];

  // --- Auditoría ---
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}

import { Venta } from 'src/ventas/entities/venta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('mesas')
export class Mesa {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 10, name: 'numero_mesa ' })
  numeroMesa: number;

  @Column('int', { name: 'capacidad ' })
  capacidad: number;

  @Column('varchar', { length: 10, name: 'estado ' })
  estado: string;

  // Columnas de Auditoria
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Venta, (venta) => venta.mesa)
  ventas: Venta[];
}

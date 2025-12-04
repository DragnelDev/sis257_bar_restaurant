import { AsignacionReserva } from 'src/asignacion-reservas/entities/asignacion-reserva.entity';
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

  @Column('int', { name: 'numero_mesa' })
  numeroMesa: number;

  @Column('int', { name: 'capacidad' })
  capacidad: number;

  @Column('varchar', { length: 10, default: 'DISPONIBLE' })
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

  @OneToMany(
    () => AsignacionReserva,
    (asignacionReserva) => asignacionReserva.mesa,
  )
  asignacion: AsignacionReserva[];
}

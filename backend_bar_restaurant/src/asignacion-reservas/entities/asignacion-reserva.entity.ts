import { Mesa } from 'src/mesas/entities/mesa.entity';
import { Reserva } from 'src/reservas/entities/reserva.entity';
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

@Entity('asignacion_reservas')
export class AsignacionReserva {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('integer', { name: 'id_reserva' })
  idReserva: number;

  @Column('integer', { name: 'id_mesa' })
  idMesa: number;

  @Column('date', { name: 'fecha_asignacion' })
  fechaAsignacion: Date;

  //Columnas de Auditoria
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  // RELACIÓN N:1 con RESERVAS
  @ManyToOne(() => Reserva, (reserva) => reserva.reservas)
  @JoinColumn({ name: 'id_reserva', referencedColumnName: 'id' })
  reservas: Reserva;

  // RELACIÓN N:1 con MESAS (Table)
  @ManyToOne(() => Mesa, (mesa) => mesa.asignacion)
  @JoinColumn({ name: 'id_mesa', referencedColumnName: 'id' })
  mesa: Mesa;
}

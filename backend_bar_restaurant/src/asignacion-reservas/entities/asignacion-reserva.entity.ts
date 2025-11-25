import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('asignacion_reservas')
export class AsignacionReserva {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int')
  idUsuario: number;

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
}

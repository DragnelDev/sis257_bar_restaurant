import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 100 })
  nombre: string;

  @Column('varchar', { length: 100 })
  email: string;

  @Column('date', { name: 'fecha_reserva' })
  fechaReserva: Date;

  @Column('int', { name: 'cantidad_personas' })
  cantidadPersonas: number;

  @Column('varchar', {
    length: 200,
    name: 'solicitud_especial',
    nullable: true,
  })
  solicitudEspecial: string;

  @Column({
    length: 50,
    default: 'pendiente',
    enum: ['pendiente', 'confirmada', 'cancelada'],
  })
  estado: string;

  //Columnas de Auditoria
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}

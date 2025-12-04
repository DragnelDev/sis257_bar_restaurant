import { AsignacionReserva } from 'src/asignacion-reservas/entities/asignacion-reserva.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_usuario' })
  idUsuario: number;

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

  // RELACIÓN 1:N con ASIGNACION_RESERVAS
  @OneToMany(
    () => AsignacionReserva,
    (asignacionReserva) => asignacionReserva.reservas,
  )
  reservas: AsignacionReserva[];

  // RELACIÓN N:M con USUARIOS
  @ManyToMany(() => Usuario, (usuario) => usuario.reservas)
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id' })
  usuarios: Usuario;
}

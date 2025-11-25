import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('suscripciones')
export class Suscripcion {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int')
  idUsuario: number;

  @Column('varchar', { length: 100 })
  email: string;

  @Column('boolean', { default: true })
  activo: boolean;

  @Column('date', { name: 'fecha_suscripcion' })
  fechaSuscipcion: Date;

  //Columnas de Auditoria
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}

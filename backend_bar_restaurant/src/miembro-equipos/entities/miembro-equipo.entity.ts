import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('miembro_equipos')
export class MiembroEquipo {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int')
  idUsuario: number;

  @Column('integer', { name: 'id_equipo' })
  idEmpleado: number;

  @Column('varchar', { name: 'desiganacion', length: 30 })
  desiganacion: string;

  @Column('varchar', { name: 'imagen_url', length: 255 })
  imagenUrl: string;

  @Column('text', { name: 'biografia' })
  biografia: string;

  @Column('varchar', { length: 100, nullable: true })
  facebook: string;

  @Column('varchar', { length: 100, nullable: true })
  twitter: string;

  @Column('varchar', { length: 100, nullable: true })
  instagram: string;

  // Columnas de auditoria
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}

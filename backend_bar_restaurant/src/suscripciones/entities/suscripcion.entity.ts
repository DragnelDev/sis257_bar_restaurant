import { Usuario } from 'src/usuarios/entities/usuario.entity';
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

@Entity('suscripciones')
export class Suscripcion {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_usuario' })
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

  // RELACIÓN N:1 con USUARIOS (User)
  @ManyToOne(() => Usuario, (usuario) => usuario.suscripciones)
  @JoinColumn({ name: 'id_Usuario', referencedColumnName: 'id' }) // Indica la columna FK en esta tabla
  usuario: Usuario;
}

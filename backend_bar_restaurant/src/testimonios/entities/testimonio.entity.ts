import { Usuario } from 'src/usuarios/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('testimonios')
export class Testimonio {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_usuario' })
  idUsuario: number;

  @Column('varchar', { length: 80 })
  nombre: string;

  @Column('varchar', { length: 20 })
  profecion: string;

  @Column('text')
  reseña: string;

  @Column('varchar', { length: 255, nullable: true })
  imagen?: string;

  @Column('int')
  rating: number;

  @Column('boolean', { default: false })
  aprobado: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'fecha_creacion',
  })
  fechaCreacion: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'fecha_aprobacion',
  })
  fechaAprobacion: Date;

  @OneToMany(() => Usuario, (usuario) => usuario.testimonios)
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id' })
  usuario: Usuario;
}

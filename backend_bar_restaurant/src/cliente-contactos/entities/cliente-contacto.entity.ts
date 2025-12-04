import { Usuario } from 'src/usuarios/entities/usuario.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('cliente_contactos')
export class ClienteContacto {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_usuario' })
  idUsuario: number;

  @Column('varchar', { length: 80 })
  nombre: string;

  @Column('varchar', { length: 50 })
  email: string;

  @Column('varchar', { length: 100 })
  asunto: string;

  @Column('text')
  mensaje: string;

  @Column('boolean', { default: false })
  leido: boolean;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  fechaRecepcion: Date;

  @OneToMany(() => Usuario, (usuario) => usuario.clienteContactos)
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id' })
  usuario: Usuario;
}

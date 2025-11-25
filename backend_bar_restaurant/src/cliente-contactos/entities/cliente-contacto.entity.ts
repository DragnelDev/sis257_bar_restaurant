import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cliente_contactos')
export class ClienteContacto {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int')
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
}

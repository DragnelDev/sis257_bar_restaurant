import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('testimonios')
export class Testimonio {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int')
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
}

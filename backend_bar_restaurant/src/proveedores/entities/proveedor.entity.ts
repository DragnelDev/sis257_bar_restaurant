import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 50, name: 'nombre' })
  nombre: string;

  @Column('varchar', { length: 100, name: 'nit' })
  nit: string;

  @Column('varchar', { length: 100, name: 'telefono' })
  telefono: number;
}

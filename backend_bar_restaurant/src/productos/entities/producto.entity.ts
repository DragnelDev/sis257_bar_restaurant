import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 50, name: 'nombre' })
  nombre: string;

  @Column('varchar', { length: 100, name: 'descripcion' })
  descripcion: string;

  @Column('varchar', { length: 50, name: 'precio_venta' })
  precio_venta: number;

  @Column('varchar', { length: 50, name: 'stock' })
  stock: string;
}

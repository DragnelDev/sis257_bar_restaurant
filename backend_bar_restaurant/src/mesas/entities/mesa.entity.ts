import { Venta } from 'src/ventas/entities/venta.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mesas')
export class Mesa {
  @PrimaryGeneratedColumn('identity')
  id: number;
  @Column('varchar', { length: 10, name: 'numero_mesa ' })
  numeroMesa: number;
  @Column('int', { name: 'capacidad ' })
  capacidad: number;
  @Column('varchar', { length: 10, name: 'estado ' })
  estado: string;
  fechaCreacion: Date;
  fechaModificacion: Date;
  fechaEliminacion: Date;
  @OneToMany(() => Venta, (venta) => Venta.mesa)
  ventas: Venta[];
}

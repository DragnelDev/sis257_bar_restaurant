import { Compra } from 'src/compras/entities/compra.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { name: 'nombre_empresa', length: 50 })
  nombreEmpresa: string;

  @Column('varchar', { length: 14 })
  nit: string;

  @Column('varchar', { length: 50 })
  responsable: string;

  @Column('varchar', { length: 60 })
  direccion: string;

  @Column('varchar', { length: 12 })
  celular: string;

  @Column('varchar', { length: 50 })
  email: string;

  @Column('varchar', { name: 'condicion_pago', length: 80 })
  condicionPago: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Compra, (compra) => compra.proveedor)
  compras: Compra[];
}

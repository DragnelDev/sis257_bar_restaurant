import { Compra } from 'src/compras/entities/compra.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 15, nullable: true })
  usuario: string;

  @Column('varchar', { length: 100, name: 'contraseña ' })
  contraseña: string;

  @Column('varchar', { length: 15 })
  rol: string;

  @Column('varchar', { length: 70, name: 'correo_electronico ' })
  correoElectronico: string;

  @Column('boolean', { name: 'activo', default: false })
  activo: boolean;

  // Columnas de Auditoria
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Venta, (venta) => venta.usuario)
  ventas: Venta[];

  @OneToMany(() => Compra, (compra) => compra.usuario)
  compras: Compra[];
}

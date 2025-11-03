import { Compra } from 'src/compras/entities/compra.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('integer', { name: 'id_empleado' })
  idEmpleado: number;

  @Column('varchar', { length: 15, nullable: true })
  usuario: string;

  @Column('varchar', { length: 100, name: 'contraseña ' })
  contraseña: string;

  @Column('boolean', { name: 'activo', default: true })
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

  @ManyToOne(() => Empleado, (empleado) => empleado.usuarios)
  @JoinColumn({ name: 'id_empleado', referencedColumnName: 'id' })
  empleado: Empleado;
}

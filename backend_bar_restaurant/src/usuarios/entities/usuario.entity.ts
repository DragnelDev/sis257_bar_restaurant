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

  @Column('varchar', { length: 10, name: 'nombre_usuario ' })
  username: string;

  @Column('varchar', { length: 100, name: 'contraseña ' })
  password: string;

  @Column('varchar')
  rol: string;

  @Column('varchar', { length: 100, name: 'correo_electronico ' })
  email: string;

  @Column('boolean', { name: 'activo', default: false })
  active: boolean;

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

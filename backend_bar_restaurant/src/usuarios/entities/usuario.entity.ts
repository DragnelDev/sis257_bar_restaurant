import { compare, genSalt, hash } from 'bcrypt';
import { Compra } from 'src/compras/entities/compra.entity';
import { Empleado } from 'src/empleados/entities/empleado.entity';
import { Venta } from 'src/ventas/entities/venta.entity';
import {
  BeforeInsert,
  BeforeUpdate,
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

  @Column('varchar', { length: 100 })
  clave: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['CAJERO', 'ADMINISTRADOR', 'CONTADOR', 'CHEF', 'MESERO'],
  })
  rol: string;

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

  //Hash contraseña antes de guardar en la base de datos
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    const salt = await genSalt();
    this.clave = await hash(this.clave, salt);
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return compare(plainPassword, this.clave);
  }
}

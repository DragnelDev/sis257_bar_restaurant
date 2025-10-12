import { DetalleCompra } from 'src/detalle-compras/entities/detalle-compra.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'fecha_compra' })
  fechaCompra: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('int', { name: 'id_proveedor' })
  idProveedor: number;

  @Column('int', { name: 'id_usuario' })
  idUsuario: number;

  //Columnas de Auditoria
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => DetalleCompra, (detalle) => detalle.compra)
  detalles: DetalleCompra[];
}

import { DetalleCompra } from 'src/detalle-compras/entities/detalle-compra.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
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

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_proveedor' })
  idProveedor: number;

  @Column('int', { name: 'id_usuario' })
  idUsuario: number;

  @Column('date', { name: 'fecha_compra', default: () => 'CURRENT_DATE' })
  fechaCompra: Date;

  @Column('varchar', { name: 'numero_factura', length: 8 })
  numeroFactura: string;

  @Column('date', { name: 'fecha_recepcion' })
  fechaRecepcion: Date;

  //Columnas de Auditoria
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => DetalleCompra, (detalleCompra) => detalleCompra.compra)
  detalleCompras: DetalleCompra[];

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.compras)
  @JoinColumn({ name: 'id_proveedor', referencedColumnName: 'id' })
  proveedor: Proveedor;

  @ManyToOne(() => Usuario, (usuario) => usuario.compras)
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id' })
  usuario: Usuario;
}

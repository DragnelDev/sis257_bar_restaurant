import { DetalleVenta } from 'src/detalle-ventas/entities/detalle-venta.entity';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('decimal', { precision: 10, scale: 2 })
  total: number;
  @Column({ type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado: string;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;
  @CreateDateColumn()
  fechaCreacion: Date;
  static mesa: any;
  @ManyToOne(()=> Mesa, (mesa) => mesa.ventas)
  @JoinColumn({ name: 'id_mesa', referencedColumnName: 'id' })
  mesa: Mesa;
  
  @ManyToOne(() => Usuario, (usuario) => usuario.ventas)
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id' })
  usuario: Usuario;

  @OneToMany(() => DetalleVenta, (detalleVenta) => detalleVenta.venta)
  detalleVentas: DetalleVenta[];
}



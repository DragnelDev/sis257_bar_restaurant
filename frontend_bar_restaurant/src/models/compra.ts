import type { Proveedor } from './Proveedor'
import type { Usuario } from './Usuario'

export interface Compra {
  id: number
  idProveedor: number // Clave foránea
  idUsuario: number // Clave foránea (quién realizó la compra)
  // fechaCompra puede venir como string desde la API o como Date
  fechaCompra: string | Date | null

  // Opcionalmente puedes agregar las relaciones para modelos de datos más completos:
  // Campos usados en UI
  total?: number

  // Relaciones opcionales
  proveedor?: Proveedor
  usuario?: Usuario
}

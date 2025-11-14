import type { Compra } from './Compra'
import type { Producto } from './producto'

export interface DetalleCompra {
  id: number
  idCompra: number
  idProducto: number
  cantidad: number
  precioUnitarioCompra: number
  subTotal: number

  // Opcionalmente:
  compra?: Compra
  producto?: Producto
}

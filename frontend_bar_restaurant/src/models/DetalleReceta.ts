import type { Producto } from './producto'
import type { Receta } from './Receta'

export interface DetalleReceta {
  idReceta: number
  idProducto: number
  cantidad: number

  Receta?: Receta
  Producto?: Producto
}

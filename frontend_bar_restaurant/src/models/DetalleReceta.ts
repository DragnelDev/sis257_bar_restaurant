import type { Producto } from './producto'
import type { Receta } from './Receta'

export interface DetalleReceta {
  id: number
  idReceta: number
  idProducto: number
  cantidadConsumida: number

  receta: Receta
  producto: Producto
}

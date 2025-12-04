import type { Cliente } from './Cliente'
import type { Mesa } from './Mesa'
import type { Producto } from './producto'
import type { Receta } from './Receta'
import type { Usuario } from './Usuario'

export interface Venta {
  id: number
  idMesa?: number
  idUsuario?: number
  total?: string | number
  estado?: string
  tipoPago?: string
  fecha?: string

  requiereFactura?: boolean
  nitCI?: string | null
  nombreFiscal?: string | null

  // Aceptamos distintos formatos que vienen del backend: `detalles`, `detalleVentas`, `detallesVenta`, etc.
  detalles?: DetalleVentaItem[]
  detalleVentas?: DetalleVentaItem[]

  fechaCreacion?: string
  mesa?: Mesa | null
  cliente?: Cliente | null
  usuario?: Usuario | null
}

// Ítem individual del Detalle de Venta: permitimos varias formas y nombres de campo para ser robustos
export interface DetalleVentaItem {
  // identificadores
  idReceta?: number
  idProducto?: number

  // nombres alternativos
  name?: string
  nombreProducto?: string
  nombre?: string

  // precios (pueden venir como string o number según backend)
  price?: number | string
  precio?: number | string
  precio_unitario?: number | string
  precioUnitario?: number | string
  precioUnitarioVenta?: number | string

  // cantidades
  quantity?: number
  cantidad?: number
  cantidadVenta?: number

  subtotal?: number | string

  // costo para cálculos
  costoUnitario?: number | string

  // objeto relacionado (producto/receta)
  producto: Producto
  receta: Receta
}

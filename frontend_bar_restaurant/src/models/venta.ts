import type { Cliente } from "./Cliente"
import type { Mesa } from "./Mesa"
import type { Usuario } from "./Usuario"

export interface Venta {
  id: number
  idMesa: number
  idUsuario: number
  total: number
  estado: 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'PAGADA' | 'CANCELADA' | string // Ejemplo de estados
  tipoPago: 'EFECTIVO' | 'TARJETA' | 'QR' | string
  fecha: string // Tipo fecha/hora

  // Campos fiscales
  requiereFactura: boolean
  nitCI: string | null
  nombreFiscal: string | null

  // Relación con el detalle (siempre necesaria en el historial)
  detalles: DetalleVentaItem[]

  fechaCreacion: string
  mesa: Mesa | null
  cliente: Cliente | null
  usuario: Usuario | null
}

// Ítem individual del Detalle de Venta (Carrito)
export interface DetalleVentaItem {
  idReceta: number // Clave foránea al ítem vendido
  name: string
  price: number
  quantity: number
  subtotal: number
}

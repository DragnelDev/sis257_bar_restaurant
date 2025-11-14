import type { Proveedor } from './Proveedor'
import type { Usuario } from './Usuario'

export interface Compra {
  id: number
  idProveedor: number
  idUsuario: number
  fechaCompra: Date | string // Tipo fecha
  numeroFactura: string
  fechaRecepcion: Date | string
  total: number

  // Detalles de la compra
  detalles: [
    {
      idProducto: number
      cantidad: number
      precioUnitarioCompra: number
    },
  ]

  // Relaciones opcionales
  proveedor?: Proveedor
  usuario?: Usuario
}

// Para el cuerpo de cada item de la compra
export interface CreateDetalleCompraDto {
  idProducto: number
  cantidad: number
  precioUnitarioCompra: number
}

// Para el cuerpo principal de la compra (POST /compras)
export interface CreateCompraDto {
  idProveedor: number
  idUsuario: number
  fechaCompra: string | Date
  numeroFactura: string
  fechaRecepcion: string | Date
  detalles: CreateDetalleCompraDto[]
}

export interface Venta {
  id: number
  idMesa: number
  idUsuario: number
  total: number
  estado: 'PENDIENTE' | 'PAGADA' | 'CANCELADA' | string // Ejemplo de estados
  tipoPago: string
  fecha: string // Tipo fecha/hora
}

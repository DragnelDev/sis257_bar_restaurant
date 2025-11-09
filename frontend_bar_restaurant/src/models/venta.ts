export interface Venta {
  id: number
  idMesa: number | null // Clave foránea (puede ser nula si no es un restaurante)
  idUsuario: number // Clave foránea
  total: number
  estado: 'PENDIENTE' | 'PAGADA' | 'CANCELADA' | string // Ejemplo de estados
  fecha: Date

  // No incluimos el detalle_ventas aquí para evitar un objeto demasiado grande,
  // pero lo definimos por separado (ver abajo).
}

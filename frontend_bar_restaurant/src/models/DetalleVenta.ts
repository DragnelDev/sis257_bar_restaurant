export interface DetalleVenta {
  idVenta: number
  idProducto: number
  cantidad: number
  precioUnitarioVenta: number
  fechaCreacion: Date
  fechaModificacion: Date
  fechaEliminacion: Date | null

  // A menudo es útil vincular el detalle a sus entidades completas:
  // venta?: Venta;
  // producto?: Producto;
}

export interface DetalleVenta {
  idVenta: number
  idReceta: number
  cantidad: number
  precioUnitarioVenta: NumberConstructor

  // A menudo es útil vincular el detalle a sus entidades completas:
  // venta?: Venta;
  // producto?: Producto;
}

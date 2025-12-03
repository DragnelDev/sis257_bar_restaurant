export interface DetalleVenta {
  id: number
  idVenta: number
  idReceta: number // O id_producto si vendes productos directos, asumo que es receta por el ERD
  cantidad: number
  precioUnitario: number
  costoUnitario: number

  // A menudo es útil vincular el detalle a sus entidades completas:
  // venta?: Venta;
  // producto?: Producto;
}

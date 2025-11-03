export interface DetalleCompra {
  idCompra: number
  idProducto: number
  cantidad: number
  precioUnitarioCompra: number
  subTotal: number
  fechaCreacion: Date
  fechaModificacion: Date
  fechaEliminacion: Date | null

  // Opcionalmente:
  // compra?: Compra;
  // producto?: Producto;
}

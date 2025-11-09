export interface DetalleCompra {
  idCompra: number
  idProducto: number
  cantidad: number
  precioUnitarioCompra: number
  subTotal: number

  // Opcionalmente:
  // compra?: Compra;
  // producto?: Producto;
}

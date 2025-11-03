export interface Compra {
  id: number
  idProveedor: number // Clave foránea
  idUsuario: number // Clave foránea (quién realizó la compra)
  fechaCompra: Date
  total: number
  fechaCreacion: Date
  fechaModificacion: Date
  fechaEliminacion: Date | null

  // Opcionalmente puedes agregar las relaciones para modelos de datos más completos:
  // proveedor?: Proveedor;
  // usuario?: Usuario;
}

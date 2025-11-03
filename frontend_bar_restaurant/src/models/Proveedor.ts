export interface Proveedor {
  id: number
  nombre: string
  nit: string
  telefono: string
  fechaCreacion: Date
  fechaModificacion: Date
  fechaEliminacion: Date | null
}

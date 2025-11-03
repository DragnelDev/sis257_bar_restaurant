export interface Mesa {
  id: number
  numeroMesa: number
  capacidad: number
  estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | string // Ejemplo de estados
  fechaCreacion: Date
  fechaModificacion: Date
  fechaEliminacion: Date | null
}

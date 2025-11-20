export interface Mesa {
  id: number
  numeroMesa: number
  capacidad: number
  estado: 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO' | string // Ejemplo de estados
}

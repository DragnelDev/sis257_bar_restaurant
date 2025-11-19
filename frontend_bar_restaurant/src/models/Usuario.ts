export interface Usuario {
  id: number
  idEmpleado: number
  empleado: {
    id: number
    nombre: string
    apellidoPaterno: string
    apellidoMaterno: string
  }
  usuario: string // Asumo que el campo 'id' de la tabla 'usuarios' es el ID, y debe haber un campo para el nombre de usuario
  clave: string
  rol: string
  activo: boolean
}

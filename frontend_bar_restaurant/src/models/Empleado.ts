export interface Empleado {
  id: number
  cedulaIdentidad: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: Date
  direccion: string
  celular: string
  email: string
  cargo: string
  activo: boolean
  fechaCreacion: Date
  fechaModificacion: Date
  fechaEliminacion: Date | null
}

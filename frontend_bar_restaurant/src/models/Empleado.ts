export interface Empleado {
  id: number
  cedulaIdentidad: string
  nombre: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaNacimiento: string // Tipo fecha
  direccion: string
  celular: string
  email: string
  fechaIngreso: string // Tipo fecha
  cargo: string
  salario: number // Suponiendo que el campo 123 es salario
  activo: boolean
}

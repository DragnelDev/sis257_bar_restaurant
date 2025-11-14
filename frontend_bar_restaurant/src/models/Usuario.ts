export interface Usuario {
  id: number
  idEmpleado: number
  //id_rol: number
  usuario: string // Asumo que el campo 'id' de la tabla 'usuarios' es el ID, y debe haber un campo para el nombre de usuario
  activo: boolean
}

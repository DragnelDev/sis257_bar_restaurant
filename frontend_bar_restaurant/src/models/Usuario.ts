export interface Usuario {
  id: number
  // **IMPORTANTE:** La contraseña NO se incluye en el modelo de datos de lectura.
  // Solo se usa para el envío al servidor durante el login o cambio de clave.
  // contraseña: string;
  usuario: string
  idEmpleado: number
  activo: boolean
  fechaCreacion: Date
  fechaModificacion: Date
  fechaEliminacion: Date | null
}

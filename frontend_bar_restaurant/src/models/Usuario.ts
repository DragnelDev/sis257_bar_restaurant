export interface Usuario {
  id: number
  // **IMPORTANTE:** La contraseña NO se incluye en el modelo de datos de lectura.
  // Solo se usa para el envío al servidor durante el login o cambio de clave.
  // contraseña: string;
  activo: boolean
  rol: 'ADMIN' | 'VENDEDOR' | 'COMPRADOR' | string // Ejemplo de tipado para 'rol'
  correoElectronico: string
  usuario: string
  fechaCreacion: Date
  fechaModificacion: Date
  fechaEliminacion: Date | null
}

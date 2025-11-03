// Asume que la ID de categoría es un número
//import { Categoria } from './Categoria'

export interface Producto {
  id: number
  idCategoria: number // Clave foránea
  nombre: string
  descripcion: string
  precioVenta: number // Usa 'number' para valores monetarios
  stock: number
  fechaCreacion: Date
  fechaModificacion: Date
  fechaEliminacion: Date | null // Usamos 'null' si no está eliminada

  // Puedes incluir la relación si la necesitas en el modelo de datos extendido:
  //categoria?: Categoria
}

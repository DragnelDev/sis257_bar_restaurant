import type { Categoria } from './Categoria'

export interface Producto {
  id: number
  idCategoria: number // Clave foránea
  nombre: string
  descripcion: string
  stock: number

  // Puedes incluir la relación si la necesitas en el modelo de datos extendido:
  categoria: Categoria
}

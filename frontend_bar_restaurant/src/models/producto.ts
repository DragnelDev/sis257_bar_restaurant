import type { Categoria } from './Categoria'

export interface Producto {
  id: number
  idCategoria: number
  nombre: string
  descripcion: string
  unidadMedida: string
  stockActual: number
  //stockMinimo: number
  costoUnitarioPromedio: number
  perecedero: boolean

  // Puedes incluir la relación si la necesitas en el modelo de datos extendido:
  categoria: Categoria
}

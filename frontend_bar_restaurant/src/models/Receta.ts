export interface Receta {
  id: number
  categoria: {
    id: number
    nombre: string
  }
  nombreReceta: string
  descripcion: string
  precioVentaActual: number
  costoActual: number
  urlImagen: string
}

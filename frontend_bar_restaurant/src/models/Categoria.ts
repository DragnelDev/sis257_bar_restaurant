export interface Categoria {
  id: number
  idCategoria: number // Solo el ID para enviar al servidor
  nombre: string
  descripcion: string
}

// 2. Interface extendida para LECTURA (incluye el objeto Categoria completo)
/*export interface Producto extends ProductoBase {
  // Aquí agregamos la relación
  categoria: Categoria
}*/

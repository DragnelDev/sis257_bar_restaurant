export interface Producto {
  id: number
  nombre: string
  urlImagen: string
  descripcion: string

  stockActual: number
  stockMinimo: number
  costoUnitarioPromedio: number

  perecedero: boolean
  esVendible: boolean

  categoria: {
    id: number
    nombre: string
  }

  unidadMedida: {
    id: number
    nombre: string
    simbolo: string
  }
}

export interface ProductoForm {
  id?: number

  idCategoria: number
  idUnidadMedida: number

  nombre: string
  urlImagen?: string
  descripcion: string

  stockMinimo: number
  costoUnitarioPromedio: number

  perecedero: boolean
  esVendible: boolean
}

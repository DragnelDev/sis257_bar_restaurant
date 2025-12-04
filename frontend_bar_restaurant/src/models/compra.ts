// ================================
// PRODUCTO
// ================================
export interface Producto {
  id: number
  nombre: string
  descripcion: string
  urlImagen: string
  stockActual: number
  stockMinimo: number
  costoUnitarioPromedio: number
  perecedero: boolean

  categoria?: {
    id: number
    nombre: string
  }

  unidadAlmacenamiento?: {
    id: number
    nombre: string
    simbolo: string
  }
}

// ================================
// DETALLE DE COMPRA
// ================================
export interface DetalleCompra {
  id: number
  idCompra: number
  idProducto: number
  cantidad: number
  precioUnitario: number
  subTotal: number
  producto?: Producto
}

// ================================
// PROVEEDOR
// ================================
export interface Proveedor {
  id: number
  nombre: string
  nit: string
  telefono: string
  direccion: string
  correo: string
}

// ================================
// USUARIO
// ================================
export interface Usuario {
  id: number
  nombre: string
  rol: string
}

// ================================
// COMPRA (Cabecera)
// ================================
export interface Compra {
  id: number
  idProveedor?: number
  fechaCreacion: string
  numeroFactura: string

  proveedor: Proveedor
  usuario: Usuario

  detallesCompra: DetalleCompra[]
}

// ================================
// DTO para crear compras
// ================================
export interface CreateDetalleCompraDto {
  idProducto: number
  cantidad: number
  precioUnitario: number
}

export interface CreateCompraDto {
  idProveedor?: number
  idUsuario: number
  fechaCreacion: Date
  numeroFactura: string
  //tipoComprobante: string;
  detallesCompra: CreateDetalleCompraDto[]
}

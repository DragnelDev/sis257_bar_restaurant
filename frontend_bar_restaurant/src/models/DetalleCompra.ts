import type { Producto } from "./producto";

export interface DetalleCompra {
  id: number;
  idCompra: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: string;
  subTotal: string;
  fechaCreacion: string;
  fechaModificacion: string;
  fechaEliminacion: string | null;
  compra: Compra;
  producto: Producto;
}

export interface Compra {
  id: number;
  fechaCompra: string;
  fechaRecepcion?: string;
  numeroFactura: string;
  tipoComprobante: string;

  proveedor: {
    id: number;
    nombreEmpresa: string;
    nit: string;
  }
  usuario: {
    id: number;
    usuario: string;
    rol: string;
  };

  detallesCompra: DetalleCompra[];
}

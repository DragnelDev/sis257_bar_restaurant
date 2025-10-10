# SIS257 | Proyecto Final de Laboratorio: Sistema de Gestión Ventas para Reset (Bar-Restaurant)

<p align="center">
    <img src="./assets/logo_bar_restaurant.jpg" alt="Logo del negocio" width="300" style="border-radius: 15px;"/>
</p>

## 1. Información General del Proyecto

| Detalle | Valor |
| :--- | :--- |
| **Nombre del Repositorio** | `sis257_bar_restaurant` |
| **Tema/Negocio** | Bar-Restaurant |
| **Base de Datos** | PostgreSQL (Nombre: `sis257_bar_restaurant`) |
| **Backend** | NestJS (Directorio: `backend_bar_restaurant`) |
| **Frontend** | Vue.js + Bootstrap (Directorio: `frontend_bar_restaurant`) |
| **Funcionalidad Principal**| Gestión de **Ventas/Pedidos** (con control de Mesas e Inventario) |
| **Versión Inicial** | 0.1.0 -  04/10/2025 |

---

## 2. Descripción del Negocio y Problema a Resolver

### Nombre del Negocio
**Reset (Bar-Restaurant)**

### Descripción
Sistema de gestión integral diseñado para optimizar las operaciones de un Bar-Restaurant. El objetivo principal es digitalizar el proceso de **toma de pedidos (Ventas)** y el control de **inventario**, asegurando que las entradas (Compras a proveedores) y salidas (Ventas a clientes) se reflejen en tiempo real en el stock.

### Problemática (Justificación)
Actualmente, el control de mesas, la toma de pedidos y la gestión de inventario se realizan de forma manual (libretas, pizarras o hojas de cálculo). Esto provoca:
1.  Errores en las cuentas y cierres de caja.
2.  Desconocimiento del stock real, generando quiebres o excesos de inventario.
3.  Lenta rotación de mesas debido a la ineficiencia en el registro de pedidos.

Nuestro sistema resuelve estos problemas centralizando la información y automatizando las transacciones de **Compra** y **Venta**.

---

## 3. Estructura de la Base de Datos (Entidades Tentativas)

El modelo de base de datos (`sis257_bar_restaurant`) está diseñado para ser transaccional (Ventas/Compras) y cuenta con **3 Catálogos** para cumplir con el requisito de CRUD.

### A. Catálogos Principales (CRUD Requerido)

| Entidad (Tabla) | Campos Tentativos | Rol en el Sistema |
| :--- | :--- | :--- |
| **productos** | `id`, `nombre`, `descripcion`, `precio_venta`, **`stock`** (INTEGER), `id_categoria` (FK) | Control de Inventario y Precios. |
| **categorias** | `id`, `nombre` | Clasificación de Platos/Bebidas. |
| **proveedores** | `id`, `nombre`, `nit`, `telefono` | Gestión de Entradas (Módulo de Compras). |

### B. Entidades de Soporte y Transaccionales

| Entidad (Tabla) | Campos Tentativos | Flujo Asociado |
| :--- | :--- | :--- |
| **usuarios** | `id`, `username`, `password` (encriptada), `rol` | Autenticación (Login/JWT). |
| **mesas** | `id`, `numero_mesa`, `capacidad`, **`estado`** (VARCHAR) | Soporte para el flujo de Ventas/Pedidos. |
| **ventas** | `id`, `fecha`, `total`, `id_mesa` (FK), `id_usuario` (FK), `estado` | Encabezado de la Venta (Salida de Inventario). |
| **detalle_ventas** | `id`, `id_venta` (FK), `id_producto` (FK), `cantidad`, `precio_unitario` | Desglose de productos vendidos (Resta de Stock). |
| **compras** | `id`, `fecha_compra`, `total`, `id_proveedor` (FK), `id_usuario` (FK) | Encabezado de la Compra (Entrada a Inventario). |
| **detalle_compras** | `id`, `id_compra` (FK), `id_producto` (FK), `cantidad`, `precio_unitario_compra` | Desglose de productos comprados (Suma al Stock). |

---

## 4. Cronograma de Trabajo

Sección para ser actualizada con el progreso de los commits de los miembros del equipo.

| Tarea | Fecha Límite | Estado | Responsable(s) |
| :--- | :--- | :--- | :--- |
| Conformación de grupos y creación de repositorio. | 02/10/2025 | **COMPLETADO** | Magin, Alexander, Joel |
| Creación de `README.md` (Entidades Tentativas). | 05/10/2025 |  **COMPLETADO** | macDev |
| Creación del proyecto backend (NestJS) y consolidación de entidades en el README.md. | 09/10/2025 | **COMPLETADO** | macDev |
| Generación de la base de datos a partir de las entities. Configuración generales del backend (validaciones, swagger). CRUD de 3 catálogos a nivel de backend. | 16/10/2025 | EN PROSESO | ... |
| Creación del proyecto frontend (vue.js). Selección y personalización de un template bootstrap. Endpoints necesarios para la compra o venta. | 23/10/2025 | PENDIENTE | ... |
| CRUD frontend integrado con el backend de 3 catálogos. | 30/10/2025 | PENDIENTE | ... |
| Incorporación de JWT y login a nivel de backend y frontend. | 6/11/2025 | PENDIENTE | ... |
| Funcionalidad de la Compra o Venta en frontend. Generación de la documentación inicial. | 13/11/2025 | PENDIENTE | ... |
| Presentación final de laboratorio. | 20/11/2025 | PENDIENTE | ... |

---

## 5. Integrantes del Grupo

| Nombre Completo | Nombre de Usuario Git | Contactos |
| :--- | :--- | :--- |
| Magin Condori Huanca | macDev | ... |
| Alexander Antonio Lizondo Fortun | ... | ... |
| Joel Jhonatan Copa Aiza | ... | ... |

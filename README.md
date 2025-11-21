# SIS257 | Proyecto Final de Laboratorio: Sistema de Gestión Ventas para Reset (Bar-Restaurant)

<p align="center">
    <img src="./assets/logo_bar_restaurant.jpg" alt="Logo del negocio" width="300" style="border-radius: 15px;"/>
</p>

## 1. 🛠️ Instrucciones de Instalación y Configuración

Para poner en marcha el sistema, siga los siguientes pasos para configurar el entorno y ambos proyectos (Backend y Frontend).

---

### 1.1. Prerrequisitos 

Asegúrese de tener instalados los siguientes componentes:

* **Node.js:** Versión v18.x o superior.
* **npm** o **Yarn** (administrador de paquetes).
* **PostgreSQL:** Versión 15 o superior.
* Un cliente REST (ej: Postman, Insomnia) para probar los *endpoints* del *backend*.

---

### 1.2. Configuración de la Base de Datos 

1.  **Creación de la DB:** Conéctese a su servidor PostgreSQL y ejecute el siguiente comando:
    ```sql
    CREATE DATABASE sis257_bar_restaurant;
    ```
2.  **Configuración de Credenciales:** En el directorio `backend_bar_restaurant`, cree un archivo `.env` con las credenciales de conexión (ajuste según su entorno):
    ```
    # DATABASE CONFIG
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=postgres
    DB_PASSWORD=su_contraseña
    DB_DATABASE=sis257_bar_restaurant
    ```
3.  **Ejecutar Migraciones:** Desde el directorio `backend_bar_restaurant`, use el ORM para generar las tablas:
    ```bash
    npm run migration:run
    ```

---

### 1.3. Instalación de Proyectos (Backend y Frontend) 

#### A. Backend (NestJS)
1.  Navegue al directorio:
    ```bash
    cd backend_bar_restaurant
    ```
2.  Instale las dependencias:
    ```bash
    npm install
    ```
3.  Inicie el servidor en modo desarrollo (se reinicia automáticamente con cambios):
    ```bash
    npm run start:dev 
    ```
    *El API estará disponible en **`http://localhost:3000`***.

#### B. Frontend (Vue.js + Bootstrap)
1.  Navegue al directorio:
    ```bash
    cd frontend_bar_restaurant
    ```
2.  Instale las dependencias:
    ```bash
    npm install
    ```
3.  Inicie el cliente web:
    ```bash
    npm run serve
    ```
    *El frontend estará disponible en **`http://localhost:8080`*** (o el puerto que se indique).

---

## 2. Información General del Proyecto

| Detalle | Valor |
| :--- | :--- |
| **Nombre del Repositorio** | `sis257_bar_restaurant` |
| **Tema/Negocio** | Bar-Restaurant |
| **Base de Datos** | PostgreSQL (Nombre: `sis257_bar_restaurant`) |
| **Backend** | NestJS (Directorio: `backend_bar_restaurant`) |
| **Frontend** | Vue.js + Bootstrap (Directorio: `frontend_bar_restaurant`) |
| **Funcionalidad Principal**| Gestión de **Ventas/Pedidos** (con control de Mesas, Inventario y Recetas) |
| **Versión Inicial** | 0.1.0 -  04/10/2025 |

---

## 3. Descripción del Negocio y Problema a Resolver

### Nombre del Negocio
**Reset (Bar-Restaurant)**

### Descripción
Sistema de gestión integral diseñado para optimizar las operaciones de un Bar-Restaurant. El objetivo principal es digitalizar el proceso de **toma de pedidos (Ventas)** y el control de **inventario**, asegurando que las entradas (Compras a proveedores) y salidas (Ventas a clientes) se reflejen en tiempo real en el stock. **Se ha incorporado la gestión de Recetas** para el control de insumos y costos de los productos vendidos.

### Problemática (Justificación)
Actualmente, el negocio opera con un **sistema de gestión obsoleto** que carece de integración. Las tareas clave (toma de pedidos, control de mesas, inventario y costos) se realizan mediante **registros manuales o en hojas de cálculo separadas**. Esta dependencia en procesos no automatizados e inconexos provoca los siguientes problemas críticos:

1.  **Imprecisión Financiera y Fraude:** Al gestionar las cuentas de mesas y el cierre de caja de forma manual, se producen **errores frecuentes en el cálculo** (por duplicidad o transcripción), lo que dificulta la conciliación diaria y aumenta el riesgo de **pérdidas económicas o descuadres de caja**.
2.  **Descontrol de Inventario y Desperdicio:** La gestión de stock no está vinculada a las ventas ni a las recetas. Esto lleva a un **desconocimiento constante del stock real** (generando quiebres o excesos de inventario), mientras que la falta de estandarización de **costos por receta** impide identificar dónde hay mayor desperdicio o dónde se pierde margen de ganancia.
3.  **Baja Eficiencia Operativa (Rotación de Mesas Lenta):** El proceso de toma de pedidos es lento (anotaciones en papel) y la comunicación entre meseros y cocina es ineficiente. Esto se traduce en **tiempos de espera prolongados** para los clientes y una **lenta rotación de mesas**, impactando directamente la capacidad de ingresos del restaurante.

Nuestro sistema resuelve estos problemas centralizando la información y automatizando las transacciones de **Compra** y **Venta**, y **calculando el costo** de los productos a partir de sus recetas.

---

## 4. Estructura de la Base de Datos (Entidades Finales - Basado en DER)

El modelo de base de datos (`sis257_bar_restaurant`) es transaccional y cuenta con **módulos de Catálogos (CRUD), Compras, Ventas y Recetas**.

### A. Catálogos Principales (CRUD Requerido)

Estos catálogos son la base operativa y transaccional del sistema:

| Entidad (Tabla) | Campos Relevantes | Rol en el Sistema |
| :--- | :--- | :--- |
| **productos** | `id`, `nombre`, `descripcion`, `unidad_medida`, **`stock_actual`** (DECIMAL/NUMERIC), `costo_promedio_unitario`, `id_categoria` (FK) | Control de **Inventario y Consumo** de insumos. |
| **categorias** | `id`, `nombre` | **Clasificación** de Productos y Recetas (ítems del menú). |
| **proveedores** | `id`, `nombre_empresa`, `nit`, `responsable`, `celular`, `condicion_pago` | **Registro y Gestión de Compras**. |
| **recetas** | `id`, `nombre_receta`, `descripcion`, **`precio_venta_actual`**, **`costo_actual`** | **Estructura del Menú**, vendible al cliente, calcula el costo de venta. |

### B. Entidades de Soporte, Transaccionales y de Recursos Humanos

| Entidad (Tabla) | Campos Relevantes | Flujo Asociado |
| :--- | :--- | :--- |
| **empleados** | `id`, `cedula_identidad`, `nombre`, `apellido_paterno`, `apellido_materno`, `fecha_nacimiento`, `cargo`, `salario` | Información detallada del personal. |
| **usuarios** | `id`, `id_empleado` (FK), `nombre_usuario`, `clave` (encriptada), `activo` (boolean) | Autenticación (Login/JWT) vinculado a un Empleado. |
| **mesas** | `id`, `numero_mesa`, `capacidad`, **`estado`** (VARCHAR) | Soporte para el flujo de Ventas/Pedidos. |
| **clientes** | `id`, `nit_ci`, `nombre` | Registro de clientes para facturación (Opcional). |
| **detalle_recetas** | `id`, `id_receta` (FK), `id_producto` (FK), `cantidad_consumida`, `unidad_consumo` | Desglose de insumos (productos) usados por cada receta. |
| **compras** | `id`, `numero_factura`, `total`, `id_proveedor` (FK), `id_usuario` (FK) | Encabezado de la Compra (Entrada a Inventario). |
| **detalle_compras** | `id`, `id_compra` (FK), `id_producto` (FK), `cantidad`, `precio_unitario`, `sub_total` | Desglose de productos comprados (Suma al Stock). |
| **ventas** | `id`, `total`, `tipo_pago`, `fecha`, `id_mesa` (FK), `id_usuario` (FK), `id_cliente` (FK) | Encabezado de la Venta (Salida de Inventario). |
| **detalle_ventas** | `id`, `id_venta` (FK), `id_receta` (FK), `precio_unitario`, `cantidad` | Desglose de recetas vendidas (Genera el Descuento de insumos). |

### C. columnas de auditoria 

| **columnas de auditoria** | `fecha_creacion`, `fecha_modificacion`, `fecha_eliminacion` | Estas columnas estan se icorporan a cada entidad para auditoria |

---

## 5. Cronograma de Trabajo

Sección para ser actualizada con el progreso de los commits de los miembros del equipo.

| Tarea | Fecha Límite | Estado | Responsable(s) |
| :--- | :--- | :--- | :--- |
| Conformación de grupos y creación de repositorio. | 02/10/2025 | **COMPLETADO** | Magin, Alexander, Joel |
| Creación de `README.md` (Entidades Tentativas). | 05/10/2025 |  **COMPLETADO** | Magin |
| Creación del proyecto backend (NestJS) y consolidación de entidades en el README.md. | 09/10/2025 | **COMPLETADO** | Magin |
| Generación de la base de datos a partir de las entities. Configuración generales del backend (validaciones, swagger). CRUD de 3 catálogos a nivel de backend. | 16/10/2025 | **COMPLETADO** | Magin, Alexander y Joel |
| **ACTUALIZACIÓN del modelo de BBDD** y ajuste de entities según el DER final. | 20/11/2025 | **COMPLETADO** | Magin |
| Creación del proyecto frontend (vue.js). Selección y personalización de un template bootstrap. Endpoints necesarios para la compra o venta. | 23/10/2025 | **COMPLETADO** | Magin |
| CRUD frontend integrado con el backend de 3 catálogos. | 30/10/2025 | **COMPLETADO** | Todos |
| Incorporación de JWT y login a nivel de backend y frontend. | 6/11/2025 | **COMPLETADO** | Magin |
| Funcionalidad de la Compra o Venta en frontend. Generación de la documentación inicial. | 13/11/2025 | **COMPLETADO** | Magin, Alex |
| Presentación final de laboratorio. | 20/11/2025 | **COMPLETADO** | Magin, Alex |

---

## 6. Integrantes del Grupo

| Nombre Completo | Nombre de Usuario Git/GitHub | Contactos |
| :--- | :--- | :--- |
| Magin Condori Huanca | macDev/DragnelDev | ... |
| Alexander Antonio Lizondo Fortun | ... | ... |
| Joel Jhonatan Copa Aiza | ... | ... |

---

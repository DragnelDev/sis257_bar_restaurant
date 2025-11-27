<script setup lang="ts">
import CompraList from '@/components/compra/CompraList.vue'
import CompraSave from '@/components/compra/CompraSave.vue'
import ProveedorSave from '@/components/proveedor/ProveedorSave.vue'
import ProductoSave from '@/components/producto/ProductoSave.vue'

import { ref, type ComponentPublicInstance } from 'vue'
import Button from 'primevue/button'

// Ref al listado
type CompraListInstance = ComponentPublicInstance & { obtenerLista?: () => void }
const compraListRef = ref<CompraListInstance | null>(null)

// Modales independientes
const showCompra = ref(false)
const showProducto = ref(false)
const showProveedor = ref(false)

// ➤ Abrir modal compra
function abrirCompra() {
  showCompra.value = true
}

// ➤ Abrir modal producto
function abrirProducto() {
  showProducto.value = true
}

// ➤ Abrir modal proveedor
function abrirProveedor() {
  showProveedor.value = true
}

// Cerrar modal genérico
function closeCompra() {
  showCompra.value = false
}
function closeProducto() {
  showProducto.value = false
}
function closeProveedor() {
  showProveedor.value = false
}

// Guardar compra → refrescar lista
function guardarCompra() {
  compraListRef.value?.obtenerLista?.()
  showCompra.value = false
}

// Guardar producto → NO refresca listado de compras
function guardarProducto() {
  showProducto.value = false
}

// Guardar proveedor → NO refresca listado de compras
function guardarProveedor() {
  showProveedor.value = false
}
</script>

<template>
  <div class="card">
    <h2 class="mb-3">📦 Gestión de Compras</h2>

    <div class="d-flex gap-2">
      <Button
        label="Registrar nueva compra"
        icon="pi pi-plus"
        class="mb-3"
        @click="abrirCompra"
      />

      <Button
        label="Añadir nuevo producto"
        icon="pi pi-box"
        class="mb-3"
        @click="abrirProducto"
      />

      <Button
        label="Crear nuevo proveedor"
        icon="pi pi-user-plus"
        class="mb-3"
        @click="abrirProveedor"
      />
    </div>

    <!-- LISTADO -->
    <CompraList ref="compraListRef" />

    <!-- MODAL COMPRA -->
    <CompraSave
      :mostrar="showCompra"
      @guardar="guardarCompra"
      @close="closeCompra"
    />

    <!-- MODAL PRODUCTO -->
    <ProductoSave
      :mostrar="showProducto"
      @guardar="guardarProducto"
      @close="closeProducto"
    />

    <!-- MODAL PROVEEDOR -->
    <ProveedorSave
      :mostrar="showProveedor"
      @guardar="guardarProveedor"
      @close="closeProveedor"
    />
  </div>
</template>

<style scoped>
.d-flex {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
}

.d-flex .pi {
  font-size: 1.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
  button {
    min-width: 200px;
    color: rgb(165, 165, 211);
  }
}
</style>

<script setup lang="ts">
import type { Compra } from '@/models/compra'
import http from '@/plugins/axios'
import { Button, Dialog, InputGroup, InputGroupAddon, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'compras'
const compras = ref<Compra[]>([])
const compraDelete = ref<Compra | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const busqueda = ref<string>('')
const emit = defineEmits(['edit'])

const comprasFiltradas = computed(() => {
	return compras.value.filter((compra) => {
		const q = busqueda.value.toLowerCase()
		return (
			(compra.fechaCompra ?? '').toLowerCase().includes(q) ||
			String(compra.idProveedor ?? '').includes(q) ||
			String(compra.idUsuario ?? '').includes(q) ||
			String(compra.total ?? '').includes(q)
		)
	})
})

async function obtenerLista() {
	compras.value = await http.get(ENDPOINT).then((response) => response.data)
}

function emitirEdicion(compra: Compra) {
	emit('edit', compra)
}

function mostrarEliminarConfirm(compra: Compra) {
	compraDelete.value = compra
	mostrarConfirmDialog.value = true
}

async function eliminar() {
	await http.delete(`${ENDPOINT}/${compraDelete.value?.id}`)
	obtenerLista()
	mostrarConfirmDialog.value = false
}

onMounted(() => {
	obtenerLista()
})
defineExpose({ obtenerLista })
</script>

<template>
	<div>
		<div class="col-7 pl-0 mt-3">
			<InputGroup>
				<InputGroupAddon><i class="pi pi-search"></i></InputGroupAddon>
				<InputText v-model="busqueda" type="text" placeholder="Buscar por fecha, proveedor, usuario o total" />
			</InputGroup>
		</div>

		<table>
			<thead>
				<tr>
					<th>Nro.</th>
					<th>Fecha Compra</th>
					<th>Total</th>
					<th>ID Proveedor</th>
					<th>ID Usuario</th>
					<th>Acciones</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(compra, index) in comprasFiltradas" :key="compra.id">
					<td>{{ index + 1 }}</td>
					<td>{{ compra.fechaCompra }}</td>
					<td>{{ compra.total }}</td>
					<td>{{ compra.idProveedor }}</td>
					<td>{{ compra.idUsuario }}</td>
					<td>
						<Button icon="pi pi-pencil" aria-label="Editar" text @click="emitirEdicion(compra)" />
						<Button icon="pi pi-trash" aria-label="Eliminar" text @click="mostrarEliminarConfirm(compra)" />
					</td>
				</tr>
				<tr v-if="comprasFiltradas.length === 0">
					<td colspan="6">No se encontraron resultados.</td>
				</tr>
			</tbody>
		</table>

		<Dialog v-model:visible="mostrarConfirmDialog" header="Confirmar Eliminación" :style="{ width: '25rem' }">
			<p>¿Estás seguro de que deseas eliminar la compra con fecha {{ compraDelete?.fechaCompra }}?</p>
			<div class="flex justify-end gap-2">
				<Button type="button" label="Cancelar" severity="secondary" @click="mostrarConfirmDialog = false" />
				<Button type="button" label="Eliminar" @click="eliminar" />
			</div>
		</Dialog>
	</div>
</template>

<style scoped></style>


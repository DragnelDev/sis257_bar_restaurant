<script setup lang="ts">
import type { Venta } from '@/models/venta'
import http from '@/plugins/axios'
import { Button, Dialog, InputText, InputNumber } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'ventas'
const props = defineProps({
    mostrar: Boolean,
    venta: {
        type: Object as () => Venta,
        default: () => ({}) as Venta,
    },
    modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const dialogVisible = computed({
    get: () => props.mostrar,
    set: (value) => {
        if (!value) emit('close')
    },
})

const venta = ref<Venta>({ ...props.venta })
watch(
    () => props.venta,
    (newVal) => {
        venta.value = { ...newVal }
    },
)

async function handleSave() {
    try {
        const body = {
            idMesa: venta.value.idMesa,
            idUsuario: venta.value.idUsuario,
            total: venta.value.total,
            estado: venta.value.estado,
        }
        if (props.modoEdicion) {
            await http.patch(`${ENDPOINT}/${venta.value.id}`, body)
        } else {
            await http.post(ENDPOINT, body)
        }
        emit('guardar')
        venta.value = {} as Venta
        dialogVisible.value = false
    } catch (error) {
        let msg = 'Ocurrió un error'
        if (typeof error === 'object' && error !== null) {
            const e = error as Record<string, unknown>
            const response = e['response'] as Record<string, unknown> | undefined
            const data = response?.['data'] as Record<string, unknown> | undefined
            const message = data?.['message']
            if (typeof message === 'string') msg = message
            else if (typeof e['message'] === 'string') msg = e['message'] as string
            else {
                try {
                    msg = JSON.stringify(e)
                } catch {
                    msg = 'Ocurrió un error'
                }
            }
        } else {
            msg = String(error)
        }
        alert(msg)
    }
}
</script>

<template>
    <div class="card flex justify-center">
        <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Venta' : 'Crear Venta'" style="width: 25rem">
            <div class="flex items-center gap-4 mb-4">
                <label for="idMesa" class="font-semibold w-3">ID Mesa</label>
                <InputNumber id="idMesa" v-model="venta.idMesa" class="flex-auto" :min="0" />
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="idUsuario" class="font-semibold w-3">ID Usuario</label>
                <InputNumber id="idUsuario" v-model="venta.idUsuario" class="flex-auto" :min="0" />
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="total" class="font-semibold w-3">Total</label>
                <InputNumber id="total" v-model="venta.total" mode="currency" currency="BOB" locale="es-BO" class="flex-auto" />
            </div>
            <div class="flex items-center gap-4 mb-4">
                <label for="estado" class="font-semibold w-3">Estado</label>
                <InputText id="estado" v-model="venta.estado" class="flex-auto" placeholder="Ej: PENDIENTE, PAGADO" />
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
                <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
            </div>
        </Dialog>
    </div>
</template>

<style scoped></style>

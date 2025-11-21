import { defineStore } from 'pinia'
import { getTokenFromLocalStorage } from '@/helpers'
import http from '@/plugins/axios'
import router from '@/router'

const useAuthStore = defineStore('auth', {
  state: () => ({
    user: (() => {
      const raw = localStorage.getItem('user') || sessionStorage.getItem('user')
      if (!raw) return ''
      try {
        return JSON.parse(raw)
      } catch {
        return raw
      }
    })(),
    token: getTokenFromLocalStorage(),
    returnUrl: '',
  }),
  getters: {},
  actions: {
    async login(usuario: string, clave: string) {
      try {
        const response = await http.post('/auth/login', { usuario, clave })
        console.debug('login response raw:', response)

        // El backend puede devolver distintas estructuras. Normalizar.
        const payload = response.data?.data ?? response.data

        // Determinar token
        const maybeToken =
          payload?.access_token ??
          response.data?.access_token ??
          payload?.token ??
          response.data?.token ??
          null

        // Determinar usuario: si el payload es un objeto con `id`, usarlo; si `usuario` es objeto, usarlo; si `usuario` es string y hay otros campos, construir objeto mínimo
        let userObj: any = null
        if (payload && typeof payload === 'object' && 'id' in payload) {
          userObj = payload
        } else if (payload?.usuario && typeof payload.usuario === 'object') {
          userObj = payload.usuario
        } else if (response.data?.usuario && typeof response.data.usuario === 'object') {
          userObj = response.data.usuario
        } else if (
          payload &&
          typeof payload === 'object' &&
          payload.usuario &&
          typeof payload.usuario === 'string'
        ) {
          // payload contains username string and possibly id
          userObj = {
            id: payload.id ?? null,
            usuario: payload.usuario,
            rol: payload.rol ?? payload.role ?? null,
            activo: payload.activo ?? null,
          }
        } else {
          userObj = payload || ''
        }

        this.user = userObj || ''
        this.token = maybeToken || ''

        // Guardar user como JSON para mantener la estructura de objeto
        try {
          localStorage.setItem('user', JSON.stringify(this.user) || '')
        } catch {
          localStorage.setItem('user', String(this.user) || '')
        }
        localStorage.setItem('token', this.token || '')

        // Priorizar returnUrl guardado en localStorage por el guard de rutas
        const storedReturn = localStorage.getItem('returnUrl') || this.returnUrl
        console.debug('login storedReturn:', storedReturn)
        if (storedReturn) {
          // limpiar y redirigir
          localStorage.removeItem('returnUrl')
          router.push(storedReturn)
        } else {
          router.push('/')
        }

        return true
      } catch (err) {
        console.error('login error:', err)
        // Re-lanzar para que el componente que llama pueda mostrar el error
        throw err
      }
    },
    logout() {
      localStorage.clear()
      this.$reset()
      router.push('login')
    },
  },
})

export { useAuthStore }

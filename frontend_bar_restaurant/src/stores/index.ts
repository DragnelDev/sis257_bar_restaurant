import { defineStore } from 'pinia'
import { getTokenFromLocalStorage } from '@/helpers'
import http from '@/plugins/axios'
import router from '@/router'

const useAuthStore = defineStore('auth', {
  state: () => ({
    user: localStorage.getItem('user') || '',
    token: getTokenFromLocalStorage(),
    returnUrl: '',
  }),
  getters: {},
  actions: {
    async login(usuario: string, clave: string) {
      const response = await http.post('auth/login', { usuario, clave })
      this.user = response.data.usuario
      this.token = response.data.access_token

      localStorage.setItem('user', this.user || '')
      localStorage.setItem('token', this.token || '')

      // Priorizar returnUrl guardado en localStorage por el guard de rutas
      const storedReturn = localStorage.getItem('returnUrl') || this.returnUrl
      if (storedReturn) {
        // limpiar y redirigir
        localStorage.removeItem('returnUrl')
        router.push(storedReturn)
      } else {
        router.push('/')
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

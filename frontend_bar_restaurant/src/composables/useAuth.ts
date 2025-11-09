import { ref, computed } from 'vue'
import type { User, LoginForm } from '../types'

const user = ref<User | null>(null)
const token = ref<string | null>(null)

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value && !!token.value)

  const login = async (credentials: LoginForm): Promise<boolean> => {
    try {
      // Simulación de API - Reemplazar con tu API real
      // await api.post('/auth/login', credentials)

      // Credenciales de prueba
      if (credentials.usuario === 'admin@restoran.com' && credentials.clave === 'admin123') {
        const userData: User = {
          id: 1,
          name: 'Admin User',
          email: credentials.usuario,
          role: 'admin',
          avatar: '/img/team-1.jpg',
        }

        const authToken = 'mock-jwt-token-' + Date.now()

        user.value = userData
        token.value = authToken

        // Guardar en localStorage si "Remember Me" está activado
        if (credentials.rememberMe) {
          localStorage.setItem('auth_user', JSON.stringify(userData))
          localStorage.setItem('auth_token', authToken)
        } else {
          sessionStorage.setItem('auth_user', JSON.stringify(userData))
          sessionStorage.setItem('auth_token', authToken)
        }

        return true
      }

      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
    sessionStorage.removeItem('auth_token')
  }

  const checkAuth = () => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
    const savedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')

    if (savedUser && savedToken) {
      user.value = JSON.parse(savedUser)
      token.value = savedToken
    }
  }

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }
}

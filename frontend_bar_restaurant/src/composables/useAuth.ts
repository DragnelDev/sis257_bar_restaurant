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
        // Usar claves `user` y `token` para ser compatibles con el store y helpers
        if (credentials.rememberMe) {
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('token', authToken)
          // mantener compatibilidad con claves antiguas
          localStorage.setItem('auth_user', JSON.stringify(userData))
          localStorage.setItem('auth_token', authToken)
        } else {
          sessionStorage.setItem('user', JSON.stringify(userData))
          sessionStorage.setItem('token', authToken)
          // mantener compatibilidad con claves antiguas
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
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    sessionStorage.removeItem('auth_user')
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
  }

  const checkAuth = () => {
    // Verificar si hay sesión guardada.
    // Compatibilidad: buscar claves `user`/`token` y `auth_user`/`auth_token`.
    const savedUser =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user') ||
      localStorage.getItem('auth_user') ||
      sessionStorage.getItem('auth_user') ||
      null

    const savedToken =
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token') ||
      null

    console.debug('checkAuth found savedUser:', savedUser, 'savedToken:', savedToken)
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
      } catch {
        // si no es JSON, asignar la cadena
        user.value = (savedUser as unknown) as User
      }
      token.value = savedToken
      console.debug('checkAuth loaded user:', user.value, 'token present? ', !!token.value)
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

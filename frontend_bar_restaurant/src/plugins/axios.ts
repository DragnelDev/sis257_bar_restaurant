import Axios from 'axios'

const axios = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_ENDPOINT || 'http://localhost:3000/api',
  headers: { 'Content-type': 'application/json' },
})

// Interceptor para manejar errores globalmente
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la petición:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export default axios

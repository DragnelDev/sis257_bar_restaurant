import Axios from 'axios'

const axios = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_ENDPOINT || 'http://localhost:3000/api',
  headers: { 'Content-type': 'application/json' },
})

// Interceptor para manejar errores globalmente
axios.interceptors.request.use((config) => {
  // No importar el store para evitar dependencias circulares durante la inicialización.
  // Leer token directamente desde localStorage.
  const token = localStorage.getItem('token')
  if (config.headers) {
    config.headers['Content-type'] = 'application/json'
    if (token) config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
})

export default axios

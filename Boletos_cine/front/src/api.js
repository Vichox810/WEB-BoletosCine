import axios from 'axios'
import { API_URL } from './config'

const api = axios.create({
  baseURL: API_URL
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const originalMsg = err.response?.data?.error || ''
      if (originalMsg === 'Token requerido' || originalMsg === 'Token inválido o expirado') {
        err.response.data.error = 'Debes iniciar sesión para realizar esta acción'
      }
    }
    return Promise.reject(err)
  }
)

export default api

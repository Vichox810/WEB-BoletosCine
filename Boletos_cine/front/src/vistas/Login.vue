<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">🎬</div>
      <h2 class="auth-title">Bienvenido de nuevo</h2>
      <p class="auth-subtitle">Inicia sesión para continuar</p>

      <div v-if="error" class="auth-message error">{{ error }}</div>

      <form class="auth-form" @submit.prevent="login">
        <div class="auth-field">
          <input v-model="form.email" type="email" placeholder="Correo electrónico" />
        </div>
        <div class="auth-field">
          <input v-model="form.password" type="password" placeholder="Contraseña" />
        </div>
        <button type="submit" class="auth-button" :disabled="cargando">
          {{ cargando ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <p class="auth-footer">
        <router-link to="/solicitar-reset">¿Olvidaste tu contraseña?</router-link>
      </p>
      <p class="auth-footer">
        ¿No tienes cuenta? <router-link to="/registro">Regístrate</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import '../styles/Auth.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const form = ref({ email: '', password: '' })
const error = ref('')
const cargando = ref(false)
const router = useRouter()

const login = async () => {
  error.value = ''

  if (!form.value.email.trim() || !form.value.password.trim()) {
    error.value = 'Todos los campos son requeridos'
    return
  }

  if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    error.value = 'Ingresa un correo electrónico válido'
    return
  }

  cargando.value = true
  try {
    const res = await api.post('/api/users/login', form.value)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al iniciar sesión'
  } finally {
    cargando.value = false
  }
}
</script>
<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">🔑</div>
      <h2 class="auth-title">Recuperar contraseña</h2>
      <p class="auth-subtitle">Ingresa tu email para restablecer tu contraseña</p>

      <div v-if="error" class="auth-message error">{{ error }}</div>
      <div v-if="exito" class="auth-message exito">{{ exito }}</div>

      <form class="auth-form" @submit.prevent="solicitar">
        <div class="auth-field">
          <input v-model="email" type="email" placeholder="Correo electrónico" />
        </div>
        <button type="submit" class="auth-button" :disabled="cargando">
          {{ cargando ? 'Enviando...' : 'Solicitar código' }}
        </button>
      </form>

      <p class="auth-footer">
        <router-link to="/login">← Volver al login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import '../styles/Auth.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const email = ref('')
const error = ref('')
const exito = ref('')
const cargando = ref(false)

const solicitar = async () => {
  error.value = ''
  exito.value = ''

  if (!email.value.trim()) {
    error.value = 'Ingresa tu correo electrónico'
    return
  }

  if (!/\S+@\S+\.\S+/.test(email.value)) {
    error.value = 'Ingresa un correo electrónico válido'
    return
  }

  cargando.value = true
  try {
    const res = await api.post('/api/users/solicitar-reset', { email: email.value })
    sessionStorage.setItem('resetToken', res.data.token)
    router.push('/resetear')
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Error al solicitar el restablecimiento'
  } finally {
    cargando.value = false
  }
}
</script>
<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">🔑</div>
      <h2 class="auth-title">Recuperar contraseña</h2>
      <p class="auth-subtitle">Ingresa tu email y te daremos un código para restablecerla</p>

      <div v-if="error" class="auth-message error">{{ error }}</div>
      <div v-if="resultado" class="auth-message exito">
        {{ resultado.message }}
        <div v-if="resultado.token" class="token-box">
          <p>Tu código (modo desarrollo):</p>
          <code>{{ resultado.token }}</code>
        </div>
      </div>

      <form class="auth-form" @submit.prevent="solicitar">
        <div class="auth-field">
          <input v-model="email" type="email" placeholder="Correo electrónico" />
        </div>
        <button type="submit" class="auth-button" :disabled="cargando">
          {{ cargando ? 'Enviando...' : 'Solicitar código' }}
        </button>
      </form>

      <p class="auth-footer">
        <router-link to="/resetear">Ya tengo un código</router-link>
      </p>
      <p class="auth-footer">
        <router-link to="/login">← Volver al login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import '../styles/Auth.css'
import { ref } from 'vue'
import api from '../api'

const email = ref('')
const error = ref('')
const resultado = ref(null)
const cargando = ref(false)

const solicitar = async () => {
  error.value = ''
  resultado.value = null
  cargando.value = true
  try {
    const res = await api.post('/api/users/solicitar-reset', { email: email.value })
    resultado.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || err.response?.data?.error || 'Error al solicitar el restablecimiento'
  } finally {
    cargando.value = false
  }
}
</script>
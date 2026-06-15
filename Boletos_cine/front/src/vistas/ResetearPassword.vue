<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">🔐</div>
      <h2 class="auth-title">Restablecer contraseña</h2>
      <p class="auth-subtitle">Ingresa tu nueva contraseña</p>

      <div v-if="sinToken" class="auth-message error">
        No hay un código de restablecimiento activo. <router-link to="/solicitar-reset">Solicita uno nuevo</router-link>.
      </div>
      <div v-if="error" class="auth-message error">{{ error }}</div>
      <div v-if="exito" class="auth-message exito">{{ exito }}</div>

      <form v-if="!sinToken" class="auth-form" @submit.prevent="resetear">
        <div class="auth-field">
          <input v-model="password" type="password" placeholder="Nueva contraseña (mín. 8 caracteres)" />
        </div>
        <button type="submit" class="auth-button" :disabled="cargando">
          {{ cargando ? 'Guardando...' : 'Restablecer contraseña' }}
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { resetToken } from '../stores/resetToken'

const router = useRouter()
const password = ref('')
const error = ref('')
const exito = ref('')
const sinToken = ref(false)
const cargando = ref(false)

onMounted(() => {
  if (!resetToken.value) {
    sinToken.value = true
  }
})

const resetear = async () => {
  error.value = ''
  exito.value = ''
  cargando.value = true
  try {
    const res = await api.post('/api/users/resetear', { token: resetToken.value, password: password.value })
    resetToken.value = ''
    exito.value = res.data.message
    setTimeout(() => router.push('/login'), 1500)
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al restablecer la contraseña'
  } finally {
    cargando.value = false
  }
}
</script>
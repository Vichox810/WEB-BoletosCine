<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">🔐</div>
      <h2 class="auth-title">Restablecer contraseña</h2>
      <p class="auth-subtitle">Ingresa el código y tu nueva contraseña</p>

      <div v-if="error" class="auth-message error">{{ error }}</div>
      <div v-if="exito" class="auth-message exito">{{ exito }}</div>

      <form class="auth-form" @submit.prevent="resetear">
        <div class="auth-field">
          <input v-model="form.token" type="text" placeholder="Código de restablecimiento" />
        </div>
        <div class="auth-field">
          <input v-model="form.password" type="password" placeholder="Nueva contraseña (mín. 8 caracteres)" />
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const form = ref({ token: '', password: '' })
const error = ref('')
const exito = ref('')
const cargando = ref(false)

const resetear = async () => {
  error.value = ''
  exito.value = ''
  cargando.value = true
  try {
    const res = await api.post('/api/users/resetear', form.value)
    exito.value = res.data.message
    setTimeout(() => router.push('/login'), 1500)
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al restablecer la contraseña'
  } finally {
    cargando.value = false
  }
}
</script>
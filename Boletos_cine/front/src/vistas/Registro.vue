<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">🎬</div>
      <h2 class="auth-title">Crear cuenta</h2>
      <p class="auth-subtitle">Regístrate para comprar tus entradas</p>

      <div v-if="error" class="auth-message error">{{ error }}</div>
      <div v-if="exito" class="auth-message exito">{{ exito }}</div>

      <form class="auth-form" @submit.prevent="registrar">
        <div class="auth-field">
          <input v-model="form.name" type="text" placeholder="Nombre" />
        </div>
        <div class="auth-field">
          <input v-model="form.email" type="email" placeholder="Correo electrónico" />
        </div>
        <div class="auth-field">
          <input v-model="form.password" type="password" placeholder="Contraseña (mín. 8 caracteres)" />
        </div>
        <div class="auth-field">
          <input v-model="form.confirmar" type="password" placeholder="Confirmar contraseña" />
        </div>
        <button type="submit" class="auth-button" :disabled="cargando">
          {{ cargando ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>

      <p class="auth-footer">
        ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
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
const form = ref({ name: '', email: '', password: '', confirmar: '' })
const error = ref('')
const exito = ref('')
const cargando = ref(false)

const registrar = async () => {
  error.value = ''
  exito.value = ''

  if (!form.value.name.trim() || !form.value.email.trim() || !form.value.password.trim()) {
    error.value = 'Todos los campos son requeridos'
    return
  }

  if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    error.value = 'Ingresa un correo electrónico válido'
    return
  }

  if (form.value.password.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  if (form.value.password !== form.value.confirmar) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  cargando.value = true

  try {
    const res = await api.post('/api/users/register', { name: form.value.name, email: form.value.email, password: form.value.password })
    exito.value = res.data.message
    form.value = { name: '', email: '', password: '', confirmar: '' }
    setTimeout(() => router.push('/login'), 1500)
  } catch (err) {
    const msg = err.response?.data?.error
    if (Array.isArray(msg)) {
      error.value = msg.join(', ')
    } else {
      error.value = msg || 'Error al registrar'
    }
  } finally {
    cargando.value = false
  }
}
</script>
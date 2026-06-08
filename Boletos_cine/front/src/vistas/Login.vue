<template>
  <div class="container">
    <h2>Iniciar sesión</h2>

    <div v-if="error" class="error">{{ error }}</div>

    <form @submit.prevent="login">
      <input v-model="form.email" type="email" placeholder="Email" />
      <input v-model="form.password" type="password" placeholder="Contraseña" />
      <button type="submit" :disabled="cargando">
        {{ cargando ? 'Ingresando...' : 'Ingresar' }}
      </button>
    </form>

    <p>¿No tienes cuenta? <a href="/registro">Regístrate</a></p>
  </div>
</template>

<script setup>
import '../styles/Login.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const form = ref({ email: '', password: '' })
const error = ref('')
const cargando = ref(false)
const router = useRouter()

const login = async () => {
  error.value = ''
  cargando.value = true
  try {
    const res = await axios.post('http://localhost:3000/api/users/login', form.value)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    router.push('/inicio')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al iniciar sesión'
  } finally {
    cargando.value = false
  }
}
</script>
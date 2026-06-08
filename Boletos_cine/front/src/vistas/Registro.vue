<template>
  <div class="container">
    <h2>Crear cuenta</h2>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="exito" class="exito">{{ exito }}</div>

    <form @submit.prevent="registrar">
      <input v-model="form.name" type="text" placeholder="Nombre" />
      <input v-model="form.email" type="email" placeholder="Email" />
      <input v-model="form.password" type="password" placeholder="Contraseña (mín. 8 caracteres)" />
      <button type="submit" :disabled="cargando">
        {{ cargando ? 'Registrando...' : 'Registrarse' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import '../styles/Registro.css'

const form = ref({ name: '', email: '', password: '' })
const error = ref('')
const exito = ref('')
const cargando = ref(false)

const registrar = async () => {
  error.value = ''
  exito.value = ''
  cargando.value = true

  try {
    const res = await axios.post('http://localhost:3000/api/users/register', form.value)
    exito.value = res.data.message
    form.value = { name: '', email: '', password: '' }
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


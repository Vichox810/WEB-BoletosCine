<template>
  <div class="container">
    <h2>Usuarios registrados</h2>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="cargando">Cargando usuarios...</div>
    <div v-else class="lista">
      <div v-for="user in usuarios" :key="user.id" class="card">
        <div class="info">
          <h3>{{ user.name }}</h3>
          <p>{{ user.email }}</p>
          <p>Registrado: {{ new Date(user.createdAt).toLocaleDateString('es-CL') }}</p>
        </div>
        <span :class="user.role === 'admin' ? 'badge-admin' : 'badge-user'">
          {{ user.role }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import '../styles/Usuarios.css'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const usuarios = ref([])
const cargando = ref(true)
const error = ref('')

const token = localStorage.getItem('token')

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    usuarios.value = res.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al cargar usuarios'
  } finally {
    cargando.value = false
  }
})
</script>
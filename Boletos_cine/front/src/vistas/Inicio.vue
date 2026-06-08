<template>
  <div class="container">
    <h2>Bienvenido, {{ user.name }}</h2>
    <p>Email: {{ user.email }}</p>
    <p>Rol: {{ user.role }}</p>
    <button @click="router.push('/peliculas')">Ver películas</button>
    <button @click="router.push('/funciones')">Ver cartelera</button>
    <button @click="logout">Cerrar sesión</button>
  </div>
</template>

<script setup>
import '../styles/Inicio.css'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>
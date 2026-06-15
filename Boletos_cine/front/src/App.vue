<template>
  <div id="app-base">
    <!-- BARRA DE NAVEGACIÓN GLOBAL -->
    <nav class="navbar" v-if="mostrarNavbar">
      <div class="navbar-brand" @click="router.push('/')">
        <span class="logo-fruti">Fruti</span><span class="logo-cine">Cine</span>
      </div>
      
      <div class="navbar-links">
        <router-link to="/" class="nav-item">Inicio</router-link>
        <router-link to="/funciones" class="nav-item">Cartelera</router-link>
        <router-link to="/peliculas" class="nav-item">Películas</router-link>
        <router-link v-if="isAdmin()" to="/usuarios" class="nav-item">Usuarios</router-link>
        <router-link v-if="isAdmin()" to="/dashboard" class="nav-item">Dashboard</router-link>
      </div>

      <div class="navbar-user">
        <span class="user-name">👋 Hola, {{ user.name || 'Usuario' }}</span>
        <button class="btn-logout" @click="cerrarSesion">Salir</button>
      </div>
    </nav>

    <!-- AQUÍ SE RENDERIZAN TUS VISTAS SEGÚN LA RUTA -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const user = ref({})

// Cargar los datos del usuario local
const actualizarUsuario = () => {
  user.value = JSON.parse(localStorage.getItem('user') || '{}')
}

// Saber si el usuario es administrador
const isAdmin = () => user.value.role === 'admin'

// Ocultar la barra de navegación en las pantallas de Login, Registro y Password Reset para que no moleste
const mostrarNavbar = computed(() => {
  const rutasSinNavbar = ['/login', '/registro', '/solicitar-reset', '/resetear']
  return !rutasSinNavbar.includes(route.path)
})

// Función para cerrar sesión limpiamente
const cerrarSesion = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  user.value = {}
  router.push('/login')
}

// Escuchar cambios de ruta para refrescar los datos del usuario por si inicia sesión con otra cuenta
watch(() => route.path, () => {
  actualizarUsuario()
})

onMounted(() => {
  actualizarUsuario()
})
</script>

<style>

body {
  margin: 0;
  background-color: #0b0a10; /* Fondo general oscuro para todo el cine */
  font-family: 'Segoe UI', Roboto, sans-serif;
}

#app-base {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(21, 20, 31, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 15px 40px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* Logo Estilizado */
.navbar-brand {
  font-size: 1.5rem;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: -0.5px;
}

.logo-fruti {
  color: #ff4757; /* Rojo coral */
}

.logo-cine {
  color: #ffffff;
}

/* Links de Navegación */
.navbar-links {
  display: flex;
  gap: 25px;
}

.nav-item {
  color: #a0aec0;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s ease, transform 0.2s;
  position: relative;
  padding: 5px 0;
}

.nav-item:hover {
  color: #ffffff;
}

/* Línea sutil indicadora debajo de la pestaña activa */
.router-link-active.nav-item {
  color: #ff4757;
}

.router-link-active.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ff4757;
  border-radius: 2px;
}

/* Sección de Usuario y Logout */
.navbar-user {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-name {
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-logout {
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.2);
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #ff4757;
  color: white;
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.2);
}

.main-content {
  flex-grow: 1;
}
</style>
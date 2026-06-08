<template>
  <div class="dashboard">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-container">
        <div class="logo">
          <span class="logo-icon">🎬</span>
          <span class="logo-text">FrutiCine</span>
        </div>
        <div class="nav-links">
          <router-link to="/inicio" class="nav-link">Inicio</router-link>
          <router-link to="/peliculas" class="nav-link">Películas</router-link>
          <router-link to="/funciones" class="nav-link">Funciones</router-link>
          <router-link to="/dashboard" class="nav-link admin-link">📊 Panel de Administrador</router-link>
          <button @click="logout" class="nav-button logout">Cerrar Sesión</button>
        </div>
      </div>
    </nav>

    <div class="dashboard-content">
      <h1>📊 Panel de Administrador</h1>
      <p class="subtitle">Resumen general del sistema</p>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.usuarios }}</div>
            <div class="stat-label">Usuarios registrados</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎬</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.peliculas }}</div>
            <div class="stat-label">Películas en catálogo</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.funciones }}</div>
            <div class="stat-label">Funciones programadas</div>
          </div>
        </div>
      </div>

      <!-- Usuarios recientes -->
      <div class="section">
        <h2>👤 Últimos usuarios registrados</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in ultimosUsuarios" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span :class="user.role === 'admin' ? 'badge-admin' : 'badge-user'">
                    {{ user.role }}
                  </span>
                </td>
                <td>{{ new Date(user.createdAt).toLocaleDateString('es-CL') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn-ver-todos" @click="router.push('/usuarios')">Ver todos los usuarios</button>
      </div>

      <!-- Funciones recientes -->
      <div class="section">
        <h2>📅 Próximas funciones</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Película</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Sala</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="funcion in ultimasFunciones" :key="funcion.id">
                <td>{{ funcion.Pelicula?.titulo }}</td>
                <td>{{ new Date(funcion.fecha).toLocaleDateString('es-CL') }}</td>
                <td>{{ funcion.hora }}</td>
                <td>{{ funcion.sala }}</td>
                <td>${{ funcion.precio }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn-ver-todos" @click="router.push('/funciones')">Ver todas las funciones</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import '../styles/Dashboard.css'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const token = localStorage.getItem('token')
const authHeader = { headers: { Authorization: `Bearer ${token}` } }

const stats = ref({ usuarios: 0, peliculas: 0, funciones: 0 })
const ultimosUsuarios = ref([])
const ultimasFunciones = ref([])

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(async () => {
  try {
    const [usersRes, peliculasRes, funcionesRes] = await Promise.all([
      axios.get('http://localhost:3000/api/users', authHeader),
      axios.get('http://localhost:3000/api/peliculas'),
      axios.get('http://localhost:3000/api/funciones')
    ])

    stats.value = {
      usuarios: usersRes.data.length,
      peliculas: peliculasRes.data.length,
      funciones: funcionesRes.data.length
    }

    ultimosUsuarios.value = usersRes.data.slice(-5).reverse()
    ultimasFunciones.value = funcionesRes.data.slice(-5).reverse()
  } catch (err) {
    console.error('Error al cargar dashboard:', err)
  }
})
</script>
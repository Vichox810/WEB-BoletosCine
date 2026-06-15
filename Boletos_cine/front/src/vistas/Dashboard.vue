<template>
  <div class="dashboard">
    <!-- Se eliminó la navbar duplicada que causaba el desorden visual -->

    <div class="dashboard-content">
      <h1>Panel de Administrator</h1>
      <p class="subtitle">Resumen general del sistema</p>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"></div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.usuarios }}</div>
            <div class="stat-label">Usuarios registrados</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"></div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.peliculas }}</div>
            <div class="stat-label">Películas en catálogo</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"></div>
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
        <h2>Próximas funciones</h2>
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

      <!-- Promociones -->
      <div class="section">
        <h2> Promociones activas</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descuento</th>
                <th>Descripción</th>
                <th>Usos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="promo in promociones" :key="promo.id">
                <td><strong>{{ promo.codigo }}</strong></td>
                <td>{{ promo.descuento }}%</td>
                <td>{{ promo.descripcion }}</td>
                <td>{{ promo.usosActuales }}/{{ promo.usosMaximos }}</td>
                <td>
                  <span :class="promo.activa ? 'badge-activa' : 'badge-inactiva'">
                    {{ promo.activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '../styles/Dashboard.css'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const token = localStorage.getItem('token')
const authHeader = { headers: { Authorization: `Bearer ${token}` } }

const stats = ref({ usuarios: 0, peliculas: 0, funciones: 0 })
const ultimosUsuarios = ref([])
const ultimasFunciones = ref([])
const promociones = ref([])

// Dejamos la función logout intacta por si la necesitas referenciar desde otro componente, aunque ya no se use en este HTML
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(async () => {
  try {
    const [usersRes, peliculasRes, funcionesRes, promocionesRes] = await Promise.all([
      api.get('/api/users', authHeader),
      api.get('/api/peliculas'),
      api.get('/api/funciones'),
      api.get('/api/promociones', authHeader).catch(() => null)
    ])

    stats.value = {
      usuarios: usersRes.data.length,
      peliculas: peliculasRes.data.length,
      funciones: funcionesRes.data.length
    }

    ultimosUsuarios.value = usersRes.data.slice(-5).reverse()
    ultimasFunciones.value = funcionesRes.data.slice(-5).reverse()
    if (promocionesRes) promociones.value = promocionesRes.data
  } catch (err) {
    console.error('Error al cargar dashboard:', err)
  }
})
</script>
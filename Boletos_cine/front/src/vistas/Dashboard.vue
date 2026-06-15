<template>
  <div class="dashboard">
    <div class="dashboard-content">
      <h1>Panel de Administrador</h1>
      <p class="subtitle">Resumen general del sistema</p>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ stats.usuarios }}</div>
          <div class="stat-label">Usuarios registrados</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.peliculas }}</div>
          <div class="stat-label">Películas en catálogo</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.funciones }}</div>
          <div class="stat-label">Funciones programadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ boletosStats.totalBoletos }}</div>
          <div class="stat-label">Boletos vendidos</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${{ Number(boletosStats.ingresosTotales).toLocaleString('es-CL') }}</div>
          <div class="stat-label">Ingresos totales</div>
        </div>
      </div>

      <!-- Últimas ventas -->
      <div class="section">
        <h2>🎟️ Últimas ventas</h2>
        <div v-if="ventasCargando" class="loading-tabla">Cargando ventas...</div>
        <div v-else class="table-container">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Película</th>
                <th>Asiento</th>
                <th>Fecha</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="boleto in ultimasVentas" :key="boleto.id">
                <td>{{ boleto.User?.name || '—' }}</td>
                <td>{{ boleto.Funcion?.Pelicula?.titulo || '—' }}</td>
                <td>{{ boleto.asiento }}</td>
                <td>{{ new Date(boleto.createdAt).toLocaleDateString('es-CL') }}</td>
                <td>${{ Number(boleto.totalPagado || 0).toLocaleString('es-CL') }}</td>
              </tr>
              <tr v-if="ultimasVentas.length === 0">
                <td colspan="5" style="text-align:center; color:#94a3b8;">No hay ventas registradas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Boletos por película -->
      <div class="section" v-if="boletosStats.boletosPorPelicula?.length > 0">
        <h2>📊 Boletos por película</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Película</th>
                <th>Boletos vendidos</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in boletosStats.boletosPorPelicula" :key="item.pelicula">
                <td><strong>{{ item.pelicula }}</strong></td>
                <td>{{ item.total }}</td>
                <td>${{ Number(item.ingresos || 0).toLocaleString('es-CL') }}</td>
              </tr>
            </tbody>
          </table>
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
        <h2>🏷️ Promociones activas</h2>
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
const boletosStats = ref({ totalBoletos: 0, ingresosTotales: 0, boletosPorPelicula: [] })
const ultimosUsuarios = ref([])
const ultimasFunciones = ref([])
const promociones = ref([])
const ultimasVentas = ref([])
const ventasCargando = ref(true)

onMounted(async () => {
  try {
    const [usersRes, peliculasRes, funcionesRes, promocionesRes, boletosStatsRes, ventasRes] = await Promise.all([
      api.get('/api/users', authHeader),
      api.get('/api/peliculas'),
      api.get('/api/funciones'),
      api.get('/api/promociones', authHeader).catch(() => null),
      api.get('/api/boletos/admin/stats', authHeader).catch(() => null),
      api.get('/api/boletos/admin/ventas', authHeader).catch(() => null)
    ])

    stats.value = {
      usuarios: usersRes.data.length,
      peliculas: peliculasRes.data.length,
      funciones: funcionesRes.data.length
    }

    if (boletosStatsRes) boletosStats.value = boletosStatsRes.data
    if (ventasRes) {
      ultimasVentas.value = ventasRes.data
      ventasCargando.value = false
    } else {
      ventasCargando.value = false
    }

    ultimosUsuarios.value = usersRes.data.slice(-5).reverse()
    ultimasFunciones.value = funcionesRes.data.slice(-5).reverse()
    if (promocionesRes) promociones.value = promocionesRes.data
  } catch (err) {
    console.error('Error al cargar dashboard:', err)
    ventasCargando.value = false
  }
})
</script>

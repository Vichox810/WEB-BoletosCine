<template>
  <div class="ticket-page">
    <div v-if="error" class="ticket-card">
      <div class="ticket-header">
        <h2>Error</h2>
        <p style="color:#fca5a5; margin-top:0.5rem;">{{ error }}</p>
      </div>
      <button class="btn-home" @click="router.push('/funciones')">Volver a cartelera</button>
    </div>

    <div v-else-if="cargando" class="ticket-card">
      <p style="color:#94a3b8;">Cargando detalles de tu compra...</p>
    </div>

    <div v-else-if="boletos.length === 1" class="ticket-card">
      <div class="ticket-header">
        <h2>🎬 ¡Compra exitosa!</h2>
        <p style="color:#94a3b8; font-size:0.9rem;">Gracias por tu compra</p>
      </div>
      <div class="ticket-body">
        <div class="info-row">
          <span class="label">Película</span>
          <span class="value">{{ boletos[0].Funcion?.Pelicula?.titulo }}</span>
        </div>
        <div class="info-row">
          <span class="label">Fecha</span>
          <span class="value">{{ new Date(boletos[0].Funcion?.fecha).toLocaleDateString('es-CL') }}</span>
        </div>
        <div class="info-row">
          <span class="label">Hora</span>
          <span class="value highlight">{{ boletos[0].Funcion?.hora }}</span>
        </div>
        <div class="info-row">
          <span class="label">Sala</span>
          <span class="value">{{ boletos[0].Funcion?.sala }}</span>
        </div>
        <div class="info-row">
          <span class="label">Asiento</span>
          <span class="value highlight">{{ boletos[0].asiento }}</span>
        </div>
        <div v-if="boletos[0].codigoPromo" class="info-row">
          <span class="label">Promoción</span>
          <span class="value" style="color:#22c55e;">{{ boletos[0].codigoPromo }}</span>
        </div>
        <div class="info-row" style="border-top:1px solid #334155; padding-top:1rem; margin-top:1rem;">
          <span class="label">Total pagado</span>
          <span class="value price">${{ Number(boletos[0].totalPagado || 0).toLocaleString('es-CL') }}</span>
        </div>
      </div>
      <button class="btn-home" @click="router.push('/funciones')">Volver a cartelera</button>
    </div>

    <div v-else class="ticket-card">
      <div class="ticket-header">
        <h2>🎬 ¡Compra exitosa!</h2>
        <p style="color:#94a3b8; font-size:0.9rem;">Gracias por tu compra</p>
      </div>
      <div class="ticket-body">
        <div class="info-row">
          <span class="label">Película</span>
          <span class="value">{{ boletos[0].Funcion?.Pelicula?.titulo }}</span>
        </div>
        <div class="info-row">
          <span class="label">Fecha</span>
          <span class="value">{{ new Date(boletos[0].Funcion?.fecha).toLocaleDateString('es-CL') }}</span>
        </div>
        <div class="info-row">
          <span class="label">Hora</span>
          <span class="value highlight">{{ boletos[0].Funcion?.hora }}</span>
        </div>
        <div class="info-row">
          <span class="label">Sala</span>
          <span class="value">{{ boletos[0].Funcion?.sala }}</span>
        </div>
        <div class="info-row" style="border-top:1px solid #334155; padding-top:1rem; margin-top:1rem;">
          <span class="label">Asientos</span>
          <span class="value highlight">{{ boletos.map(b => b.asiento).sort((a, b) => a - b).join(', ') }}</span>
        </div>
        <div v-if="boletos[0].codigoPromo" class="info-row">
          <span class="label">Promoción</span>
          <span class="value" style="color:#22c55e;">{{ boletos[0].codigoPromo }}</span>
        </div>
        <div class="info-row">
          <span class="label">Total pagado</span>
          <span class="value price">${{ Number(boletos[0].totalPagado || 0).toLocaleString('es-CL') }}</span>
        </div>
      </div>
      <button class="btn-home" @click="router.push('/funciones')">Volver a cartelera</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
import '../styles/Boleta.css'

const route = useRoute()
const router = useRouter()
const boletos = ref([])
const error = ref(null)
const cargando = ref(true)

onMounted(async () => {
  try {
    if (route.name === 'BoletaGrupo') {
      const res = await api.get(`/api/boletos/grupo/${route.params.grupoCompra}`)
      boletos.value = res.data.boletos
    } else {
      const res = await api.get(`/api/boletos/${route.params.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      boletos.value = [res.data]
    }
  } catch (err) {
    if (err.response?.status === 401) {
      router.push('/login')
    } else {
      error.value = err.response?.data?.message || 'Error al cargar el boleto'
    }
  } finally {
    cargando.value = false
  }
})
</script>

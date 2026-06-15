<template>
  <div class="ticket-page">
    <div v-if="error" class="ticket-card">
      <div class="ticket-header">
        <h2>Error</h2>
        <p style="color:#fca5a5; margin-top:0.5rem;">{{ error }}</p>
      </div>
      <button class="btn-home" @click="router.push('/funciones')">Volver a cartelera</button>
    </div>
    <div v-else-if="!boleto" class="ticket-card">
      <p style="color:#94a3b8;">Cargando detalles de tu compra...</p>
    </div>
    <div v-else class="ticket-card">
      <div class="ticket-header">
        <h2>🎬 ¡Compra exitosa!</h2>
        <p style="color:#94a3b8; font-size:0.9rem;">Gracias por tu compra</p>
      </div>
      <div class="ticket-body">
        <div class="info-row">
          <span class="label">Película</span>
          <span class="value">{{ boleto.Funcion?.Pelicula?.titulo }}</span>
        </div>
        <div class="info-row">
          <span class="label">Fecha</span>
          <span class="value">{{ new Date(boleto.Funcion?.fecha).toLocaleDateString('es-CL') }}</span>
        </div>
        <div class="info-row">
          <span class="label">Hora</span>
          <span class="value highlight">{{ boleto.Funcion?.hora }}</span>
        </div>
        <div class="info-row">
          <span class="label">Sala</span>
          <span class="value">{{ boleto.Funcion?.sala }}</span>
        </div>
        <div class="info-row">
          <span class="label">Asiento</span>
          <span class="value highlight">{{ boleto.asiento }}</span>
        </div>
        <div v-if="boleto.codigoPromo" class="info-row">
          <span class="label">Promoción</span>
          <span class="value" style="color:#22c55e;">{{ boleto.codigoPromo }}</span>
        </div>
        <div class="info-row" style="border-top:1px solid #334155; padding-top:1rem; margin-top:1rem;">
          <span class="label">Total pagado</span>
          <span class="value price">${{ Number(boleto.totalPagado || 0).toLocaleString('es-CL') }}</span>
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
const boleto = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    const res = await api.get(`/api/boletos/${route.params.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    boleto.value = res.data
  } catch (err) {
    if (err.response?.status === 401) {
      router.push('/login')
    } else {
      error.value = err.response?.data?.message || 'Error al cargar el boleto'
    }
  }
})
</script>
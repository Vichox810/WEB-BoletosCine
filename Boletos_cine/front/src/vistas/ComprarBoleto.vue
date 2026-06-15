<template>
  <div class="container">
    <button class="btn-volver" @click="router.push('/funciones')">← Volver a cartelera</button>

    <div v-if="error" class="error-box">
      <h3>Error: {{ error }}</h3>
    </div>

    <div v-else-if="!funcion" class="loading">Cargando función...</div>

    <div v-else class="content">
      <h2>{{ funcion.Pelicula?.titulo }}</h2>
      <p class="info-funcion">
        {{ new Date(funcion.fecha).toLocaleDateString('es-CL') }} · {{ funcion.hora }} ·
        Sala {{ funcion.sala }} · ${{ funcion.precio }} por asiento
      </p>

      <div class="pantalla">Pantalla</div>

      <div class="sala">
        <div v-for="fila in filas" :key="fila.index" class="fila">
          <button
            v-for="asiento in fila.asientos"
            :key="asiento"
            :class="[
              'asiento',
              { seleccionado: asientoSeleccionado === asiento,
                ocupado: ocupados.includes(String(asiento)) }
            ]"
            :disabled="ocupados.includes(String(asiento))"
            @click="seleccionarAsiento(asiento)"
          >
            {{ asiento }}
          </button>
        </div>
      </div>

      <div v-if="asientoSeleccionado" class="resumen">
        <p>Asiento seleccionado: <strong>{{ asientoSeleccionado }}</strong></p>

        <div class="promo-section">
          <input v-model="codigoPromo" placeholder="Código promocional" class="input-promo"
            :disabled="promoValido" @keyup.enter="validarPromo" />
          <button v-if="!promoValido" class="btn-promo" @click="validarPromo" :disabled="validandoPromo">
            {{ validandoPromo ? '...' : 'Aplicar' }}
          </button>
          <button v-else class="btn-promo-remover" @click="removerPromo">✕</button>
        </div>
        <p v-if="mensajePromo" :class="promoValido ? 'promo-ok' : 'promo-error'">{{ mensajePromo }}</p>

        <p v-if="precioFinal < funcion.precio">
          Subtotal: <strong>${{ funcion.precio }}</strong><br />
          Descuento: <strong class="descuento">-{{ descuentoAplicado }}%</strong><br />
          Total: <strong class="total-final">${{ precioFinal }}</strong>
        </p>
        <p v-else>Total: <strong>${{ funcion.precio }}</strong></p>

        <button class="btn-confirmar" :disabled="comprando" @click="comprarBoleto">
          {{ comprando ? 'Procesando...' : 'Confirmar compra' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
import '../styles/ComprarBoleto.css'

const route = useRoute()
const router = useRouter()
const funcion = ref(null)
const ocupados = ref([])
const error = ref(null)
const asientoSeleccionado = ref(null)
const comprando = ref(false)
const codigoPromo = ref('')
const validandoPromo = ref(false)
const promoValido = ref(false)
const descuentoAplicado = ref(0)
const mensajePromo = ref('')

const BUTACAS_POR_FILA = 5
const TOTAL_BUTACAS = 40
const filas = Array.from({ length: TOTAL_BUTACAS / BUTACAS_POR_FILA }, (_, i) => ({
  index: i,
  asientos: Array.from({ length: BUTACAS_POR_FILA }, (_, j) => i * BUTACAS_POR_FILA + j + 1)
}))

const seleccionarAsiento = (n) => {
  if (ocupados.value.includes(String(n))) return
  asientoSeleccionado.value = asientoSeleccionado.value === n ? null : n
}

const cargarDatos = async () => {
  const idRaw = route.params.id
  const idLimpio = idRaw ? idRaw.split(':')[0] : null

  if (!idLimpio) {
    error.value = 'ID de función inválido'
    return
  }

  try {
    const token = localStorage.getItem('token')
    const authHeader = { headers: { Authorization: `Bearer ${token}` } }

    const [f, o] = await Promise.all([
      api.get(`/api/funciones/${idLimpio}`),
      api.get(`/api/boletos/funcion/${idLimpio}`, authHeader)
    ])

    funcion.value = f.data
    ocupados.value = o.data.map(b => String(b.asiento))
  } catch (err) {
    console.error('Error al cargar:', err)
    if (err.response?.status === 401) {
      router.push('/login')
    } else {
      error.value = err.response?.data?.error || err.message
    }
  }
}

const precioFinal = computed(() => {
  if (!funcion.value) return 0
  const precio = Number(funcion.value.precio)
  return descuentoAplicado.value > 0
    ? Math.round(precio * (1 - descuentoAplicado.value / 100))
    : precio
})

const validarPromo = async () => {
  if (!codigoPromo.value.trim()) return
  validandoPromo.value = true
  mensajePromo.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await api.post('/api/promociones/validar', {
      codigo: codigoPromo.value.trim()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.data.valido) {
      promoValido.value = true
      descuentoAplicado.value = res.data.descuento
      mensajePromo.value = `¡Código aplicado! ${res.data.descuento}% de descuento`
    }
  } catch (err) {
    promoValido.value = false
    descuentoAplicado.value = 0
    mensajePromo.value = err.response?.data?.message || 'Código inválido'
  } finally {
    validandoPromo.value = false
  }
}

const removerPromo = () => {
  codigoPromo.value = ''
  promoValido.value = false
  descuentoAplicado.value = 0
  mensajePromo.value = ''
}

const comprarBoleto = async () => {
  if (!asientoSeleccionado.value || !funcion.value) return
  comprando.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await api.post('/api/boletos', {
      FuncionId: funcion.value.id,
      asiento: String(asientoSeleccionado.value),
      totalPagado: precioFinal.value,
      codigoPromo: promoValido.value ? codigoPromo.value : undefined
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    router.push(`/boleta/${res.data.id}`)
  } catch (err) {
    if (err.response?.status === 409) {
      error.value = 'Este asiento ya fue ocupado. Selecciona otro.'
      ocupados.value.push(String(asientoSeleccionado.value))
      asientoSeleccionado.value = null
    } else if (err.response?.status === 401) {
      router.push('/login')
    } else {
      error.value = err.response?.data?.message || 'Error al comprar el boleto'
    }
  } finally {
    comprando.value = false
  }
}

onMounted(cargarDatos)
</script>
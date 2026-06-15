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

      <p class="seleccion-info" v-if="asientosSeleccionados.length > 0">
        Asientos seleccionados: <strong>{{ asientosSeleccionados.sort((a, b) => a - b).join(', ') }}</strong>
      </p>

      <div class="pantalla">Pantalla</div>

      <div class="sala">
        <div v-for="fila in filas" :key="fila.index" class="fila">
          <button
            v-for="asiento in fila.asientos"
            :key="asiento"
            :class="[
              'asiento',
              { seleccionado: asientosSeleccionados.includes(asiento),
                ocupado: ocupados.includes(String(asiento)) }
            ]"
            :disabled="ocupados.includes(String(asiento))"
            @click="toggleAsiento(asiento)"
          >
            {{ asiento }}
          </button>
        </div>
      </div>

      <div v-if="asientosSeleccionados.length > 0" class="resumen">
        <p>{{ asientosSeleccionados.length }} asiento(s) seleccionado(s)</p>

        <div class="promo-section">
          <input v-model="codigoPromo" placeholder="Código promocional" class="input-promo"
            :disabled="promoValido" @keyup.enter="validarPromo" />
          <button v-if="!promoValido" class="btn-promo" @click="validarPromo" :disabled="validandoPromo">
            {{ validandoPromo ? '...' : 'Aplicar' }}
          </button>
          <button v-else class="btn-promo-remover" @click="removerPromo">✕</button>
        </div>
        <p v-if="mensajePromo" :class="promoValido ? 'promo-ok' : 'promo-error'">{{ mensajePromo }}</p>

        <p>
          Subtotal: <strong>${{ subtotal }}</strong><br />
          <span v-if="descuentoAplicado > 0">
            Descuento: <strong class="descuento">-{{ descuentoAplicado }}%</strong><br />
          </span>
          Total: <strong class="total-final">${{ precioFinal }}</strong>
        </p>

        <button class="btn-confirmar" :disabled="comprando" @click="comprarBoletos">
          {{ comprando ? 'Procesando...' : `Comprar ${asientosSeleccionados.length} asiento(s) por $${precioFinal}` }}
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
const asientosSeleccionados = ref([])
const comprando = ref(false)
const codigoPromo = ref('')
const validandoPromo = ref(false)
const promoValido = ref(false)
const descuentoAplicado = ref(0)
const mensajePromo = ref('')

const BUTACAS_POR_FILA = 5
const filas = computed(() => {
  const total = funcion.value?.limiteAsientos || 40
  return Array.from({ length: total / BUTACAS_POR_FILA }, (_, i) => ({
    index: i,
    asientos: Array.from({ length: BUTACAS_POR_FILA }, (_, j) => i * BUTACAS_POR_FILA + j + 1)
  }))
})

const toggleAsiento = (n) => {
  if (ocupados.value.includes(String(n))) return
  const idx = asientosSeleccionados.value.indexOf(n)
  if (idx === -1) {
    asientosSeleccionados.value = [...asientosSeleccionados.value, n]
  } else {
    asientosSeleccionados.value = asientosSeleccionados.value.filter(a => a !== n)
  }
}

const subtotal = computed(() => {
  if (!funcion.value) return 0
  return Number(funcion.value.precio) * asientosSeleccionados.value.length
})

const precioFinal = computed(() => {
  return descuentoAplicado.value > 0
    ? Math.round(subtotal.value * (1 - descuentoAplicado.value / 100))
    : subtotal.value
})

const cargarDatos = async () => {
  const idRaw = route.params.id
  const idLimpio = idRaw ? idRaw.split(':')[0] : null

  if (!idLimpio) {
    error.value = 'ID de función inválido'
    return
  }

  try {
    const [f, o] = await Promise.all([
      api.get(`/api/funciones/${idLimpio}`),
      api.get(`/api/boletos/funcion/${idLimpio}`)
    ])

    funcion.value = f.data
    ocupados.value = o.data.map(b => String(b.asiento))
  } catch (err) {
    console.error('Error al cargar:', err)
    error.value = err.response?.data?.error || err.message
  }
}

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

const comprarBoletos = async () => {
  if (asientosSeleccionados.value.length === 0 || !funcion.value) return

  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

  comprando.value = true
  try {
    const res = await api.post('/api/boletos/comprar-multiple', {
      FuncionId: funcion.value.id,
      asientos: asientosSeleccionados.value,
      codigoPromo: promoValido.value ? codigoPromo.value : undefined
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    router.push(`/boleta/grupo/${res.data.grupoCompra}`)
  } catch (err) {
    if (err.response?.status === 409) {
      const msg = err.response?.data?.message || 'Algunos asientos ya están ocupados'
      error.value = msg
    } else if (err.response?.status === 401) {
      router.push('/login')
    } else {
      error.value = err.response?.data?.message || 'Error al comprar los boletos'
    }
  } finally {
    comprando.value = false
  }
}

onMounted(cargarDatos)
</script>

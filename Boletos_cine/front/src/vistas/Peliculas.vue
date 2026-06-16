<template>
  <div class="container">
    <div class="header">
      <h2>Películas</h2>
      <button v-if="isAdmin()" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? 'Cancelar' : 'Nueva película' }}
      </button>
    </div>

    <!-- Formulario de Agregar / Editar -->
    <div v-if="mostrarFormulario" class="formulario">
      <h3>{{ editando ? 'Editar película' : 'Agregar película' }}</h3>
      <div v-if="error" class="error">{{ error }}</div>
      <input v-model="form.titulo" type="text" placeholder="Título" />
      <input v-model="form.genero" type="text" placeholder="Género" />
      <input v-model="form.duracion" type="number" placeholder="Duración (min)" />
      <input v-model="form.sinopsis" type="text" placeholder="Sinopsis (opcional)" />
      <button @click="editando ? actualizarPelicula() : crearPelicula()" :disabled="cargando">
        {{ cargando ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>


    <div v-if="!cargandoLista && peliculas.length > 0" class="filtros-container">
      <input 
        v-model="filtroTitulo" 
        type="text" 
        placeholder="Buscar película por título..." 
        class="input-filtro"
      />
      <select v-model="filtroGenero" class="select-filtro">
        <option value="">Todos los géneros</option>
        <option v-for="genero in listaGeneros" :key="genero" :value="genero">
          {{ genero }}
        </option>
      </select>
    </div>

    <!-- Estados de Carga y Vacío -->
    <div v-if="cargandoLista" class="skeleton-lista">
      <div v-for="n in 6" :key="n" class="skeleton-card">
        <div class="skeleton-poster"></div>
        <div class="skeleton-info">
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
        </div>
      </div>
    </div>
    <div v-else-if="peliculasFiltradas.length === 0" class="no-resultados">
      <div class="vacio-icono">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
          <line x1="8" y1="2" x2="8" y2="22"></line>
          <line x1="16" y1="2" x2="16" y2="22"></line>
          <line x1="2" y1="8" x2="22" y2="8"></line>
          <line x1="2" y1="16" x2="22" y2="16"></line>
        </svg>
      </div>
      <p>No se encontraron peliculas con los filtros aplicados.</p>
    </div>

    <!-- Renderizado del Catálogo Filtrado -->
    <div v-else class="lista">
      <div v-for="pelicula in peliculasFiltradas" :key="pelicula.id" class="card">
        <div class="poster-container">
          <img v-if="pelicula.imagen" :src="`/movies/${pelicula.imagen}`" :alt="pelicula.titulo" />
          <div v-else class="poster-placeholder" :style="{ background: placeholderGradient(pelicula.titulo) }">
            <span class="placeholder-inicial">{{ pelicula.titulo.charAt(0).toUpperCase() }}</span>
          </div>
          <span class="badge-duracion">{{ pelicula.duracion }} min</span>
          <div class="poster-overlay"></div>
        </div>
        <div class="info">
          <h3>{{ pelicula.titulo }}</h3>
          <span class="badge-genero">{{ pelicula.genero }}</span>
          <p v-if="pelicula.sinopsis" class="sinopsis">{{ pelicula.sinopsis }}</p>
        </div>
        <div class="acciones" v-if="isAdmin()">
          <button class="btn-editar" @click="abrirEditar(pelicula)">Editar</button>
          <button class="btn-eliminar" @click="eliminarPelicula(pelicula.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '../styles/Peliculas.css'
import { ref, onMounted, computed } from 'vue'
import api from '../api'

const peliculas = ref([])
const cargandoLista = ref(true)
const cargando = ref(false)
const error = ref('')
const mostrarFormulario = ref(false)
const editando = ref(false)
const editandoId = ref(null)
const form = ref({ titulo: '', genero: '', duracion: '', sinopsis: '' })

// Estados para el manejo de filtros (RQ-07)
const filtroTitulo = ref('')
const filtroGenero = ref('')

const token = localStorage.getItem('token')
const authHeader = { headers: { Authorization: `Bearer ${token}` } }
const user = JSON.parse(localStorage.getItem('user') || '{}')

const isAdmin = () => user.role === 'admin'

const paletas = [
  ['#ff4757', '#ff6b81'],
  ['#2ed573', '#7bed9f'],
  ['#1e90ff', '#70a1ff'],
  ['#eccc68', '#ffd93d'],
  ['#ff6348', '#ff7f50'],
  ['#a29bfe', '#6c5ce7'],
  ['#fd79a8', '#e84393'],
  ['#00cec9', '#55efc4'],
]

const placeholderGradient = (titulo) => {
  const index = titulo.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const cols = paletas[index % paletas.length]
  return `linear-gradient(135deg, ${cols[0]}, ${cols[1]})`
}

// Extrae dinámicamente los géneros existentes en la BD para armar el selector
const listaGeneros = computed(() => {
  const generos = peliculas.value.map(p => p.genero?.trim())
  return [...new Set(generos)].filter(Boolean)
})

// PROPIEDAD COMPUTADA CRÍTICA: Aplica los filtros en tiempo real
const peliculasFiltradas = computed(() => {
  return peliculas.value.filter(pelicula => {
    const coincideTitulo = pelicula.titulo
      ?.toLowerCase()
      .includes(filtroTitulo.value.toLowerCase())
    
    const coincideGenero = !filtroGenero.value || 
      pelicula.genero?.toLowerCase() === filtroGenero.value.toLowerCase()

    return coincideTitulo && coincideGenero
  })
})

const cargarPeliculas = async () => {
  try {
    const res = await api.get('/api/peliculas')
    peliculas.value = res.data
  } catch {
    error.value = 'Error al cargar películas'
  } finally {
    cargandoLista.value = false
  }
}

const abrirEditar = (pelicula) => {
  editando.value = true
  editandoId.value = pelicula.id
  form.value = { titulo: pelicula.titulo, genero: pelicula.genero, duracion: pelicula.duracion, sinopsis: pelicula.sinopsis || '' }
  mostrarFormulario.value = true
}

const imagenes = ['pelicula1.jpg', 'pelicula3.jpg', 'Pelicula2.jpeg']

const crearPelicula = async () => {
  error.value = ''

  if (!form.value.titulo.trim() || !form.value.genero.trim() || !form.value.duracion) {
    error.value = 'Todos los campos son requeridos'
    return
  }

  cargando.value = true
  try {
    const data = {
      ...form.value,
      imagen: imagenes[peliculas.value.length % imagenes.length]
    }
    await api.post('/api/peliculas', data, authHeader)
    form.value = { titulo: '', genero: '', duracion: '', sinopsis: '' }
    mostrarFormulario.value = false
    await cargarPeliculas()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear película'
  } finally {
    cargando.value = false
  }
}

const actualizarPelicula = async () => {
  error.value = ''

  if (!form.value.titulo.trim() || !form.value.genero.trim() || !form.value.duracion) {
    error.value = 'Todos los campos son requeridos'
    return
  }

  cargando.value = true
  try {
    await api.put(`/api/peliculas/${editandoId.value}`, form.value, authHeader)
    form.value = { titulo: '', genero: '', duracion: '', sinopsis: '' }
    mostrarFormulario.value = false
    editando.value = false
    editandoId.value = null
    await cargarPeliculas()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al actualizar película'
  } finally {
    cargando.value = false
  }
}

const eliminarPelicula = async (id) => {
  if (!confirm('¿Eliminar esta película?')) return
  try {
    await api.delete(`/api/peliculas/${id}`, authHeader)
    await cargarPeliculas()
  } catch {
    error.value = 'Error al eliminar película'
  }
}

onMounted(cargarPeliculas)
</script>
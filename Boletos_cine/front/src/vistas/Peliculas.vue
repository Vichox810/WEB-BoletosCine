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
    <div v-if="cargandoLista">Cargando películas...</div>
    <div v-else-if="peliculasFiltradas.length === 0" class="no-resultados">
      No se encontraron películas con los filtros aplicados.
    </div>

    <!-- Renderizado del Catálogo Filtrado -->
    <div v-else class="lista">
      <div v-for="pelicula in peliculasFiltradas" :key="pelicula.id" class="card">
        <div class="info">
          <h3>{{ pelicula.titulo }}</h3>
          <span class="badge-genero">{{ pelicula.genero }}</span>
          <p class="meta-info">{{ pelicula.duracion }} min</p>
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
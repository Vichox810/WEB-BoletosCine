<template>
  <div class="container">
    <div class="header">
      <h2>Películas</h2>
      <button v-if="isAdmin()" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? 'Cancelar' : 'Nueva película' }}
      </button>
    </div>

    <div v-if="mostrarFormulario" class="formulario">
      <h3>Agregar película</h3>
      <div v-if="error" class="error">{{ error }}</div>
      <input v-model="form.titulo" type="text" placeholder="Título" />
      <input v-model="form.genero" type="text" placeholder="Género" />
      <input v-model="form.duracion" type="number" placeholder="Duración (min)" />
      <input v-model="form.sinopsis" type="text" placeholder="Sinopsis (opcional)" />
      <button @click="crearPelicula" :disabled="cargando">
        {{ cargando ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>

    <div v-if="cargandoLista">Cargando películas...</div>

    <div v-else-if="peliculas.length === 0">No hay películas registradas.</div>

    <div v-else class="lista">
      <div v-for="pelicula in peliculas" :key="pelicula.id" class="card">
        <div class="info">
          <h3>{{ pelicula.titulo }}</h3>
          <p>{{ pelicula.genero }} · {{ pelicula.duracion }} min</p>
          <p v-if="pelicula.sinopsis">{{ pelicula.sinopsis }}</p>
        </div>
        <button v-if="isAdmin()" class="btn-eliminar" @click="eliminarPelicula(pelicula.id)">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import '../styles/Peliculas.css'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const peliculas = ref([])
const cargandoLista = ref(true)
const cargando = ref(false)
const error = ref('')
const mostrarFormulario = ref(false)
const form = ref({ titulo: '', genero: '', duracion: '', sinopsis: '' })

const token = localStorage.getItem('token')
const authHeader = { headers: { Authorization: `Bearer ${token}` } }
const user = JSON.parse(localStorage.getItem('user') || '{}')

const isAdmin = () => {
  return user.role === 'admin'
}

const cargarPeliculas = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/peliculas')
    peliculas.value = res.data
  } catch {
    error.value = 'Error al cargar películas'
  } finally {
    cargandoLista.value = false
  }
}

const crearPelicula = async () => {
  if (!isAdmin()) {
    error.value = ' No tienes permisos para crear películas'
    return
  }
  error.value = ''
  cargando.value = true
  try {
    await axios.post('http://localhost:3000/api/peliculas', form.value, authHeader)
    form.value = { titulo: '', genero: '', duracion: '', sinopsis: '' }
    mostrarFormulario.value = false
    await cargarPeliculas()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear película'
  } finally {
    cargando.value = false
  }
}

const eliminarPelicula = async (id) => {
  if (!isAdmin()) {
    error.value = ' No tienes permisos para eliminar películas'
    return
  }
  if (!confirm('¿Eliminar esta película?')) return
  try {
    await axios.delete(`http://localhost:3000/api/peliculas/${id}`, authHeader)
    await cargarPeliculas()
  } catch {
    error.value = 'Error al eliminar película'
  }
}

onMounted(cargarPeliculas)
</script>
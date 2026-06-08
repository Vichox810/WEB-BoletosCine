<template>
  <div class="container">
    <div class="header">
      <h2>Cartelera</h2>
      <button v-if="isAdmin()" @click="mostrarFormulario = !mostrarFormulario">
        {{ mostrarFormulario ? 'Cancelar' : 'Nueva función' }}
      </button>
    </div>

    <div v-if="mostrarFormulario" class="formulario">
      <h3>{{ editando ? 'Editar función' : 'Agregar función' }}</h3>
      <div v-if="error" class="error">{{ error }}</div>
      <select v-model="form.PeliculaId">
        <option value="" disabled>Selecciona una película</option>
        <option v-for="p in peliculas" :key="p.id" :value="p.id">{{ p.titulo }}</option>
      </select>
      <input v-model="form.fecha" type="date" />
      <input v-model="form.hora" type="time" />
      <input v-model="form.sala" type="text" placeholder="Sala" />
      <input v-model="form.precio" type="number" placeholder="Precio" />
      <button @click="editando ? actualizarFuncion() : crearFuncion()" :disabled="cargando">
        {{ cargando ? 'Guardando...' : 'Guardar' }}
      </button>
    </div>

    <div v-if="cargandoLista">Cargando cartelera...</div>
    <div v-else-if="funciones.length === 0">No hay funciones registradas.</div>

    <div v-else class="lista">
      <div v-for="funcion in funciones" :key="funcion.id" class="card">
        <div class="info">
          <h3>{{ funcion.Pelicula?.titulo }}</h3>
          <p>{{ new Date(funcion.fecha).toLocaleDateString('es-CL') }} · {{ funcion.hora }}</p>
          <p>Sala: {{ funcion.sala }} · ${{ funcion.precio }}</p>
        </div>
        <div class="acciones" v-if="isAdmin()">
          <button class="btn-editar" @click="abrirEditar(funcion)">Editar</button>
          <button class="btn-eliminar" @click="eliminarFuncion(funcion.id)">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '../styles/Funciones.css'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const funciones = ref([])
const peliculas = ref([])
const cargandoLista = ref(true)
const cargando = ref(false)
const error = ref('')
const mostrarFormulario = ref(false)
const editando = ref(false)
const editandoId = ref(null)
const form = ref({ PeliculaId: '', fecha: '', hora: '', sala: '', precio: '' })

const token = localStorage.getItem('token')
const authHeader = { headers: { Authorization: `Bearer ${token}` } }
const user = JSON.parse(localStorage.getItem('user') || '{}')

const isAdmin = () => user.role === 'admin'

const cargarFunciones = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/funciones')
    funciones.value = res.data
  } catch {
    error.value = 'Error al cargar funciones'
  } finally {
    cargandoLista.value = false
  }
}

const cargarPeliculas = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/peliculas')
    peliculas.value = res.data
  } catch {
    error.value = 'Error al cargar películas'
  }
}

const abrirEditar = (funcion) => {
  editando.value = true
  editandoId.value = funcion.id
  form.value = {
    PeliculaId: funcion.PeliculaId,
    fecha: funcion.fecha?.split('T')[0],
    hora: funcion.hora,
    sala: funcion.sala,
    precio: funcion.precio
  }
  mostrarFormulario.value = true
}

const crearFuncion = async () => {
  error.value = ''
  cargando.value = true
  try {
    await axios.post('http://localhost:3000/api/funciones', form.value, authHeader)
    form.value = { PeliculaId: '', fecha: '', hora: '', sala: '', precio: '' }
    mostrarFormulario.value = false
    await cargarFunciones()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear función'
  } finally {
    cargando.value = false
  }
}

const actualizarFuncion = async () => {
  error.value = ''
  cargando.value = true
  try {
    await axios.put(`http://localhost:3000/api/funciones/${editandoId.value}`, form.value, authHeader)
    form.value = { PeliculaId: '', fecha: '', hora: '', sala: '', precio: '' }
    mostrarFormulario.value = false
    editando.value = false
    editandoId.value = null
    await cargarFunciones()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al actualizar función'
  } finally {
    cargando.value = false
  }
}

const eliminarFuncion = async (id) => {
  if (!confirm('¿Eliminar esta función?')) return
  try {
    await axios.delete(`http://localhost:3000/api/funciones/${id}`, authHeader)
    await cargarFunciones()
  } catch {
    error.value = 'Error al eliminar función'
  }
}

onMounted(() => {
  cargarFunciones()
  cargarPeliculas()
})
</script>
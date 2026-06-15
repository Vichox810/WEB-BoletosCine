<template>
    <div class="container">
      <div class="header">
        <h2>Cartelera</h2>
        <button v-if="isAdmin()" @click="mostrarFormulario = !mostrarFormulario">
          {{ mostrarFormulario ? 'Cancelar' : 'Nueva función' }}
        </button>
      </div>

      <!-- SECCIÓN DE FILTROS Y BÚSQUEDA (rq-07) -->
      <div class="buscador-container">
        <div class="buscador-inputs">
          <div class="input-grupo">
            <label>Filtrar por Película:</label>
            <select v-model="filtroPelicula" @change="cargarFunciones">
              <option value="">Todas las películas</option>
              <option v-for="p in peliculas" :key="p.id" :value="p.id">
                {{ p.titulo }}
              </option>
            </select>
          </div>

          <div class="input-grupo">
            <label>Filtrar por Fecha:</label>
            <input type="date" v-model="filtroFecha" @change="cargarFunciones" />
          </div>

          <button class="btn-limpiar" @click="limpiarFiltros" v-if="filtroPelicula || filtroFecha">
            Limpiar Filtros
          </button>
        </div>
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
        <input v-model="form.limiteAsientos" type="number" placeholder="Límite de asientos" v-if="editando" />
        <div class="input-grupo" v-if="editando">
          <label>Estado:</label>
          <select v-model="form.estado">
            <option value="activa">Activa</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <button @click="editando ? actualizarFuncion() : crearFuncion()" :disabled="cargando">
          {{ cargando ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>

      <div v-if="cargandoLista">Cargando cartelera...</div>
      <div v-else-if="funciones.length === 0">No se encontraron funciones con los criterios seleccionados.</div>

      <div v-else class="lista">
        <div v-for="funcion in funciones" :key="funcion.id" class="card">
          <div class="info">
            <h3>{{ funcion.Pelicula?.titulo }}</h3>
            <p>{{ new Date(funcion.fecha).toLocaleDateString('es-CL') }} · {{ funcion.hora }}</p>
            <p>Sala: {{ funcion.sala }} · ${{ funcion.precio }} · {{ funcion.limiteAsientos || 40 }} asientos</p>
            <p :class="funcion.estado === 'cancelada' ? 'badge-cancelada' : 'badge-activa'">{{ funcion.estado === 'cancelada' ? 'Cancelada' : 'Activa' }}</p>
          </div>
          <div class="acciones">
            <button class="btn-comprar" @click="router.push(`/comprar/${funcion.id}`)">Comprar</button>
            <template v-if="isAdmin()">
              <button class="btn-editar" @click="abrirEditar(funcion)">Editar</button>
              <button class="btn-eliminar" @click="eliminarFuncion(funcion.id)">Eliminar</button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import '../styles/Funciones.css'
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import api from '../api'

  const router = useRouter()
  const funciones = ref([])
  const peliculas = ref([])
  const cargandoLista = ref(true)
  const cargando = ref(false)
  const error = ref('')
  const mostrarFormulario = ref(false)
  const editando = ref(false)
  const editandoId = ref(null)
  const form = ref({ PeliculaId: '', fecha: '', hora: '', sala: '', precio: '', estado: 'activa', limiteAsientos: 40 })

  // Estados reactivos para los filtros de búsqueda (rq-07)
  const filtroPelicula = ref('')
  const filtroFecha = ref('')

  const token = localStorage.getItem('token')
  const authHeader = { headers: { Authorization: `Bearer ${token}` } }
  const user = JSON.parse(localStorage.getItem('user') || '{}')

   const isAdmin = () => {
     console.log('User object from localStorage:', user);
     console.log('Is Admin:', user.role === 'admin');
     return user.role === 'admin';
   }

   // Modificado para soportar el envío dinámico de filtros al backend
  const cargarFunciones = async () => {
    try {
      cargandoLista.value = true
      
      // Construimos los parámetros de consulta de forma dinámica
      let url = '/api/funciones'
      const params = new URLSearchParams()
      
      if (filtroPelicula.value) params.append('PeliculaId', filtroPelicula.value)
      if (filtroFecha.value) params.append('fecha', filtroFecha.value)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const res = await api.get(url)
      funciones.value = res.data
    } catch {
      error.value = 'Error al cargar funciones'
    } finally {
      cargandoLista.value = false
    }
  }

  const cargarPeliculas = async () => {
    try {
      const res = await api.get('/api/peliculas')
      peliculas.value = res.data
    } catch {
      error.value = 'Error al cargar películas'
    }
  }

  // Función para resetear los inputs del buscador
  const limpiarFiltros = () => {
    filtroPelicula.value = ''
    filtroFecha.value = ''
    cargarFunciones()
  }

  const abrirEditar = (funcion) => {
    editando.value = true
    editandoId.value = funcion.id
    form.value = {
      PeliculaId: funcion.PeliculaId,
      fecha: funcion.fecha?.split('T')[0],
      hora: funcion.hora,
      sala: funcion.sala,
      precio: funcion.precio,
      estado: funcion.estado || 'activa',
      limiteAsientos: funcion.limiteAsientos || 40
    }
    mostrarFormulario.value = true
  }

  const crearFuncion = async () => {
    error.value = ''

    if (!form.value.PeliculaId || !form.value.fecha || !form.value.hora || !form.value.sala.trim() || !form.value.precio) {
      error.value = 'Todos los campos son requeridos'
      return
    }

    cargando.value = true
    try {
      console.log("Attempting to create function with form:", form.value);
      console.log("Auth Header:", authHeader);
      await api.post('/api/funciones', form.value, authHeader);
      form.value = { PeliculaId: '', fecha: '', hora: '', sala: '', precio: '' };
      mostrarFormulario.value = false;
      await cargarFunciones();
    } catch (err) {
      console.error("Error creating function:", err.response?.data || err);
      error.value = err.response?.data?.error || 'Error al crear función';
    } finally {
      cargando.value = false
    }
  }

  const actualizarFuncion = async () => {
    error.value = ''

    if (!form.value.PeliculaId || !form.value.fecha || !form.value.hora || !form.value.sala.trim() || !form.value.precio) {
      error.value = 'Todos los campos son requeridos'
      return
    }

    cargando.value = true
    try {
      await api.put(`/api/funciones/${editandoId.value}`, form.value, authHeader)
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
    if (!confirm('¿Eliminar esta función?')) return;
    try {
      console.log("Attempting to delete function with ID:", id);
      console.log("Auth Header:", authHeader);
      await api.delete(`/api/funciones/${id}`, authHeader);
      await cargarFunciones();
    } catch (err) {
      console.error("Error deleting function:", err.response?.data || err);
      error.value = err.response?.data?.error || 'Error al eliminar función';
    }
  }

  onMounted(() => {
    cargarFunciones();
    cargarPeliculas();
  });  </script>
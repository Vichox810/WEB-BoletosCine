<template>
  <div class="container">
    <!-- Encabezado Principal -->
    <div class="header">
      <h2>¡Bienvenido a FrutiCine!</h2>
      <button @click="irACartelera">Ver Cartelera Completa</button>
    </div>

    <!-- Sección Informativa con estilo Limpio -->
    <div class="bienvenida-banner">
      <h3>La mejor experiencia cinematográfica</h3>
      <p>Selecciona tus películas favoritas, consulta los horarios disponibles en tiempo real y reserva tus asientos de forma digital desde la comodidad de tu hogar.</p>
    </div>

    <h3 class="seccion-titulo">Películas Destacadas</h3>
    
    <!-- Rejilla con tus imágenes y películas reales -->
    <div class="lista">
      <div v-for="pelicula in peliculasDestacadas" :key="pelicula.id" class="card">
        <div class="poster-container">
          <img 
            :src="obtenerRutaImagen(pelicula)" 
            :alt="pelicula.titulo"
            @error="imagenError"
          >
          <span class="badge-duracion">{{ pelicula.duracion }} min</span>
        </div>
        <div class="info">
          <span class="genero">{{ pelicula.genero }}</span>
          <h3>{{ pelicula.titulo }}</h3>
          <p class="sinopsis">{{ pelicula.sinopsis }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const peliculasDestacadas = ref([])

const irACartelera = () => {
  router.push('/funciones')
}

// Función con asignación manual para tus dos películas específicas
const obtenerRutaImagen = (pelicula) => {
  
  // 1. Condición para Backrooms 2
  if (pelicula.titulo === 'Backrooms 2') {
    return '/movies/pelicula1.jpg'
  }

  // 2. Condición para El viaje de Chihiro
  if (pelicula.titulo === 'El viaje de Chihiro') {
    return '/movies/pelicula3.jpg'
  }

  if (pelicula.titulo === 'Depredador') {
    return '/movies/pelicula3.jpg'
  }

  // Respaldo dinámico por si agregas una tercera película en el futuro
  const ruta = pelicula.imagen
  if (!ruta) return '/movies/pelicula1.jpg'
  
  if (!ruta.startsWith('movies/') && !ruta.startsWith('/movies/')) {
    return `/movies/${ruta}`
  }
  
  return ruta.startsWith('/') ? ruta : `/${ruta}`
}

// Respaldo en caso de error crítico
const imagenError = (event) => {
  event.target.src = '/movies/pelicula1.jpg'
}

// Cargar las películas desde tu API de Node
const cargarPeliculas = async () => {
  try {
    const res = await api.get('/api/peliculas')
    peliculasDestacadas.value = res.data.slice(0, 3)
  } catch (error) {
    console.error("Error al cargar las películas en el inicio:", error)
  }
}

onMounted(() => {
  cargarPeliculas()
})
</script>

<style scoped>
@import '../styles/Inicio.css';
</style>
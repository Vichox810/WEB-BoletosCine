<template>
  <div class="home">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-container">
        <div class="logo">
          <span class="logo-icon">🎬</span>
          <span class="logo-text">CineMax</span>
        </div>
        <div class="nav-links">
          <router-link to="/peliculas" class="nav-link">Películas</router-link>
          <router-link to="/funciones" class="nav-link">Funciones</router-link>
          <span v-if="user.role === 'admin'" class="role-badge admin-badge">👨‍💼 Administrador</span>
          <span v-else class="role-badge user-badge">👤 Usuario</span>
          <button @click="logout" class="nav-button logout">Cerrar Sesión</button>
        </div>
      </div>
    </nav>

    <!-- User Welcome Section -->
    <section class="welcome">
      <div class="welcome-content">
        <h1>¡Bienvenido, {{ user.name }}! 🎉</h1>
        <p class="welcome-subtitle">Vuelve a disfrutar de las mejores películas</p>
        <div class="user-info">
          <div class="info-card">
            <span class="info-label">Email</span>
            <span class="info-value">{{ user.email }}</span>
          </div>
          <div class="info-card">
            <span class="info-label">Rol</span>
            <span class="info-value">{{ user.role }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="quick-actions">
      <h2>{{ user.role === 'admin' ? 'Panel de Gestión' : 'Acciones Rápidas' }}</h2>
      <div class="actions-grid">
        <!-- All Users: Ver Películas -->
        <div class="action-card" @click="router.push('/peliculas')">
          <div class="action-icon">🎬</div>
          <h3>Ver Películas</h3>
          <p>Explora nuestro catálogo completo</p>
        </div>

        <!-- All Users: Ver Funciones -->
        <div class="action-card" @click="router.push('/funciones')">
          <div class="action-icon">📅</div>
          <h3>Ver Funciones</h3>
          <p>Consulta horarios disponibles</p>
        </div>

        <!-- User Only: Mis Entradas -->
        <div v-if="user.role !== 'admin'" class="action-card" @click="goToComprar">
          <div class="action-icon">🎟️</div>
          <h3>Mis Entradas</h3>
          <p>Revisa tus compras</p>
        </div>
      </div>
    </section>

    <!-- Featured Movies Section -->
    <section class="featured">
      <h2>Películas en Cartelera</h2>
      <p class="featured-subtitle">No te pierdas los estrenos de esta semana</p>
      <div class="featured-grid">
        <div class="featured-card">
          <img src="/movies/pelicula1.jpg" alt="Película Destacada 1" class="featured-image">
          <div class="featured-info">
            <h3>Backrooms</h3>
            <p>Género: terror psicológico y terror cósmico</p>
            <div class="rating">⭐ 4.9/5</div>
          </div>
        </div>
        <div class="featured-card">
          <img src="/movies/pelicula2.jpg" alt="Película Destacada 2" class="featured-image">
          <div class="featured-info">
            <h3>Mario Galaxy</h3>
            <p>Género: acción, aventura y comedia</p>
            <div class="rating">⭐ 4.9/5</div>
          </div>
        </div>
        <div class="featured-card">
          <img src="/movies/pelicula3.jpg" alt="Película Destacada 3" class="featured-image">
          <div class="featured-info">
            <h3>El viaje de Chihiro</h3>
            <p>Género: Fantasia, Aventura, Drama</p>
            <div class="rating">⭐ 4.7/5</div>
          </div>
        </div>
      </div>
      <router-link to="/peliculas" class="btn btn-outline">Ver Todas las Películas</router-link>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="stat-card">
        <div class="stat-number">50+</div>
        <div class="stat-label">Películas</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">100+</div>
        <div class="stat-label">Funciones Diarias</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">4.9★</div>
        <div class="stat-label">Calificación</div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>Sobre CineMax</h4>
          <p>Tu plataforma de confianza para disfrutar del mejor cine</p>
        </div>
        <div class="footer-section">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li><router-link to="/peliculas">Películas</router-link></li>
            <li><router-link to="/funciones">Funciones</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contacto</h4>
          <p>Email: info@cinemax.com</p>
          <p>Teléfono: (555) 123-4567</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 CineMax. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import '../styles/Inicio.css'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = JSON.parse(localStorage.getItem('user') || '{}')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const goToComprar = () => {
  router.push('/funciones')
}
</script>
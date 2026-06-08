import { createRouter, createWebHistory } from 'vue-router'
import Registro from '../vistas/Registro.vue'
import Login from '../vistas/Login.vue'
import Inicio from '../vistas/Inicio.vue'
import Peliculas from '../vistas/Peliculas.vue'
import Funciones from '../vistas/Funciones.vue'
import Usuarios from '../vistas/Usuarios.vue'
import Dashboard from '../vistas/Dashboard.vue'

const routes = [
  { path: '/registro', component: Registro },
  { path: '/login', component: Login },
  { path: '/inicio', component: Inicio },
  { path: '/peliculas', component: Peliculas },
  { path: '/funciones', component: Funciones }, 
  { path: '/usuarios', component: Usuarios },
  { path: '/dashboard', component: Dashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const rutasPublicas = ['/login', '/registro']
  const token = localStorage.getItem('token')

  if (!rutasPublicas.includes(to.path) && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
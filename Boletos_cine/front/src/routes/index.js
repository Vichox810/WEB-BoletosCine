import { createRouter, createWebHistory } from 'vue-router'
import Registro from '../vistas/Registro.vue'
import Login from '../vistas/Login.vue'
import Inicio from '../vistas/Inicio.vue'
import Peliculas from '../vistas/Peliculas.vue'
import Funciones from '../vistas/Funciones.vue'

const routes = [
  { path: '/registro', component: Registro },
  { path: '/login', component: Login },
  { path: '/inicio', component: Inicio },
  { path: '/peliculas', component: Peliculas },
  { path: '/funciones', component: Funciones } 
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
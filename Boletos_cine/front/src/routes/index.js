import { createRouter, createWebHistory } from 'vue-router';

// 1. Importación de las vistas del proyecto
import Inicio from '../vistas/Inicio.vue'; // <-- AGREGADO: Importación de tu vista de inicio
import Login from '../vistas/Login.vue';
import Registro from '../vistas/Registro.vue';
import Funciones from '../vistas/Funciones.vue';
import Peliculas from '../vistas/Peliculas.vue';
import Usuarios from '../vistas/Usuarios.vue';
import Dashboard from '../vistas/Dashboard.vue';
import ComprarBoleto from '../vistas/ComprarBoleto.vue';
import SolicitarReset from '../vistas/SolicitarReset.vue';
import ResetearPassword from '../vistas/ResetearPassword.vue';
import Boleta from '../vistas/Boleta.vue';

// 2. Definición de rutas fijas
const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: Inicio // <-- CAMBIADO: Ahora carga limpiamente tu Inicio.vue
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/registro',
    name: 'Registro',
    component: Registro
  },
  {
    path: '/funciones',
    name: 'Funciones',
    component: Funciones // <-- Tu cartelera ahora funciona de forma independiente
  },
  {
    path: '/peliculas',
    name: 'Peliculas',
    component: Peliculas
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: Usuarios
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/comprar/:id',
    name: 'ComprarBoleto',
    component: ComprarBoleto
  },
  {
    path: '/solicitar-reset',
    name: 'SolicitarReset',
    component: SolicitarReset
  },
  {
    path: '/resetear',
    name: 'ResetearPassword',
    component: ResetearPassword
  },
  // Ruta comodín por si escriben cualquier otra cosa en la URL, redirigir al inicio
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  },

  {
    path: '/boleta/:id', // <--- AGREGAR ESTO
    name: 'Boleta',
    component: Boleta
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 3. Navigation Guard Modernizado (Sin el callback deprecado 'next')
router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  
  // Lista de rutas a las que cualquiera puede entrar sin loguearse
  const rutasPublicas = ['/', '/login', '/registro', '/solicitar-reset', '/resetear', '/funciones', '/peliculas'];
  const esRutaPublica = rutasPublicas.includes(to.path) || to.path.startsWith('/comprar/') || to.path.startsWith('/boleta/');

  // Si no está autenticado y quiere ir a una ruta privada, lo mandamos al Login de cabeza
  if (!token && !esRutaPublica) {
    return '/login';
  }

  // Si ya está autenticado e intenta volver a las pantallas de login/registro, lo mandamos al inicio
  if (token && ['/login', '/registro'].includes(to.path)) {
    return '/';
  }
  
  // Si todo está en orden, permitimos la navegación de forma implícita (sin llamar a next)
});

export default router;
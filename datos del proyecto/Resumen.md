# WEB-BoletosCine

Sistema web de compra de boletos de cine (FrutiCine).

## Stack

- **Backend**: Node.js + Express 5 + Sequelize 6 + PostgreSQL
- **Frontend**: Vue 3 + Vite + vue-router + axios

## URLs de producción

- **API**: https://backend-api-production-1d2f.up.railway.app
- **Frontend**: https://frontend-production-ed4d.up.railway.app

## Requisitos implementados

| Código | Descripción | Estado |
|---|---|---|
| GEN-04 | Registro de usuario con bcrypt | Listo |
| GEN-05 | Login con JWT | Listo |
| GEN-06 | Middleware de autenticación | Listo |
| GEN-07 | Restablecer contraseña (token expirable 1h) | Listo |
| GEN-08 | Manejo centralizado de errores (400/401/409/422) | Listo |
| GEN-09 | CRUD Películas y Funciones | Listo |
| GEN-10 | Validaciones de entrada (validateFields + validateTypes) | Listo |
| GEN-11 | Colección Postman completa | Listo |
| GEN-12 | Migración add-limiteAsientos-to-funcion | Listo |
| GEN-13 | Despliegue Railway (API + BD + Front) | Listo |
| rq-03 | CRUD Películas | Listo |
| rq-04 | CRUD Funciones | Listo |
| rq-05 | No vender mismo asiento dos veces (HTTP 409) | Listo |
| rq-06 | No reservar en función cancelada o ya iniciada (HTTP 409) | Listo |
| rq-07 | Filtros por película y fecha en funciones | Listo |
| rq-08 | Cartelera de funciones | Listo |
| rq-09 | Selección de asientos + confirmación de compra | Listo |
| rq-10 | Aplicar promoción / código descuento | Listo |

## Desarrollo local

### Backend

```bash
cd back
cp .env.example .env  # editar credenciales
npm install
npm run dev
```

Las tablas se crean automáticamente con `sequelize.sync({ alter: true })` al iniciar. Se siembran usuarios demo y promociones desde `app.js`.

### Frontend

```bash
cd front
cp .env.example .env  # VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

## Despliegue (Railway)

### Backend (Railway)

1. Crear cuenta en [Railway](https://railway.app/)
2. Crear nuevo proyecto → "Deploy from GitHub repo" → seleccionar `WEB-BoletosCine`
3. Configurar el servicio backend:
   - Root directory: `Boletos_cine/back`
   - Start command: `node app.js`
4. Agregar PostgreSQL desde el dashboard de Railway (genera `DATABASE_URL` automáticamente)
5. Agregar variables de entorno:
   - `JWT_SECRET` = una clave secreta larga
   - `NODE_ENV` = production
6. Railway asigna puerto 8080 automáticamente

### Frontend (Railway)

1. En el mismo proyecto Railway, crear nuevo servicio → "Deploy from GitHub repo"
2. Configurar:
   - Root directory: `Boletos_cine/front`
   - Usa `Dockerfile` (build en 2 etapas con Node 20, sirve SPA en puerto 8080 via `server.js`)
   - Environment Variables:
     - `VITE_API_URL` = URL del backend en Railway
3. El front sirve la SPA con `server.js` (Express estático, fallback a `index.html` para vue-router)

### Postman

La colección está en `postman/BoletosCine-API.postman_collection.json` (formato v2.1).
Importar en Postman y configurar variables:
- `baseUrl` = URL del backend (`http://localhost:3000` local, o la URL de Railway)
- `token` = se auto-asigna al ejecutar "Login exitoso" (script de test)

Incluye requests para: auth (registro/login/reset con errores 400/401/409), CRUD películas y funciones (con 400/422), compras (con 409 asiento ocupado y 401 sin token), promociones, health check y ruta 404.

## Usuarios de prueba (creados automáticamente al iniciar la app)

| Rol | Email | Password |
|---|---|---|
| Admin | `admin@test.com` | `12345678` |
| User | `user@test.com` | `12345678` |

## Códigos promocionales de prueba (creados automáticamente)

| Código | Descuento | Descripción |
|---|---|---|
| FRUTILLAR | 10% | Promoción Frutillar |
| BIENVENIDO | 20% | Promoción Bienvenido |
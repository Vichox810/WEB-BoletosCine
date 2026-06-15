# Boletos Cine

Sistema de venta de boletos de cine con autenticación, roles, y sistema de promociones.

## Stack

- **Backend:** Node.js + Express + Sequelize + PostgreSQL
- **Frontend:** Vue 3 + Vite + Axios
- **Auth:** JWT + bcryptjs

## Requisitos

- Node.js 18+
- PostgreSQL

## Configuración local

### Backend

```powershell
cd back
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
npm install
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```

### Frontend

```powershell
cd front
cp .env.example .env
npm install
npm run dev
```

El frontend corre en `http://localhost:5173` y el backend en `http://localhost:3000`.

## Despliegue

### Railway (Backend + DB)

1. Ir a [Railway](https://railway.app) y crear un nuevo proyecto
2. Agregar una base de datos **PostgreSQL**
3. Conectar el repositorio y configurar:
   - **Root Directory:** `back`
   - **Start Command:** `node app.js`
4. Agregar variables de entorno:
   - `JWT_SECRET` — una clave secreta
   - `NODE_ENV=production`
5. Railway asigna automáticamente `DATABASE_URL` al PostgreSQL

### Vercel (Frontend)

1. Ir a [Vercel](https://vercel.com) y conectar el repositorio
2. Configurar:
   - **Root Directory:** `front`
   - **Framework:** Vite
3. Agregar variable de entorno:
   - `VITE_API_URL` — la URL del backend en Railway (ej: `https://boletos-cine-api.up.railway.app`)
4. Desplegar

## Endpoints principales

| Método | Ruta | Auth |
|--------|------|------|
| POST | `/api/users/register` | No |
| POST | `/api/users/login` | No |
| GET | `/api/peliculas` | No |
| POST | `/api/peliculas` | Sí |
| GET | `/api/funciones` | No |
| POST | `/api/funciones` | Sí |
| POST | `/api/boletos` | Sí |
| POST | `/api/promociones/validar` | No |
| GET | `/api/promociones` | Sí |

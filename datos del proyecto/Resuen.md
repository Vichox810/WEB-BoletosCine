# WEB-BoletosCine 🎬

Sistema web de compra de boletos de cine (FrutiCine).

## Stack

- **Backend**: Node.js + Express 5 + Sequelize 6 + PostgreSQL
- **Frontend**: Vue 3 + Vite + vue-router + axios

## Requisitos implementados

| Código | Descripción | Estado |
|---|---|---|
| GEN-04 | Registro de usuario | Listo |
| GEN-05 | Login con JWT | Listo |
| GEN-06 | Middleware de autenticación | Listo |
| GEN-07 | Restablecer contraseña | Listo |
| GEN-08 | Manejo centralizado de errores | Listo |
| GEN-09 | CRUD del dominio (Películas/Funciones) | Listo |
| GEN-10 | Validaciones de entrada | Listo |
| GEN-11 | Colección Postman | Listo |
| GEN-12 | Evolución de esquema (add codigoPromo) | Listo |
| GEN-13 | Despliegue | Listo |
| rq-03 | CRUD Películas | Listo |
| rq-04 | CRUD Funciones | Listo |
| rq-05 | No vender mismo asiento | Listo |
| rq-06 | No reservar en función cancelada/iniciada | Listo |
| rq-07 | Filtros por película y fecha | Listo |
| rq-08 | Cartelera de funciones | Listo |
| rq-09 | Selección de asientos + compra | Listo |
| rq-10 | Promociones / código descuento | Listo |

## Desarrollo local

### Backend

```bash
cd Boletos_cine/back
cp .env.example .env  # editar credenciales
npm install
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```

### Frontend

```bash
cd Boletos_cine/front
cp .env.example .env  # VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

## Despliegue (Railway + Vercel)

### Backend (Railway)

1. Crear cuenta en [Railway](https://railway.app/)
2. Crear nuevo proyecto → "Deploy from GitHub repo" → seleccionar `WEB-BoletosCine`
3. Configurar el proyecto:
   - Root directory: `Boletos_cine/back`
   - Start command: `node app.js`
4. Agregar PostgreSQL desde el dashboard de Railway (genera DATABASE_URL automáticamente)
5. Agregar variables de entorno:
   - `JWT_SECRET` = una clave secreta larga
   - `NODE_ENV` = production
6. Ejecutar migraciones en Railway:
   ```bash
   # Desde Railway dashboard → Connect → Railway CLI o:
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```
7. Obtener la URL del backend (ej: `https://boletoscine-api.up.railway.app`)

### Frontend (Vercel)

1. Ir a [Vercel](https://vercel.com/) → "Add New Project" → importar `WEB-BoletosCine`
2. Configurar:
   - Root directory: `Boletos_cine/front`
   - Framework: Vite
   - Environment Variables:
     - `VITE_API_URL` = URL del backend en Railway
3. Deployar

### Postman

La colección de Postman está en `Boletos_cine/postman/BoletosCine-API.postman_collection.json`.
Importar en Postman y configurar variable `baseUrl` con la URL del backend (local o Railway).

## Usuarios de prueba

- Admin: `admin@cinemax.com` (contraseña: la registrada en seeders)
- Normal: `juan@mail.com` (contraseña: la registrada en seeders)
- Códigos promocionales: `CINE10` (10% off), `BIENVENIDO` (20% off)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const peliculaRoutes = require('./routes/pelicula');
const funcionRoutes = require('./routes/funcion');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/peliculas', peliculaRoutes);
app.use('/api/funciones', funcionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a BD establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar con la BD:', error);
  }
};

start();

module.exports = app;
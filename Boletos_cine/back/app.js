require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const peliculaRoutes = require('./routes/pelicula');
const funcionRoutes = require('./routes/funcion');
const userRoutes = require('./routes/user'); 
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const boletoRoutes = require('./routes/boleto'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/peliculas', peliculaRoutes);
app.use('/api/funciones', funcionRoutes);
app.use('/api/users', userRoutes);  
app.use('/api/boleto', boletoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

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
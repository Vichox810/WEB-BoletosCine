require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, User, Promocion } = require('./models');
const peliculaRoutes = require('./routes/pelicula');
const funcionRoutes = require('./routes/funcion');
const userRoutes = require('./routes/user'); 
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const boletoRoutes = require('./routes/boleto'); 
const promocionRoutes = require('./routes/promocion');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/peliculas', peliculaRoutes);
app.use('/api/funciones', funcionRoutes);
app.use('/api/users', userRoutes);  
app.use('/api/boletos', boletoRoutes);
app.use('/api/promociones', promocionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a BD establecida correctamente.');

    if (process.env.NODE_ENV === 'production') {
      await sequelize.sync({ alter: true });
      console.log('Tablas sincronizadas correctamente.');

      const count = await User.count();
      if (count === 0) {
        await User.bulkCreate([
          { name: 'Admin', email: 'admin@test.com', password: '12345678', role: 'admin' },
          { name: 'Usuario', email: 'user@test.com', password: '12345678', role: 'user' },
        ], { individualHooks: true });
        console.log('Usuarios de demo creados.');
      }

      const promoCount = await Promocion.count();
      if (promoCount === 0) {
        await Promocion.bulkCreate([
          { codigo: 'FRUTILLAR', descuento: 10, descripcion: '10% de descuento en tu compra', activa: true, usosMaximos: 100, usosActuales: 0 },
          { codigo: 'BIENVENIDO', descuento: 20, descripcion: '20% de descuento para nuevos usuarios', activa: true, usosMaximos: 50, usosActuales: 0 },
        ]);
        console.log('Promociones de demo creadas.');
      }
    }

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al conectar con la BD:', error);
  }
};

start();

module.exports = app;
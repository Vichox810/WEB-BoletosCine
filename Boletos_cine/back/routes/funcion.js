const express = require('express');
const router = express.Router();
const { Funcion, Pelicula } = require('../models');
const authenticate = require('../middlewares/authenticate');
const { validateFields } = require('../middlewares/validate');

// GET todas las funciones - PÚBLICA (Soporta query params de filtrado)
router.get('/', async (req, res, next) => {
  try {
    const { PeliculaId, fecha } = req.query;
    const donde = {};

    if (PeliculaId) donde.PeliculaId = PeliculaId;
    if (fecha) donde.fecha = fecha;

    const funciones = await Funcion.findAll({
      where: donde,
      include: [{ model: Pelicula }],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });
    
    res.json(funciones);
  } catch (error) {
    next(error);
  }
});

// GET función por ID - PÚBLICA
router.get('/:id', async (req, res, next) => {
  try {
    const funcion = await Funcion.findByPk(req.params.id, {
      include: [{ model: Pelicula }]
    });
    if (!funcion) {
      return res.status(404).json({ error: true, message: 'Función no encontrada' });
    }
    res.json(funcion);
  } catch (error) {
    next(error);
  }
});

// GET funciones por película - PÚBLICA
router.get('/pelicula/:peliculaId', async (req, res, next) => {
  try {
    const funciones = await Funcion.findAll({
      where: { PeliculaId: req.params.peliculaId },
      include: [{ model: Pelicula }]
    });
    res.json(funciones);
  } catch (error) {
    next(error);
  }
});

// POST crear función - PROTEGIDA
router.post('/', authenticate, validateFields(['fecha', 'hora', 'sala', 'precio', 'PeliculaId']), async (req, res, next) => {
  try {
    const { fecha, hora, sala, precio, PeliculaId, estado } = req.body;
    const pelicula = await Pelicula.findByPk(PeliculaId);
    if (!pelicula) {
      return res.status(404).json({ error: true, message: 'Película no encontrada' });
    }
    const funcion = await Funcion.create({ fecha, hora, sala, precio, PeliculaId, estado });
    res.status(201).json(funcion);
  } catch (error) {
    next(error);
  }
});

// PUT actualizar función - PROTEGIDA
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const funcion = await Funcion.findByPk(req.params.id);
    if (!funcion) {
      return res.status(404).json({ error: true, message: 'Función no encontrada' });
    }
    const { fecha, hora, sala, precio, PeliculaId, estado } = req.body;
    if (PeliculaId) {
      const pelicula = await Pelicula.findByPk(PeliculaId);
      if (!pelicula) {
        return res.status(404).json({ error: true, message: 'Película no encontrada' });
      }
    }
    await funcion.update({
      fecha: fecha || funcion.fecha,
      hora: hora || funcion.hora,
      sala: sala || funcion.sala,
      precio: precio || funcion.precio,
      PeliculaId: PeliculaId || funcion.PeliculaId,
      estado: estado || funcion.estado
    });
    res.json(funcion);
  } catch (error) {
    next(error);
  }
});

// DELETE eliminar función - PROTEGIDA
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const funcion = await Funcion.findByPk(req.params.id);
    if (!funcion) {
      return res.status(404).json({ error: true, message: 'Función no encontrada' });
    }
    await funcion.destroy();
    res.json({ message: 'Función eliminada correctamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
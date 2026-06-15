const express = require('express');
const router = express.Router();
const { Pelicula, Funcion } = require('../models');
const authenticate = require('../middlewares/authenticate');
const { validateFields, validateTypes } = require('../middlewares/validate');

// GET todas las películas - PÚBLICA
router.get('/', async (req, res, next) => {
  try {
    const peliculas = await Pelicula.findAll({
      include: [{ model: Funcion }]
    });
    res.json(peliculas);
  } catch (error) {
    next(error);
  }
});

// GET película por ID - PÚBLICA
router.get('/:id', async (req, res, next) => {
  try {
    const pelicula = await Pelicula.findByPk(req.params.id, {
      include: [{ model: Funcion }]
    });
    if (!pelicula) {
      return res.status(404).json({ error: true, message: 'Película no encontrada' });
    }
    res.json(pelicula);
  } catch (error) {
    next(error);
  }
});

// POST crear película - PROTEGIDA
router.post('/', authenticate, validateFields(['titulo', 'genero', 'duracion']), validateTypes({ duracion: 'number' }), async (req, res, next) => {
  try {
    const { titulo, genero, duracion, sinopsis, imagen } = req.body;
    const pelicula = await Pelicula.create({ titulo, genero, duracion: Number(duracion), sinopsis, imagen });
    res.status(201).json(pelicula);
  } catch (error) {
    next(error);
  }
});

// PUT actualizar película - PROTEGIDA
router.put('/:id', authenticate, validateTypes({ duracion: 'number' }), async (req, res, next) => {
  try {
    const pelicula = await Pelicula.findByPk(req.params.id);
    if (!pelicula) {
      return res.status(404).json({ error: true, message: 'Película no encontrada' });
    }
    const { titulo, genero, duracion, sinopsis, imagen } = req.body;
    await pelicula.update({
      titulo: titulo || pelicula.titulo,
      genero: genero || pelicula.genero,
      duracion: duracion || pelicula.duracion,
      sinopsis: sinopsis || pelicula.sinopsis,
      imagen: imagen || pelicula.imagen
    });
    res.json(pelicula);
  } catch (error) {
    next(error);
  }
});

// DELETE eliminar película - PROTEGIDA
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const pelicula = await Pelicula.findByPk(req.params.id);
    if (!pelicula) {
      return res.status(404).json({ error: true, message: 'Película no encontrada' });
    }
    await pelicula.destroy();
    res.json({ message: 'Película eliminada correctamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
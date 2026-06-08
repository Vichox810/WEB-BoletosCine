const express = require('express');
const router = express.Router();
const { Pelicula, Funcion } = require('../models');
const authenticate = require('../middlewares/authenticate');

// GET todas las películas - PÚBLICA
router.get('/', async (req, res) => {
  try {
    const peliculas = await Pelicula.findAll({
      include: [{ model: Funcion }]
    });
    res.json(peliculas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET película por ID - PÚBLICA
router.get('/:id', async (req, res) => {
  try {
    const pelicula = await Pelicula.findByPk(req.params.id, {
      include: [{ model: Funcion }]
    });
    if (!pelicula) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    res.json(pelicula);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear película - PROTEGIDA
router.post('/', authenticate, async (req, res) => {
  try {
    const { titulo, genero, duracion, sinopsis, imagen } = req.body;
    if (!titulo || !genero || !duracion) {
      return res.status(400).json({ error: 'Faltan campos requeridos: titulo, genero, duracion' });
    }
    const pelicula = await Pelicula.create({ titulo, genero, duracion, sinopsis, imagen });
    res.status(201).json(pelicula);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT actualizar película - PROTEGIDA
router.put('/:id', authenticate, async (req, res) => {
  try {
    const pelicula = await Pelicula.findByPk(req.params.id);
    if (!pelicula) {
      return res.status(404).json({ error: 'Película no encontrada' });
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
    res.status(500).json({ error: error.message });
  }
});

// DELETE eliminar película - PROTEGIDA
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const pelicula = await Pelicula.findByPk(req.params.id);
    if (!pelicula) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }
    await pelicula.destroy();
    res.json({ message: 'Película eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
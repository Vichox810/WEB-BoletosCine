const express = require('express');
const router = express.Router();
const { Funcion, Pelicula } = require('../models');

// GET todas las funciones
router.get('/', async (req, res) => {
  try {
    const funciones = await Funcion.findAll({
      include: [{ model: Pelicula }]
    });
    res.json(funciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET función por ID
router.get('/:id', async (req, res) => {
  try {
    const funcion = await Funcion.findByPk(req.params.id, {
      include: [{ model: Pelicula }]
    });
    if (!funcion) {
      return res.status(404).json({ error: 'Función no encontrada' });
    }
    res.json(funcion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET funciones por película
router.get('/pelicula/:peliculaId', async (req, res) => {
  try {
    const funciones = await Funcion.findAll({
      where: { PeliculaId: req.params.peliculaId },
      include: [{ model: Pelicula }]
    });
    res.json(funciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear nueva función
router.post('/', async (req, res) => {
  try {
    const { fecha, hora, sala, precio, PeliculaId } = req.body;
    
    if (!fecha || !hora || !sala || !precio || !PeliculaId) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: fecha, hora, sala, precio, PeliculaId' 
      });
    }

    // Verificar que la película existe
    const pelicula = await Pelicula.findByPk(PeliculaId);
    if (!pelicula) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    const funcion = await Funcion.create({
      fecha,
      hora,
      sala,
      precio,
      PeliculaId
    });

    res.status(201).json(funcion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT actualizar función
router.put('/:id', async (req, res) => {
  try {
    const funcion = await Funcion.findByPk(req.params.id);
    
    if (!funcion) {
      return res.status(404).json({ error: 'Función no encontrada' });
    }

    const { fecha, hora, sala, precio, PeliculaId } = req.body;
    
    // Si se quiere cambiar la película, verificar que existe
    if (PeliculaId) {
      const pelicula = await Pelicula.findByPk(PeliculaId);
      if (!pelicula) {
        return res.status(404).json({ error: 'Película no encontrada' });
      }
    }
    
    await funcion.update({
      fecha: fecha || funcion.fecha,
      hora: hora || funcion.hora,
      sala: sala || funcion.sala,
      precio: precio || funcion.precio,
      PeliculaId: PeliculaId || funcion.PeliculaId
    });

    res.json(funcion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE eliminar función
router.delete('/:id', async (req, res) => {
  try {
    const funcion = await Funcion.findByPk(req.params.id);
    
    if (!funcion) {
      return res.status(404).json({ error: 'Función no encontrada' });
    }

    await funcion.destroy();
    res.json({ message: 'Función eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

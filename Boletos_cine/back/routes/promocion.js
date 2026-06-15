const express = require('express');
const router = express.Router();
const { Promocion } = require('../models');
const authenticate = require('../middlewares/authenticate');
const { validateFields } = require('../middlewares/validate');

// GET todas las promociones - solo admin
router.get('/', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }
    const promociones = await Promocion.findAll({ order: [['createdAt', 'DESC']] });
    res.json(promociones);
  } catch (error) {
    next(error);
  }
});

// POST crear promoción - solo admin
router.post('/', authenticate, validateFields(['codigo', 'descuento']), async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }
    const { codigo, descuento, descripcion, expiresAt, usosMaximos } = req.body;
    const promocion = await Promocion.create({
      codigo: codigo.toUpperCase(),
      descuento: Number(descuento),
      descripcion,
      expiresAt,
      usosMaximos: usosMaximos || 1
    });
    res.status(201).json(promocion);
  } catch (error) {
    next(error);
  }
});

// POST /api/promociones/validar - validar código promocional
router.post('/validar', authenticate, validateFields(['codigo']), async (req, res, next) => {
  try {
    const { codigo } = req.body;

    const promocion = await Promocion.findOne({ where: { codigo: codigo.toUpperCase() } });

    if (!promocion) {
      return res.status(404).json({ error: true, message: 'Código promocional no válido' });
    }

    if (!promocion.activa) {
      return res.status(400).json({ error: true, message: 'Esta promoción ya no está activa' });
    }

    if (promocion.expiresAt && new Date(promocion.expiresAt) < new Date()) {
      return res.status(400).json({ error: true, message: 'Esta promoción ha expirado' });
    }

    if (promocion.usosActuales >= promocion.usosMaximos) {
      return res.status(400).json({ error: true, message: 'Esta promoción ya no tiene usos disponibles' });
    }

    return res.json({
      valido: true,
      codigo: promocion.codigo,
      descuento: promocion.descuento,
      descripcion: promocion.descripcion
    });
  } catch (error) {
    next(error);
  }
});

// DELETE eliminar promoción - solo admin
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Acceso denegado' });
    }
    const promocion = await Promocion.findByPk(req.params.id);
    if (!promocion) {
      return res.status(404).json({ error: true, message: 'Promoción no encontrada' });
    }
    await promocion.destroy();
    res.json({ message: 'Promoción eliminada correctamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Boleto, Funcion, Pelicula, Promocion } = require('../models');
const authenticate = require('../middlewares/authenticate');
const { validateFields } = require('../middlewares/validate');

// POST /api/boletos - comprar boleto
router.post('/', authenticate, validateFields(['FuncionId', 'asiento']), async (req, res, next) => {
  try {
    const { FuncionId, asiento, totalPagado, codigoPromo } = req.body;

    const funcion = await Funcion.findByPk(FuncionId);
    if (!funcion) {
      return res.status(404).json({ error: true, message: 'Función no encontrada' });
    }

    if (funcion.estado === 'cancelada') {
      return res.status(409).json({ error: true, message: 'No puedes comprar en una función cancelada' });
    }

    const ahora = new Date();
    const fechaFuncion = new Date(funcion.fecha);
    if (fechaFuncion < new Date(ahora.toISOString().split('T')[0])) {
      return res.status(409).json({ error: true, message: 'No puedes comprar en una función ya pasada' });
    }
    if (fechaFuncion.toISOString().split('T')[0] === ahora.toISOString().split('T')[0]) {
      const horaFuncion = funcion.hora.split(':');
      const horaActual = ahora.getHours();
      const minActual = ahora.getMinutes();
      if (Number(horaFuncion[0]) < horaActual || (Number(horaFuncion[0]) === horaActual && Number(horaFuncion[1]) <= minActual)) {
        return res.status(409).json({ error: true, message: 'No puedes comprar en una función ya iniciada' });
      }
    }

    if (codigoPromo) {
      const promo = await Promocion.findOne({ where: { codigo: codigoPromo.toUpperCase() } });
      if (promo) {
        await promo.increment('usosActuales');
      }
    }

    const boleto = await Boleto.create({
      asiento: String(asiento),
      FuncionId: FuncionId,
      UserId: req.user.id,
      totalPagado: totalPagado || 0,
      codigoPromo: codigoPromo ? codigoPromo.toUpperCase() : null
    });

    return res.status(201).json(boleto);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: true, message: 'Este asiento ya está ocupado' });
    }
    next(error);
  }
});

// GET /api/boletos/:id - ver detalle
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const boleto = await Boleto.findByPk(req.params.id, {
      include: [{ 
        model: Funcion, 
        include: [{ model: Pelicula }] 
      }]
    });

    if (!boleto) {
      return res.status(404).json({ error: true, message: 'Boleto no encontrado' });
    }

    return res.json(boleto.toJSON());
  } catch (error) {
    next(error);
  }
});

router.get('/funcion/:funcionId', authenticate, async (req, res, next) => {
  try {
    const boletos = await Boleto.findAll({ 
      where: { FuncionId: req.params.funcionId } 
    });
    res.json(boletos);
  } catch (error) { next(error); }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { Boleto, Funcion, Pelicula } = require('../models');
const authenticate = require('../middlewares/authenticate');

// POST /api/boletos - comprar boleto (requiere token)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { FuncionId, asiento } = req.body;

    if (!FuncionId || !asiento) {
      return res.status(400).json({ error: true, message: 'FuncionId y asiento son requeridos' });
    }

    const funcion = await Funcion.findByPk(FuncionId);
    if (!funcion) {
      return res.status(404).json({ error: true, message: 'Función no encontrada' });
    }

    // rq-06: no reservar en función cancelada
    if (funcion.estado === 'cancelada') {
      return res.status(409).json({ error: true, message: 'Esta función fue cancelada' });
    }

    // rq-06: no reservar en función que ya inició
    const fechaHoraFuncion = new Date(funcion.fecha);
    const [horas, minutos] = funcion.hora.split(':');
    fechaHoraFuncion.setHours(Number(horas), Number(minutos), 0, 0);

    if (fechaHoraFuncion <= new Date()) {
      return res.status(409).json({ error: true, message: 'Esta función ya inició, no se pueden reservar asientos' });
    }

    // rq-05: no vender el mismo asiento dos veces (restricción única en BD)
    const boleto = await Boleto.create({
      asiento,
      FuncionId,
      UserId: req.user.id
    });

    return res.status(201).json({ message: 'Boleto comprado exitosamente', boleto });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: true, message: 'Este asiento ya está ocupado para esta función' });
    }
    next(error);
  }
});

// GET /api/boletos/funcion/:funcionId - ver asientos ocupados
router.get('/funcion/:funcionId', authenticate, async (req, res, next) => {
  try {
    const boletos = await Boleto.findAll({
      where: { FuncionId: req.params.funcionId },
      attributes: ['id', 'asiento']
    });
    res.json(boletos);
  } catch (error) {
    next(error);
  }
});

// GET /api/boletos/mis-boletos - boletos del usuario autenticado
router.get('/mis-boletos', authenticate, async (req, res, next) => {
  try {
    const boletos = await Boleto.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Funcion, include: [{ model: Pelicula }] }]
    });
    res.json(boletos);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
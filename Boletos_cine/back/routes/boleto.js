const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Boleto, Funcion, Pelicula, Promocion, User, sequelize } = require('../models');
const authenticate = require('../middlewares/authenticate');
const requireAdmin = require('../middlewares/requireAdmin');
const { validateFields, validateTypes } = require('../middlewares/validate');

// POST /api/boletos - comprar 1 boleto
router.post('/', authenticate, validateFields(['FuncionId', 'asiento']), validateTypes({ totalPagado: 'number' }), async (req, res, next) => {
  try {
    const { FuncionId, asiento, totalPagado, codigoPromo } = req.body;

    const asientoNum = Number(asiento);
    if (!Number.isInteger(asientoNum) || asientoNum < 1) {
      return res.status(422).json({ error: true, message: 'El asiento debe ser un número válido mayor a 0' });
    }

    const funcion = await Funcion.findByPk(FuncionId);
    if (!funcion) return res.status(404).json({ error: true, message: 'Función no encontrada' });
    if (funcion.estado === 'cancelada') return res.status(409).json({ error: true, message: 'No puedes comprar en una función cancelada' });

    const limite = funcion.limiteAsientos || 40;
    if (asientoNum > limite) return res.status(422).json({ error: true, message: `El asiento debe estar entre 1 y ${limite}` });

    const ahora = new Date();
    const fechaFuncion = new Date(funcion.fecha);
    if (fechaFuncion < new Date(ahora.toISOString().split('T')[0])) return res.status(409).json({ error: true, message: 'No puedes comprar en una función ya pasada' });
    if (fechaFuncion.toISOString().split('T')[0] === ahora.toISOString().split('T')[0]) {
      const horaFuncion = funcion.hora.split(':');
      if (Number(horaFuncion[0]) < ahora.getHours() || (Number(horaFuncion[0]) === ahora.getHours() && Number(horaFuncion[1]) <= ahora.getMinutes())) {
        return res.status(409).json({ error: true, message: 'No puedes comprar en una función ya iniciada' });
      }
    }

    if (codigoPromo) {
      const promo = await Promocion.findOne({ where: { codigo: codigoPromo.toUpperCase() } });
      if (!promo || !promo.activa) return res.status(400).json({ error: true, message: 'Código promocional no válido' });
      if (promo.usosActuales >= promo.usosMaximos) return res.status(400).json({ error: true, message: 'El código promocional ya no tiene usos disponibles' });
      await promo.increment('usosActuales');
    }

    const grupoCompra = crypto.randomUUID();
    const boleto = await Boleto.create({
      grupoCompra,
      asiento: String(asientoNum),
      FuncionId,
      UserId: req.user.id,
      totalPagado: totalPagado || 0,
      codigoPromo: codigoPromo ? codigoPromo.toUpperCase() : null
    });

    return res.status(201).json({ grupoCompra, boleto: boleto.toJSON() });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: true, message: 'Este asiento ya está ocupado' });
    }
    next(error);
  }
});

// POST /api/boletos/comprar-multiple - comprar varios asientos
router.post('/comprar-multiple', authenticate, validateFields(['FuncionId', 'asientos']), async (req, res, next) => {
  try {
    const { FuncionId, asientos, codigoPromo } = req.body;

    if (!Array.isArray(asientos) || asientos.length === 0) {
      return res.status(422).json({ error: true, message: 'Debes seleccionar al menos un asiento' });
    }

    if (asientos.length > 10) {
      return res.status(422).json({ error: true, message: 'Máximo 10 asientos por compra' });
    }

    const funcion = await Funcion.findByPk(FuncionId);
    if (!funcion) return res.status(404).json({ error: true, message: 'Función no encontrada' });
    if (funcion.estado === 'cancelada') return res.status(409).json({ error: true, message: 'No puedes comprar en una función cancelada' });

    const limite = funcion.limiteAsientos || 40;
    const asientosNum = [...new Set(asientos.map(Number))];

    for (const as of asientosNum) {
      if (!Number.isInteger(as) || as < 1 || as > limite) {
        return res.status(422).json({ error: true, message: `El asiento ${as} no es válido (debe estar entre 1 y ${limite})` });
      }
    }

    const ahora = new Date();
    const fechaFuncion = new Date(funcion.fecha);
    if (fechaFuncion < new Date(ahora.toISOString().split('T')[0])) return res.status(409).json({ error: true, message: 'No puedes comprar en una función ya pasada' });
    if (fechaFuncion.toISOString().split('T')[0] === ahora.toISOString().split('T')[0]) {
      const horaFuncion = funcion.hora.split(':');
      if (Number(horaFuncion[0]) < ahora.getHours() || (Number(horaFuncion[0]) === ahora.getHours() && Number(horaFuncion[1]) <= ahora.getMinutes())) {
        return res.status(409).json({ error: true, message: 'No puedes comprar en una función ya iniciada' });
      }
    }

    const existentes = await Boleto.findAll({
      where: { FuncionId, asiento: { [Op.in]: asientosNum.map(String) } }
    });

    if (existentes.length > 0) {
      const ocupados = existentes.map(b => b.asiento).join(', ');
      return res.status(409).json({ error: true, message: `Asientos ya ocupados: ${ocupados}` });
    }

    if (codigoPromo) {
      const promo = await Promocion.findOne({ where: { codigo: codigoPromo.toUpperCase() } });
      if (!promo || !promo.activa) return res.status(400).json({ error: true, message: 'Código promocional no válido' });
      if (promo.usosActuales >= promo.usosMaximos) return res.status(400).json({ error: true, message: 'El código promocional ya no tiene usos disponibles' });
      await promo.increment('usosActuales');
    }

    const grupoCompra = crypto.randomUUID();
    const precioUnitario = Number(funcion.precio);
    const totalPagado = codigoPromo
      ? Math.round(precioUnitario * (1 - (await obtenerDescuento(codigoPromo)) / 100) * asientosNum.length)
      : precioUnitario * asientosNum.length;

    const boletosData = asientosNum.map(as => ({
      grupoCompra,
      asiento: String(as),
      FuncionId,
      UserId: req.user.id,
      totalPagado,
      codigoPromo: codigoPromo ? codigoPromo.toUpperCase() : null
    }));

    const boletos = await Boleto.bulkCreate(boletosData);
    return res.status(201).json({ grupoCompra, boletos });
  } catch (error) {
    next(error);
  }
});

async function obtenerDescuento(codigo) {
  try {
    const promo = await Promocion.findOne({ where: { codigo: codigo.toUpperCase() } });
    return promo ? promo.descuento : 0;
  } catch {
    return 0;
  }
}

// GET /api/boletos/grupo/:grupoCompra - ver detalle de compra múltiple (público con UUID)
router.get('/grupo/:grupoCompra', async (req, res, next) => {
  try {
    const boletos = await Boleto.findAll({
      where: { grupoCompra: req.params.grupoCompra },
      include: [{
        model: Funcion,
        include: [{ model: Pelicula }]
      }]
    });

    if (boletos.length === 0) {
      return res.status(404).json({ error: true, message: 'Compra no encontrada' });
    }

    return res.json({ grupoCompra: req.params.grupoCompra, boletos });
  } catch (error) {
    next(error);
  }
});

// GET /api/boletos/admin/stats - estadísticas para el dashboard (admin)
router.get('/admin/stats', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const totalBoletos = await Boleto.count();
    const ingresos = await Boleto.sum('totalPagado');
    const boletosPorPelicula = await Boleto.findAll({
      attributes: [
        [sequelize.col('Funcion.Pelicula.titulo'), 'pelicula'],
        [sequelize.fn('COUNT', sequelize.col('Boleto.id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('Boleto.totalPagado')), 'ingresos']
      ],
      include: [{
        model: Funcion,
        include: [{ model: Pelicula, attributes: [] }],
        attributes: []
      }],
      group: ['Funcion.PeliculaId', 'Funcion->Pelicula.titulo'],
      raw: true
    });

    res.json({
      totalBoletos,
      ingresosTotales: ingresos || 0,
      boletosPorPelicula
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/boletos/admin/ventas - últimas ventas (admin)
router.get('/admin/ventas', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const boletos = await Boleto.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: Funcion, include: [{ model: Pelicula }] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(boletos);
  } catch (error) {
    next(error);
  }
});

// GET /api/boletos/:id - ver detalle individual
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const boleto = await Boleto.findByPk(req.params.id, {
      include: [{ model: Funcion, include: [{ model: Pelicula }] }]
    });

    if (!boleto) return res.status(404).json({ error: true, message: 'Boleto no encontrado' });
    if (req.user.role !== 'admin' && boleto.UserId !== req.user.id) {
      return res.status(403).json({ error: true, message: 'No tienes permiso para ver este boleto' });
    }

    return res.json(boleto.toJSON());
  } catch (error) {
    next(error);
  }
});

router.get('/funcion/:funcionId', async (req, res, next) => {
  try {
    const boletos = await Boleto.findAll({ where: { FuncionId: req.params.funcionId } });
    res.json(boletos);
  } catch (error) { next(error); }
});

module.exports = router;

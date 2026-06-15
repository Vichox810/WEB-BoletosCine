const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticate = require('../middlewares/authenticate');
const requireAdmin = require('../middlewares/requireAdmin');
const { User, PasswordResetToken } = require('../models');
const crypto = require('crypto');
const { validateFields, validateEmail } = require('../middlewares/validate');

// POST /api/users/register
router.post('/register', validateFields(['name', 'email', 'password']), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ error: true, message: 'Formato de email inválido' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: true, message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: true, message: 'El email ya está registrado' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/users/login
router.post('/login', validateFields(['email', 'password']), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: true, message: 'Credenciales inválidas' });
    }

    const passwordValida = await user.validatePassword(password);
    if (!passwordValida) {
      return res.status(401).json({ error: true, message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/users - solo admins
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    })
    res.json(users)
  } catch (error) {
    next(error)
  }
})

// POST /api/users/solicitar-reset
router.post('/solicitar-reset', validateFields(['email']), async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: 'Si el email existe, se generó un token de restablecimiento' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await PasswordResetToken.create({ token, UserId: user.id, expiresAt });

    return res.json({
      message: 'Token de restablecimiento generado (modo desarrollo)',
      token
    });

  } catch (error) {
    next(error);
  }
});

// POST /api/users/resetear
router.post('/resetear', validateFields(['token', 'password']), async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (password.length < 8) {
      return res.status(400).json({ error: true, message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const resetToken = await PasswordResetToken.findOne({ where: { token } });
    if (!resetToken) {
      return res.status(400).json({ error: true, message: 'Token inválido' });
    }

    if (resetToken.expiresAt < new Date()) {
      await resetToken.destroy();
      return res.status(400).json({ error: true, message: 'El token ha expirado' });
    }

    const user = await User.findByPk(resetToken.UserId);
    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }

    user.password = password;
    await user.save();
    await resetToken.destroy();

    return res.json({ message: 'Contraseña actualizada exitosamente' });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
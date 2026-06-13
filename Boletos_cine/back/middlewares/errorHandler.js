// 404 - ruta no encontrada (va después de todas las rutas)
const notFound = (req, res, next) => {
  res.status(404).json({
    error: true,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  })
}

// Manejador centralizado de errores (va al final de todo)
const errorHandler = (err, req, res, next) => {
  console.error(err)

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: true,
      message: 'Error de validación',
      details: err.errors.map(e => e.message)
    })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: true,
      message: 'El registro ya existe',
      details: err.errors.map(e => e.message)
    })
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(422).json({
      error: true,
      message: 'Referencia inválida a otro recurso'
    })
  }

  const status = err.status || 500

  return res.status(status).json({
    error: true,
    message: status === 500 && process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor'
  })
}

module.exports = { notFound, errorHandler }
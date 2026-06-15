const validateFields = (requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(f => !req.body[f] && req.body[f] !== 0)
    if (missing.length > 0) {
      return res.status(400).json({
        error: true,
        message: `Campos requeridos: ${missing.join(', ')}`
      })
    }
    next()
  }
}

const validateTypes = (fieldTypes) => {
  return (req, res, next) => {
    for (const [field, type] of Object.entries(fieldTypes)) {
      if (req.body[field] !== undefined && typeof req.body[field] !== type) {
        return res.status(422).json({
          error: true,
          message: `El campo '${field}' debe ser de tipo ${type}`
        })
      }
      if (type === 'number' && req.body[field] !== undefined && req.body[field] < 0) {
        return res.status(422).json({
          error: true,
          message: `El campo '${field}' no puede ser negativo`
        })
      }
    }
    next()
  }
}

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

module.exports = { validateFields, validateTypes, validateEmail }

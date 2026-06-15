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

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

module.exports = { validateFields, validateEmail }

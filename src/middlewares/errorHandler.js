const debug = require("debug")("vagamundo:error");

// Middleware 500: gestor central de errores.
// Express lo reconoce porque recibe 4 parámetros (err, req, res, next).
function errorHandler(err, req, res, next) {
  debug(err);

  // ID de Mongo con formato incorrecto
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Bad Request", mensaje: "ID no válido." });
  }

  // Error de validación de Mongoose (campos obligatorios, tipos, etc.)
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Validation Error", mensaje: err.message });
  }

  res.status(err.status || 500).json({
    error: "Internal Server Error",
    mensaje: err.message || "Ha ocurrido un error inesperado.",
  });
}

module.exports = errorHandler;

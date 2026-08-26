// Middleware 404: se ejecuta cuando ninguna ruta anterior ha respondido.
function notFound(req, res, next) {
  res.status(404).json({
    error: "Not Found",
    mensaje: `La ruta ${req.method} ${req.originalUrl} no existe.`,
  });
}

module.exports = notFound;

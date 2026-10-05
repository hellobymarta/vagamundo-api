const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

// Middleware de autenticación: protege las rutas que cambian datos.
// Si el token falta, ha caducado o no es nuestro, corta aquí con un 401 y la
// ruta ni siquiera llega a ejecutarse.
async function requireAuth(req, res, next) {
  const cabecera = req.headers.authorization || "";
  const token = cabecera.startsWith("Bearer ") ? cabecera.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      mensaje: "Tienes que iniciar sesión para hacer esto.",
    });
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await User.findById(id);

    if (!usuario) {
      return res.status(401).json({
        error: "Unauthorized",
        mensaje: "Esta cuenta ya no existe.",
      });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    const caducado = err.name === "TokenExpiredError";

    res.status(401).json({
      error: "Unauthorized",
      mensaje: caducado
        ? "Tu sesión ha caducado, vuelve a entrar."
        : "La sesión no es válida.",
    });
  }
}

// Comprueba que quien pide el cambio es quien escribió el documento. Compara
// los identificadores como texto porque uno viene de Mongo y otro de la sesión.
function esSuyo(documento, usuario) {
  const autor = documento.autor || documento.usuario || documento.creadoPor;
  return String(autor && autor._id ? autor._id : autor) === String(usuario._id);
}

module.exports = { requireAuth, esSuyo };

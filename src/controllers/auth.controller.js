const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

const DURACION_TOKEN = "7d";

// Firma el token con el que viaja la sesión. Dentro solo va el id: todo lo
// demás se consulta en la base de datos, que es la que manda.
function firmarToken(usuario) {
  return jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: DURACION_TOKEN,
  });
}

// POST /api/auth/register -> crear una cuenta nueva
async function register(req, res, next) {
  try {
    const { nombre, email, password } = req.body || {};

    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: "Bad Request",
        mensaje: "Hacen falta el nombre, el correo y la contraseña.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Bad Request",
        mensaje: "La contraseña necesita ocho caracteres como mínimo.",
      });
    }

    const repetido = await User.exists({ email: email.toLowerCase().trim() });

    if (repetido) {
      return res.status(409).json({
        error: "Conflict",
        mensaje: "Ya hay una cuenta con ese correo.",
      });
    }

    const usuario = await User.create({ nombre, email, password });

    res.status(201).json({ token: firmarToken(usuario), usuario });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login -> entrar con una cuenta existente
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: "Bad Request",
        mensaje: "Escribe el correo y la contraseña.",
      });
    }

    // La contraseña no viene en las consultas normales, hay que pedirla.
    const usuario = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );

    // El mismo mensaje tanto si el correo no existe como si la contraseña no
    // es la buena: así nadie puede averiguar qué correos están registrados.
    if (!usuario || !(await usuario.passwordCorrecta(password))) {
      return res.status(401).json({
        error: "Unauthorized",
        mensaje: "El correo o la contraseña no son correctos.",
      });
    }

    res.json({ token: firmarToken(usuario), usuario });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me -> sirve para que el frontend compruebe, al abrir la web,
// si el token que tiene guardado sigue valiendo.
function me(req, res) {
  res.json({ usuario: req.usuario });
}

module.exports = { register, login, me };

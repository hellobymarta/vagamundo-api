const express = require("express");

const notFound = require("../middlewares/not-found");
const errorHandler = require("../middlewares/error-handler");

const ctrl = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/require-auth");

const router = express.Router();

router.post("/register", ctrl.register); // POST /api/auth/register
router.post("/login", ctrl.login);       // POST /api/auth/login
router.get("/me", requireAuth, ctrl.me); // GET  /api/auth/me

// Los middlewares de 404 y 500 van también aquí, al final del router, además
// de al final de app.js. Así una dirección que empieza por este prefijo pero
// no encaja con ninguna de las rutas de arriba se queda en este router, y los
// errores de sus controladores se contestan en el mismo sitio donde se han
// producido.
router.use(notFound);
router.use(errorHandler);

module.exports = router;

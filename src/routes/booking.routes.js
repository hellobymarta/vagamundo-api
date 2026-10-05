const express = require("express");

const notFound = require("../middlewares/not-found");
const errorHandler = require("../middlewares/error-handler");

const ctrl = require("../controllers/booking.controller");
const { requireAuth } = require("../middlewares/require-auth");

const router = express.Router();

// Todas las reservas son privadas: cada persona ve y toca solo las suyas.
router.use(requireAuth);

router.get("/", ctrl.getBookings);          // GET    /api/bookings
router.post("/", ctrl.createBooking);       // POST   /api/bookings
router.put("/:id", ctrl.updateBooking);     // PUT    /api/bookings/:id
router.delete("/:id", ctrl.deleteBooking);  // DELETE /api/bookings/:id

// Los middlewares de 404 y 500 van también aquí, al final del router, además
// de al final de app.js. Así una dirección que empieza por este prefijo pero
// no encaja con ninguna de las rutas de arriba se queda en este router, y los
// errores de sus controladores se contestan en el mismo sitio donde se han
// producido.
router.use(notFound);
router.use(errorHandler);

module.exports = router;

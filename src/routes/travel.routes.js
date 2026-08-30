const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/travel.controller");
const notFound = require("../middlewares/notFound");
const errorHandler = require("../middlewares/errorHandler");

router.get("/", ctrl.getTravels);          // GET    /api/travels
router.get("/:id", ctrl.getTravel);        // GET    /api/travels/:id
router.post("/", ctrl.createTravel);       // POST   /api/travels
router.put("/:id", ctrl.updateTravel);     // PUT    /api/travels/:id
router.delete("/:id", ctrl.deleteTravel);  // DELETE /api/travels/:id

// Los middlewares de error se asignan también al propio router:
// cualquier ruta /api/travels/... que no coincida cae aquí.
router.use(notFound);       // 404
router.use(errorHandler);   // 500

module.exports = router;
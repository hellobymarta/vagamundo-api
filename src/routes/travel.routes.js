const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/travel.controller");

router.get("/", ctrl.getTravels);          // GET    /api/travels
router.get("/:id", ctrl.getTravel);        // GET    /api/travels/:id
router.post("/", ctrl.createTravel);       // POST   /api/travels
router.put("/:id", ctrl.updateTravel);     // PUT    /api/travels/:id
router.delete("/:id", ctrl.deleteTravel);  // DELETE /api/travels/:id

module.exports = router;
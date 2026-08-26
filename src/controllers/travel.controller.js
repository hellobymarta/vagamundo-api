const Travel = require("../models/Travel");

// GET /api/travels -> todos los viajes
async function getTravels(req, res, next) {
  try {
    const travels = await Travel.find().sort({ createdAt: -1 });
    res.json(travels);
  } catch (err) {
    next(err);
  }
}

// GET /api/travels/:id -> un viaje concreto
async function getTravel(req, res, next) {
  try {
    const travel = await Travel.findById(req.params.id);
    if (!travel) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }
    res.json(travel);
  } catch (err) {
    next(err);
  }
}

// POST /api/travels -> crear
async function createTravel(req, res, next) {
  try {
    const nuevo = await Travel.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
}

// PUT /api/travels/:id -> actualizar
async function updateTravel(req, res, next) {
  try {
    const travel = await Travel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!travel) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }
    res.json(travel);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/travels/:id -> eliminar
async function deleteTravel(req, res, next) {
  try {
    const travel = await Travel.findByIdAndDelete(req.params.id);
    if (!travel) {
      return res.status(404).json({ mensaje: "Viaje no encontrado" });
    }
    res.json({ mensaje: "Viaje eliminado", id: req.params.id });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTravels,
  getTravel,
  createTravel,
  updateTravel,
  deleteTravel,
};
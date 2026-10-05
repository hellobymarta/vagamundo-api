const Travel = require("../models/travel.model");
const Booking = require("../models/booking.model");
const { esSuyo } = require("../middlewares/require-auth");

// Cuenta, de una sola consulta, las plazas comprometidas en cada viaje. Las
// reservas canceladas no ocupan. Devuelve un Map para repartirlas después sin
// volver a la base de datos por cada viaje.
async function ocupacionPorViaje() {
  const filas = await Booking.aggregate([
    { $match: { estado: { $in: ["pendiente", "confirmada"] } } },
    { $group: { _id: "$viaje", personas: { $sum: "$personas" } } },
  ]);

  return new Map(filas.map((fila) => [String(fila._id), fila.personas]));
}

// Añade al viaje las plazas que quedan libres, que no se guardan en la base de
// datos porque se deducen de las reservas.
function conPlazas(travel, ocupadas) {
  const reservadas = ocupadas.get(String(travel._id)) || 0;

  return {
    ...travel.toJSON(),
    plazasReservadas: reservadas,
    plazasLibres: Math.max(0, travel.plazas - reservadas),
  };
}

// GET /api/travels -> todos los viajes. Admite ?destino= y ?categoria= para
// filtrar, y ?maxPrecio= para quedarse con los que no pasan de ese precio.
async function getTravels(req, res, next) {
  try {
    const { destino, categoria, maxPrecio } = req.query;
    const filtro = {};

    if (destino) filtro.destino = destino;
    if (categoria) filtro.categoria = categoria;
    if (maxPrecio) filtro.precio = { $lte: Number(maxPrecio) };

    const travels = await Travel.find(filtro).sort({ createdAt: -1 });
    const ocupadas = await ocupacionPorViaje();

    res.json(travels.map((travel) => conPlazas(travel, ocupadas)));
  } catch (err) {
    next(err);
  }
}

// GET /api/travels/:id -> un viaje concreto
async function getTravel(req, res, next) {
  try {
    const travel = await Travel.findById(req.params.id);

    if (!travel) {
      return res.status(404).json({ error: "Not Found", mensaje: "Viaje no encontrado." });
    }

    res.json(conPlazas(travel, await ocupacionPorViaje()));
  } catch (err) {
    next(err);
  }
}

// POST /api/travels -> crear. Hay que haber entrado.
async function createTravel(req, res, next) {
  try {
    const nuevo = await Travel.create({ ...req.body, creadoPor: req.usuario._id });

    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
}

// PUT /api/travels/:id -> actualizar. Hay que haber entrado.
async function updateTravel(req, res, next) {
  try {
    const travel = await Travel.findById(req.params.id);

    if (!travel) {
      return res.status(404).json({ error: "Not Found", mensaje: "Viaje no encontrado." });
    }

    // El catálogo lo mantiene el equipo entero, así que cualquiera que haya
    // entrado puede corregir una ficha. Solo quien la creó, o un admin, puede
    // borrarla.
    Object.assign(travel, req.body);
    await travel.save();

    res.json(travel);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/travels/:id -> eliminar. Solo quien lo creó o un admin.
async function deleteTravel(req, res, next) {
  try {
    const travel = await Travel.findById(req.params.id);

    if (!travel) {
      return res.status(404).json({ error: "Not Found", mensaje: "Viaje no encontrado." });
    }

    const puede = req.usuario.rol === "admin" || !travel.creadoPor || esSuyo(travel, req.usuario);

    if (!puede) {
      return res.status(403).json({
        error: "Forbidden",
        mensaje: "Este viaje lo creó otra persona del equipo.",
      });
    }

    // Las reservas de un viaje que ya no existe no llevan a ninguna parte.
    await Booking.deleteMany({ viaje: travel._id });
    await travel.deleteOne();

    res.json({ mensaje: "Viaje eliminado", id: req.params.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTravels, getTravel, createTravel, updateTravel, deleteTravel };

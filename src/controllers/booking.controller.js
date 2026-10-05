const Booking = require("../models/booking.model");
const Travel = require("../models/travel.model");
const { esSuyo } = require("../middlewares/require-auth");

const VIAJE = { path: "viaje", select: "nombre destino precio duracionDias imagen plazas" };

// El número de personas de una reserva se valida igual al crearla y al
// cambiarla, así que la comprobación vive en un solo sitio.
//
// Aquí solo compruebo que sea un entero de uno en adelante. El tope no lo
// pongo yo: lo ponen las plazas que le queden al viaje, que nunca pasan de
// ocho. Son dos cosas distintas y la API las contesta distinto: un número
// imposible es un 400, y no caber en esta salida es un 409.
function personasValidas(valor) {
  const cuantas = Number(valor);

  return Number.isInteger(cuantas) && cuantas >= 1
    ? { cuantas }
    : { error: "El número de personas tiene que ser uno o más." };
}

// Cuenta las plazas ya comprometidas en un viaje: las pendientes y las
// confirmadas ocupan, las canceladas no.
async function plazasOcupadas(viajeId) {
  const reservas = await Booking.find({
    viaje: viajeId,
    estado: { $in: ["pendiente", "confirmada"] },
  });

  return reservas.reduce((suma, una) => suma + una.personas, 0);
}

// GET /api/bookings -> las reservas de quien ha entrado
async function getBookings(req, res, next) {
  try {
    const reservas = await Booking.find({ usuario: req.usuario._id })
      .populate(VIAJE)
      .sort({ createdAt: -1 });

    res.json(reservas);
  } catch (err) {
    next(err);
  }
}

// POST /api/bookings -> reservar plazas en un viaje
async function createBooking(req, res, next) {
  try {
    const { viaje: viajeId, personas, notas } = req.body || {};

    if (!viajeId) {
      return res.status(400).json({ error: "Bad Request", mensaje: "Falta el viaje." });
    }

    const { cuantas, error } = personasValidas(personas);

    if (error) {
      return res.status(400).json({ error: "Bad Request", mensaje: error });
    }

    const viaje = await Travel.findById(viajeId);

    if (!viaje) {
      return res.status(404).json({ error: "Not Found", mensaje: "Viaje no encontrado." });
    }

    if (!viaje.disponible) {
      return res.status(409).json({
        error: "Conflict",
        mensaje: "Este viaje no admite reservas ahora mismo.",
      });
    }

    // Antes de aceptar, compruebo que caben: si no, la reserva dejaría el
    // viaje con más gente apuntada que plazas tiene.
    const ocupadas = await plazasOcupadas(viaje._id);
    const libres = viaje.plazas - ocupadas;

    if (cuantas > libres) {
      return res.status(409).json({
        error: "Conflict",
        mensaje:
          libres > 0
            ? `Solo quedan ${libres} plazas en este viaje.`
            : "Este viaje ya está completo.",
      });
    }

    const reserva = await Booking.create({
      viaje: viaje._id,
      usuario: req.usuario._id,
      personas: cuantas,
      notas: notas || "",
    });

    await reserva.populate(VIAJE);

    res.status(201).json(reserva);
  } catch (err) {
    next(err);
  }
}

// PUT /api/bookings/:id -> cambiar personas o notas de una reserva propia
async function updateBooking(req, res, next) {
  try {
    const reserva = await Booking.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({ error: "Not Found", mensaje: "Reserva no encontrada." });
    }

    if (!esSuyo(reserva, req.usuario)) {
      return res.status(403).json({ error: "Forbidden", mensaje: "Esta reserva no es tuya." });
    }

    if (req.body.personas !== undefined) {
      const { cuantas, error } = personasValidas(req.body.personas);

      if (error) {
        return res.status(400).json({ error: "Bad Request", mensaje: error });
      }

      const viaje = await Travel.findById(reserva.viaje);
      const ocupadas = (await plazasOcupadas(reserva.viaje)) - reserva.personas;

      if (cuantas > viaje.plazas - ocupadas) {
        return res.status(409).json({
          error: "Conflict",
          mensaje: `Solo quedan ${viaje.plazas - ocupadas} plazas en este viaje.`,
        });
      }

      reserva.personas = cuantas;
    }

    if (req.body.notas !== undefined) reserva.notas = req.body.notas;

    await reserva.save();
    await reserva.populate(VIAJE);

    res.json(reserva);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/bookings/:id -> anular una reserva propia
async function deleteBooking(req, res, next) {
  try {
    const reserva = await Booking.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({ error: "Not Found", mensaje: "Reserva no encontrada." });
    }

    if (!esSuyo(reserva, req.usuario)) {
      return res.status(403).json({ error: "Forbidden", mensaje: "Esta reserva no es tuya." });
    }

    await reserva.deleteOne();

    res.json({ mensaje: "Reserva anulada", id: req.params.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBookings, createBooking, updateBooking, deleteBooking };

const Travel = require("../models/travel.model");
const Booking = require("../models/booking.model");
const Post = require("../models/post.model");

// GET /api/stats -> los números de la agencia, para el panel privado.
// Los cálculos se hacen en la base de datos con el pipeline de agregación, no
// trayendo todos los documentos para contarlos aquí.
async function getStats(req, res, next) {
  try {
    const [resumenViajes] = await Travel.aggregate([
      {
        $group: {
          _id: null,
          viajes: { $sum: 1 },
          plazas: { $sum: "$plazas" },
          precioMedio: { $avg: "$precio" },
          duracionMedia: { $avg: "$duracionDias" },
          disponibles: { $sum: { $cond: ["$disponible", 1, 0] } },
        },
      },
    ]);

    const [resumenReservas] = await Booking.aggregate([
      { $match: { estado: { $in: ["pendiente", "confirmada"] } } },
      { $group: { _id: null, reservas: { $sum: 1 }, personas: { $sum: "$personas" } } },
    ]);

    const porDestino = await Travel.aggregate([
      {
        $group: {
          _id: "$destino",
          viajes: { $sum: 1 },
          plazas: { $sum: "$plazas" },
          precioMedio: { $avg: "$precio" },
        },
      },
      { $sort: { viajes: -1, _id: 1 } },
      { $limit: 12 },
    ]);

    const plazas = resumenViajes?.plazas || 0;
    const personas = resumenReservas?.personas || 0;

    res.json({
      viajes: resumenViajes?.viajes || 0,
      disponibles: resumenViajes?.disponibles || 0,
      plazas,
      plazasReservadas: personas,
      plazasLibres: Math.max(0, plazas - personas),
      ocupacion: plazas > 0 ? Math.round((personas / plazas) * 100) : 0,
      precioMedio: Math.round(resumenViajes?.precioMedio || 0),
      duracionMedia: Math.round((resumenViajes?.duracionMedia || 0) * 10) / 10,
      reservas: resumenReservas?.reservas || 0,
      cronicas: await Post.countDocuments(),
      porDestino: porDestino.map((uno) => ({
        destino: uno._id || "Sin destino",
        viajes: uno.viajes,
        plazas: uno.plazas,
        precioMedio: Math.round(uno.precioMedio),
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };

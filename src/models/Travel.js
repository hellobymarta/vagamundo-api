const mongoose = require("mongoose");

// Modelo de Travel (viaje): entidad principal del catálogo Vagamundo.
const travelSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: "" },
    destino: { type: String, required: true },
    precio: { type: Number, required: true, min: 0 },
    duracionDias: { type: Number, required: true, min: 1 },
    itinerario: { type: String, default: "" },
    imagen: { type: String, default: "" },
    categoria: { type: String, default: "" },
    disponible: { type: Boolean, default: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Travel", travelSchema, "viajes");
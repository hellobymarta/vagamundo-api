const mongoose = require("mongoose");

// Modelo de Travel (viaje): entidad principal del catálogo de Vagamundo.
const travelSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    descripcion: { type: String, default: "", maxlength: 4000 },
    destino: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    duracionDias: { type: Number, required: true, min: 1, max: 90 },
    itinerario: { type: String, default: "", maxlength: 8000 },
    imagen: { type: String, default: "" },
    categoria: { type: String, default: "", trim: true },

    // Plazas totales de la salida. De aquí salen las que quedan libres, que se
    // calculan restando las reservas confirmadas. Ocho es el máximo con el que
    // trabajamos: ningún grupo pasa de ocho personas, y es lo que dice la web
    // de principio a fin, así que es también el valor por defecto.
    plazas: { type: Number, default: 8, min: 1, max: 8 },

    disponible: { type: Boolean, default: true },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

travelSchema.set("toJSON", {
  versionKey: false,
  transform: (documento, salida) => {
    salida.id = salida._id.toString();
    delete salida._id;
  },
});

module.exports = mongoose.model("Travel", travelSchema, "viajes");

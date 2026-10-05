const mongoose = require("mongoose");

// Modelo de Booking: la reserva de plazas que hace una persona en un viaje.
const bookingSchema = new mongoose.Schema(
  {
    viaje: { type: mongoose.Schema.Types.ObjectId, ref: "Travel", required: true, index: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Como mucho, las plazas de una salida: ningun grupo pasa de ocho.
    personas: { type: Number, required: true, min: 1, max: 8 },
    notas: { type: String, default: "", trim: true, maxlength: 500 },
    estado: {
      type: String,
      enum: ["pendiente", "confirmada", "cancelada"],
      default: "pendiente",
    },
  },
  { timestamps: true }
);

bookingSchema.set("toJSON", {
  versionKey: false,
  transform: (documento, salida) => {
    salida.id = salida._id.toString();
    delete salida._id;
  },
});

module.exports = mongoose.model("Booking", bookingSchema, "reservas");

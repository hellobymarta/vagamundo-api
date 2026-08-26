const mongoose = require("mongoose");

// Modelo de Usuario (entidad obligatoria del proyecto).
const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true } // añade createdAt y updatedAt automáticamente
);

module.exports = mongoose.model("User", userSchema);

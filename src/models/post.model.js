const mongoose = require("mongoose");

// Modelo de Post: una crónica del diario de viajes. La fotografía se guarda
// dentro del documento en Base64, así no hace falta un servicio de archivos.
const postSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true, maxlength: 120 },
    destino: { type: String, required: true, trim: true, maxlength: 80 },
    contenido: { type: String, required: true, trim: true, maxlength: 10000 },
    imagen: { type: String, required: true },
    autor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

postSchema.set("toJSON", {
  versionKey: false,
  transform: (documento, salida) => {
    salida.id = salida._id.toString();
    delete salida._id;
  },
});

module.exports = mongoose.model("Post", postSchema, "cronicas");

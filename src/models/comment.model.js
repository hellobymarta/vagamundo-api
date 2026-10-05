const mongoose = require("mongoose");

// Modelo de Comment: un comentario colgado de una crónica del diario.
const commentSchema = new mongoose.Schema(
  {
    texto: { type: String, required: true, trim: true, maxlength: 1000 },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    autor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

commentSchema.set("toJSON", {
  versionKey: false,
  transform: (documento, salida) => {
    salida.id = salida._id.toString();
    delete salida._id;
  },
});

module.exports = mongoose.model("Comment", commentSchema, "comentarios");

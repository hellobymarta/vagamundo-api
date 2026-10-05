const Comment = require("../models/comment.model");
const { esSuyo } = require("../middlewares/require-auth");

const AUTOR = { path: "autor", select: "nombre" };

// Crear un comentario vive en la ruta de la crónica, porque un comentario
// siempre nace colgado de una. Aquí quedan editarlo y borrarlo, que solo
// necesitan su propio id.

// PUT /api/comments/:id
async function updateComment(req, res, next) {
  try {
    const comentario = await Comment.findById(req.params.id);

    if (!comentario) {
      return res.status(404).json({ error: "Not Found", mensaje: "Comentario no encontrado." });
    }

    if (!esSuyo(comentario, req.usuario)) {
      return res.status(403).json({ error: "Forbidden", mensaje: "Este comentario no es tuyo." });
    }

    const texto = (req.body?.texto || "").trim();

    if (texto.length < 2) {
      return res.status(400).json({ error: "Bad Request", mensaje: "Escribe el comentario." });
    }

    comentario.texto = texto;
    await comentario.save();
    await comentario.populate(AUTOR);

    res.json(comentario);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/comments/:id
async function deleteComment(req, res, next) {
  try {
    const comentario = await Comment.findById(req.params.id);

    if (!comentario) {
      return res.status(404).json({ error: "Not Found", mensaje: "Comentario no encontrado." });
    }

    if (!esSuyo(comentario, req.usuario)) {
      return res.status(403).json({ error: "Forbidden", mensaje: "Este comentario no es tuyo." });
    }

    await comentario.deleteOne();

    res.json({ mensaje: "Comentario eliminado", id: req.params.id });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateComment, deleteComment };

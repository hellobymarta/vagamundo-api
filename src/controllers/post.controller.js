const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const { esSuyo } = require("../middlewares/require-auth");

const POR_PAGINA = 6;
const AUTOR = { path: "autor", select: "nombre" };

// Tipos y peso que se aceptan en la fotografía. Viaja en Base64 dentro del
// documento, así que conviene ponerle un techo.
const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp"];
const MAXIMO_IMAGEN = 1500000;

function validarImagen(valor) {
  if (typeof valor !== "string" || !valor.startsWith("data:")) {
    return "La crónica necesita una fotografía.";
  }
  if (!TIPOS_IMAGEN.includes(valor.slice(5).split(";")[0])) {
    return "La fotografía tiene que ser JPG, PNG o WebP.";
  }
  if (valor.length > MAXIMO_IMAGEN) {
    return "La fotografía pesa demasiado, elige una más ligera.";
  }
  return null;
}

// Trae los comentarios de varias crónicas de una vez y los reparte, en lugar
// de pedirlos crónica por crónica dentro de un bucle.
async function comentariosDe(ids) {
  const comentarios = await Comment.find({ post: { $in: ids } })
    .populate(AUTOR)
    .sort({ createdAt: 1 });

  const porPost = new Map(ids.map((id) => [String(id), []]));
  comentarios.forEach((uno) => porPost.get(String(uno.post))?.push(uno.toJSON()));

  return porPost;
}

// GET /api/posts?pagina=1 -> público, con los comentarios dentro
async function getPosts(req, res, next) {
  try {
    const pagina = Math.max(1, Number(req.query.pagina) || 1);
    const total = await Post.countDocuments();
    const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

    const posts = await Post.find()
      .populate(AUTOR)
      .sort({ createdAt: -1 })
      .skip((pagina - 1) * POR_PAGINA)
      .limit(POR_PAGINA);

    const comentarios = await comentariosDe(posts.map((uno) => uno._id));

    res.json({
      posts: posts.map((uno) => ({
        ...uno.toJSON(),
        comentarios: comentarios.get(String(uno._id)) || [],
      })),
      pagina,
      paginas,
      total,
      porPagina: POR_PAGINA,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/posts/:id -> público
async function getPost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id).populate(AUTOR);

    if (!post) {
      return res.status(404).json({ error: "Not Found", mensaje: "Crónica no encontrada." });
    }

    const comentarios = await Comment.find({ post: post._id })
      .populate(AUTOR)
      .sort({ createdAt: 1 });

    res.json({ ...post.toJSON(), comentarios });
  } catch (err) {
    next(err);
  }
}

// POST /api/posts -> hay que haber entrado
async function createPost(req, res, next) {
  try {
    const { titulo, destino, contenido, imagen } = req.body || {};
    const falloImagen = validarImagen(imagen);

    if (!titulo || !destino || !contenido || falloImagen) {
      return res.status(400).json({
        error: "Bad Request",
        mensaje: falloImagen || "Faltan el título, el destino o el texto.",
      });
    }

    const post = await Post.create({
      titulo,
      destino,
      contenido,
      imagen,
      autor: req.usuario._id,
    });

    await post.populate(AUTOR);

    res.status(201).json({ ...post.toJSON(), comentarios: [] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/posts/:id -> solo quien la escribió
async function updatePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Not Found", mensaje: "Crónica no encontrada." });
    }

    if (!esSuyo(post, req.usuario)) {
      return res.status(403).json({ error: "Forbidden", mensaje: "Esta crónica no es tuya." });
    }

    if (req.body.imagen !== undefined) {
      const falloImagen = validarImagen(req.body.imagen);

      if (falloImagen) {
        return res.status(400).json({ error: "Bad Request", mensaje: falloImagen });
      }
    }

    ["titulo", "destino", "contenido", "imagen"].forEach((campo) => {
      if (req.body[campo] !== undefined) post[campo] = req.body[campo];
    });

    await post.save();
    await post.populate(AUTOR);

    const comentarios = await Comment.find({ post: post._id }).populate(AUTOR).sort({ createdAt: 1 });

    res.json({ ...post.toJSON(), comentarios });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/posts/:id -> solo quien la escribió
async function deletePost(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Not Found", mensaje: "Crónica no encontrada." });
    }

    if (!esSuyo(post, req.usuario)) {
      return res.status(403).json({ error: "Forbidden", mensaje: "Esta crónica no es tuya." });
    }

    // Si borrase solo la crónica, sus comentarios se quedarían en la base de
    // datos apuntando a algo que ya no está.
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({ mensaje: "Crónica eliminada", id: req.params.id });
  } catch (err) {
    next(err);
  }
}

// POST /api/posts/:id/comments -> hay que haber entrado
async function createComment(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Not Found", mensaje: "Crónica no encontrada." });
    }

    const texto = (req.body?.texto || "").trim();

    if (texto.length < 2) {
      return res.status(400).json({ error: "Bad Request", mensaje: "Escribe el comentario." });
    }

    const comentario = await Comment.create({ texto, post: post._id, autor: req.usuario._id });
    await comentario.populate(AUTOR);

    res.status(201).json(comentario);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPosts, getPost, createPost, updatePost, deletePost, createComment };

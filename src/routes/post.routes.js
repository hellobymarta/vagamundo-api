const express = require("express");

const notFound = require("../middlewares/not-found");
const errorHandler = require("../middlewares/error-handler");

const ctrl = require("../controllers/post.controller");
const { requireAuth } = require("../middlewares/require-auth");

const router = express.Router();

// El diario se lee sin cuenta; escribir y comentar piden sesión.
router.get("/", ctrl.getPosts);                                    // GET    /api/posts
router.get("/:id", ctrl.getPost);                                  // GET    /api/posts/:id
router.post("/", requireAuth, ctrl.createPost);                    // POST   /api/posts
router.put("/:id", requireAuth, ctrl.updatePost);                  // PUT    /api/posts/:id
router.delete("/:id", requireAuth, ctrl.deletePost);               // DELETE /api/posts/:id
router.post("/:id/comments", requireAuth, ctrl.createComment);     // POST   /api/posts/:id/comments

// Los middlewares de 404 y 500 van también aquí, al final del router, además
// de al final de app.js. Así una dirección que empieza por este prefijo pero
// no encaja con ninguna de las rutas de arriba se queda en este router, y los
// errores de sus controladores se contestan en el mismo sitio donde se han
// producido.
router.use(notFound);
router.use(errorHandler);

module.exports = router;

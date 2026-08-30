const express = require("express");
const cors = require("cors");

const travelRoutes = require("./routes/travel.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Middlewares globales
app.use(cors());            // permite peticiones desde el frontend
app.use(express.json());    // entiende cuerpos JSON

// Ruta de salud (comprueba que la API responde)
app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API de Vagamundo en funcionamiento" });
});

// Rutas de la API
app.use("/api/travels", travelRoutes);

// Middlewares de error (SIEMPRE al final, después de las rutas)
app.use(notFound);      // 404 -> ruta no encontrada
app.use(errorHandler);  // 500 -> gestor central de errores

module.exports = app;

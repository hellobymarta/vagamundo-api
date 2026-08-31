const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const travelRoutes = require("./routes/travel.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Middlewares globales
app.use(helmet());          // cabeceras HTTP de seguridad
app.use(morgan("dev"));     // log de cada petición (en vez de console.log)
app.use(cors());            // permite peticiones desde el frontend
app.use(express.json());    // entiende cuerpos JSON

// Ruta de salud (comprueba que la API responde)
app.get("/", (req, res) => {
  res.json({ ok: true, mensaje: "API de Vagamundo en funcionamiento" });
});

// Antes de cualquier ruta que use la base de datos, nos aseguramos de que la
// conexión está lista. En entornos serverless (Vercel) cada petición puede
// arrancar una instancia nueva, y si no se espera aquí Mongoose encola la
// consulta y acaba fallando con "buffering timed out".
// connectDB reutiliza la conexión si ya está abierta, así que no reconecta.
app.use(async (req, res, next) => {
  try {
    await connectDB(process.env.MONGODB_URI);
    next();
  } catch (err) {
    next(err);
  }
});

// Rutas de la API
app.use("/api/travels", travelRoutes);

// Middlewares de error (SIEMPRE al final, después de las rutas)
app.use(notFound);      // 404 -> ruta no encontrada
app.use(errorHandler);  // 500 -> gestor central de errores

module.exports = app;

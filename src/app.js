const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const debug = require("debug")("vagamundo:app");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const travelRoutes = require("./routes/travel.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const bookingRoutes = require("./routes/booking.routes");
const statsRoutes = require("./routes/stats.routes");
const notFound = require("./middlewares/not-found");
const errorHandler = require("./middlewares/error-handler");

const app = express();

// Middlewares globales
app.use(helmet()); // cabeceras HTTP de seguridad
app.use(morgan("dev")); // log de cada petición (en vez de console.log)

// CORS_ORIGIN admite varias direcciones separadas por comas: la de local y la
// del frontend desplegado. Si llega vacío, cors() no añade ninguna cabecera y
// el navegador bloquea todo, así que aviso por consola en vez de dejarlo pasar
// en silencio.
const origenes = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((uno) => uno.trim())
  .filter(Boolean);

if (origenes.length === 0) {
  debug("Falta CORS_ORIGIN: la API queda abierta a cualquier origen.");
}

app.use(cors({ origin: origenes.length > 0 ? origenes : "*" }));

// Las fotografías del diario viajan en Base64 dentro del JSON, que ocupa más
// que el archivo original. El límite por defecto de Express son 100 kB y se
// quedaba corto.
app.use(express.json({ limit: "2mb" }));

// Ruta de salud: comprueba que la API responde y a propósito no toca la base
// de datos, así se distingue «la API no contesta» de «contesta pero no llega
// a Mongo».
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
app.use("/api/auth", authRoutes);
app.use("/api/travels", travelRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/stats", statsRoutes);

// Middlewares de error (SIEMPRE al final, después de las rutas)
app.use(notFound); // 404 -> ruta no encontrada
app.use(errorHandler); // 500 -> gestor central de errores

module.exports = app;

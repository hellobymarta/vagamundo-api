// Punto de entrada de la API.
// - En local: conecta a la base de datos y arranca el servidor.
// - En Vercel: se reutiliza el export `app` (entorno serverless).
require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

// Inicia la conexión a MongoDB Atlas (se reutiliza la conexión si ya existe).
connectDB(process.env.MONGODB_URI).catch((err) =>
  console.error("Error de conexión a MongoDB:", err.message)
);

// Solo arranca el servidor cuando se ejecuta directamente (npm start / npm run dev).
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
}

module.exports = app;

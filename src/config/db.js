const mongoose = require("mongoose");

// Conecta a MongoDB Atlas. Reutiliza la conexión si ya está abierta
// (importante en entornos serverless como Vercel).
async function connectDB(uri) {
  if (!uri) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection; // ya conectado
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("Conectado a MongoDB Atlas");
  return mongoose.connection;
}

module.exports = connectDB;

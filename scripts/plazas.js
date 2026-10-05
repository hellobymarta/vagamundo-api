// Deja escritas las plazas de todas las salidas.
//
// Siete viejos del catálogo se crearon antes de que el esquema tuviera el
// campo `plazas`, así que su documento no lo guarda. La API contesta ocho
// igualmente, porque Mongoose aplica el valor por defecto al leer, pero en
// la base esos viajes están incompletos: se ve en la copia que genera
// `npm run exportar`, y si algún día cambiara el valor por defecto
// cambiarían ellos solos sin que nadie lo haya decidido.
//
// Esto escribe el ocho donde falta. No toca los viajes que ya lo tienen.
//
//   npm run plazas

require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../src/config/db");
const Travel = require("../src/models/travel.model");

// El máximo con el que trabajamos, el mismo que dice la web de principio a
// fin y el mismo que valida el esquema.
const PLAZAS = 8;

async function ponerPlazas() {
  await connectDB(process.env.MONGODB_URI);

  // lean() para ver el documento tal y como está guardado: con un documento
  // normal, Mongoose rellenaría el campo por defecto y no se notaría cuál
  // lo tiene de verdad.
  const viajes = await Travel.find().lean();
  const faltan = viajes.filter((viaje) => viaje.plazas === undefined);

  if (faltan.length === 0) {
    process.stdout.write("Los trece viajes ya tienen sus plazas guardadas.\n");
    return;
  }

  for (const { _id, nombre } of faltan) {
    await Travel.updateOne({ _id }, { $set: { plazas: PLAZAS } });
    process.stdout.write(`"${nombre}" -> ${PLAZAS} plazas\n`);
  }

  process.stdout.write(`\n${faltan.length} viajes arreglados, ${viajes.length - faltan.length} ya estaban bien.\n`);
}

ponerPlazas()
  .catch((err) => {
    process.stderr.write(`No ha salido bien: ${err.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

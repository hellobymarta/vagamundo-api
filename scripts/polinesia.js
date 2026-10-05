// Publica el viaje de la Polinesia Francesa y le cuadra la descripción.
//
// Dos cosas que se habían quedado a medias:
//
//  1. El viaje estaba con `disponible: false`, así que su ficha enseñaba
//     «Plazas agotadas» en lugar del formulario de reserva.
//  2. La descripción decía «cuatro islas» y el itinerario recorre seis:
//     Tahití el primer día, Moorea el segundo y el tercero, Huahine el cuarto
//     y el quinto, Raiatea y Taha'a el quinto y el sexto, y Fakarava del
//     séptimo al noveno.
//
// Se puede ejecutar más de una vez.
//
//   npm run polinesia

require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../src/config/db");
const Travel = require("../src/models/travel.model");

const NOMBRE = "Polinesia Francesa: un paraíso remoto";

const DESCRIPCION =
  "Nueve días y seis islas, de Moorea a las Tuamotu: los marae de Taputapuatea al atardecer, " +
  "la vainilla y las perlas de Taha’a, y el paso sur de Fakarava, donde el CNRS ha contado cerca " +
  "de setecientos tiburones grises en un kilómetro de canal.";

async function publicar() {
  await connectDB(process.env.MONGODB_URI);

  const viaje = await Travel.findOne({ nombre: NOMBRE });

  if (!viaje) {
    process.stdout.write(`No encuentro el viaje "${NOMBRE}".\n`);
    return;
  }

  viaje.disponible = true;
  viaje.descripcion = DESCRIPCION;

  await viaje.save();

  process.stdout.write(`"${NOMBRE}": publicado y con la descripción corregida a seis islas.\n`);
}

publicar()
  .catch((err) => {
    process.stderr.write(`No ha salido bien: ${err.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

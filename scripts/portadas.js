// Pone la fotografía de portada a los viajes que se quedaron sin ella.
//
// Tres viajes del catálogo no guardan el campo `imagen`, así que su ficha
// enseña la fotografía genérica del país. Las fotos ya están en la web, en
// PEC4/public, y lo único que falta es dejar la ruta escrita en la base de
// datos. Esto hace lo mismo que entrar en «Editar viaje» y pegarla a mano,
// pero sin equivocarse al teclear.
//
// Solo escribe en los viajes que siguen sin imagen: si ya le has puesto una,
// la respeta y lo dice.
//
//   npm run portadas

require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../src/config/db");
const Travel = require("../src/models/travel.model");

const PORTADAS = [
  { nombre: "Atenas, Milos y Santorini", imagen: "/grecia/grecia-santorini.jpg" },
  { nombre: "Nueva York, Washington, Miami y Los Ángeles", imagen: "/estados-unidos/miami-playa.jpg" },
  { nombre: "Turquía de punta a punta", imagen: "/turquia/estambul-noche.jpg" },
];

async function ponerPortadas() {
  await connectDB(process.env.MONGODB_URI);

  for (const { nombre, imagen } of PORTADAS) {
    const viaje = await Travel.findOne({ nombre });

    if (!viaje) {
      process.stdout.write(`No encuentro el viaje "${nombre}".\n`);
      continue;
    }

    if (viaje.imagen) {
      process.stdout.write(`"${nombre}" ya tiene portada (${viaje.imagen}), no la toco.\n`);
      continue;
    }

    viaje.imagen = imagen;
    await viaje.save();

    process.stdout.write(`"${nombre}" -> ${imagen}\n`);
  }
}

ponerPortadas()
  .catch((err) => {
    process.stderr.write(`No ha salido bien: ${err.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

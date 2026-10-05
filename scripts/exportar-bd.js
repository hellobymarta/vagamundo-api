// Saca una copia de la base de datos en archivos JSON, uno por colección, para
// que el proyecto se pueda probar en local sin tener que crear los datos a
// mano. Se guarda en la carpeta copia-bd.
//
//   npm run exportar

require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const mongoose = require("mongoose");

const connectDB = require("../src/config/db");

const DESTINO = path.join(__dirname, "..", "copia-bd");

// Las colecciones del proyecto, las mismas que declaran los modelos. Se
// nombran aquí y no se recorre la base entera porque el clúster arrastra
// colecciones de versiones anteriores de la PEC 3 («users», «travels»), y una
// copia de entrega tiene que llevar lo que usa la aplicación de ahora.
const COLECCIONES = ["usuarios", "viajes", "cronicas", "comentarios", "reservas"];

async function exportar() {
  await connectDB(process.env.MONGODB_URI);
  await fs.mkdir(DESTINO, { recursive: true });

  const enLaBase = (await mongoose.connection.db.listCollections().toArray()).map(
    ({ name }) => name
  );

  const sobran = enLaBase.filter((name) => !COLECCIONES.includes(name));

  for (const name of COLECCIONES) {
    const documentos = await mongoose.connection.db.collection(name).find().toArray();

    // La contraseña, aunque esté cifrada, no tiene por qué viajar en una copia
    // que se entrega: en su lugar queda la que crea el script de siembra.
    const limpios = documentos.map(({ password, ...resto }) => resto);

    await fs.writeFile(
      path.join(DESTINO, `${name}.json`),
      `${JSON.stringify(limpios, null, 2)}\n`,
      "utf8"
    );

    process.stdout.write(`${name}: ${documentos.length} documentos\n`);
  }

  if (sobran.length > 0) {
    process.stdout.write(
      `\nFuera de la copia, por no ser del proyecto: ${sobran.join(", ")}\n`
    );
  }

  process.stdout.write(`\nCopia guardada en ${path.relative(process.cwd(), DESTINO)}\n`);
}

exportar()
  .catch((err) => {
    process.stderr.write(`No ha salido bien: ${err.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

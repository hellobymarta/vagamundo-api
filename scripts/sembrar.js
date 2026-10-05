// Deja la base de datos lista para que se pueda probar el proyecto: tres
// cuentas de acceso, cuatro crónicas con su fotografía y un par de reservas.
// Lo que ya existe no se toca, así que se puede ejecutar más de una vez.
//
//   npm run sembrar

require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const mongoose = require("mongoose");

const connectDB = require("../src/config/db");
const User = require("../src/models/user.model");
const Travel = require("../src/models/travel.model");
const Post = require("../src/models/post.model");
const Comment = require("../src/models/comment.model");
const Booking = require("../src/models/booking.model");

const CARPETA_FOTOS = path.join(__dirname, "semilla");

// Las tres cuentas que pide el enunciado para poder revisar el proyecto.
const CUENTAS = [
  { nombre: "Marta Alarcón", email: "marta@vagamundo.es", password: "vagamundo2026", rol: "admin" },
  { nombre: "Nerea Ortiz", email: "nerea@vagamundo.es", password: "vagamundo2026", rol: "editor" },
  { nombre: "Lucía Ferrer", email: "lucia@vagamundo.es", password: "vagamundo2026", rol: "editor" },
];

const CRONICAS = [
  {
    titulo: "Kirkjufell, la montaña que sale en todas las fotos",
    destino: "Islandia",
    archivo: "islandia-kirkjufell.jpg",
    contenido:
      "Llegamos a Grundarfjördur con la idea de hacer la foto de siempre y nos quedamos tres horas. " +
      "La montaña cambia de color cada vez que se mueve una nube, y detrás, las cascadas bajan tan " +
      "cerca del camino que se oyen antes de verlas. Si vais, dejad el coche en el aparcamiento de " +
      "abajo y subid andando: el mejor ángulo no es el del cartel.",
    comentarios: ["Estuvimos en marzo y había nieve hasta el sendero. Merece la pena ir con botas."],
  },
  {
    titulo: "Kioto en abril, entre templos y gente",
    destino: "Japón",
    archivo: "japon-kioto.jpg",
    contenido:
      "Abril en Kioto es precioso y está llenísimo, las dos cosas a la vez. Lo que nos salvó fue " +
      "madrugar: a las siete de la mañana los templos del este están casi vacíos y se puede andar " +
      "por Higashiyama sin esquivar a nadie. A mediodía nos íbamos al norte, que está mucho más " +
      "tranquilo, y volvíamos al atardecer.",
    comentarios: [
      "Lo de madrugar es el mejor consejo que he leído de Kioto.",
      "Nosotros fuimos en noviembre y los arces compensan de sobra el no ver cerezos.",
    ],
  },
  {
    titulo: "Ajloun, el castillo del que nadie habla",
    destino: "Jordania",
    archivo: "jordania-ajloun.jpg",
    contenido:
      "Todo el mundo va a Petra y a Wadi Rum, y hace bien, pero el norte de Jordania tiene un " +
      "castillo del siglo XII en lo alto de una colina desde el que se ve el valle entero. Fuimos un " +
      "martes por la mañana y estábamos nosotros y el señor de la entrada. Se tarda una hora desde " +
      "Ammán y cabe perfectamente en una mañana.",
    comentarios: ["Apuntado para el próximo viaje, no lo tenía ni en la lista."],
  },
  {
    titulo: "Diamond Beach y los icebergs que se escapan al mar",
    destino: "Islandia",
    archivo: "islandia-diamond.jpg",
    contenido:
      "Enfrente de la laguna de Jökulsárlón hay una playa de arena negra donde acaban los trozos de " +
      "hielo que la corriente arrastra. Con el sol bajo parecen cristales. Hay que tener cuidado con " +
      "las olas, que suben mucho más de lo que parece, y no subirse a los bloques por muy quietos " +
      "que estén.",
    comentarios: [],
  },
];

// Convierte la fotografía a Base64, que es como la guarda la aplicación cuando
// se sube desde el formulario.
async function enBase64(archivo) {
  const datos = await fs.readFile(path.join(CARPETA_FOTOS, archivo));
  return `data:image/jpeg;base64,${datos.toString("base64")}`;
}

async function sembrar() {
  await connectDB(process.env.MONGODB_URI);

  const usuarios = [];

  for (const cuenta of CUENTAS) {
    const existente = await User.findOne({ email: cuenta.email });
    usuarios.push(existente || (await User.create(cuenta)));
  }

  process.stdout.write(`Cuentas disponibles: ${usuarios.length}\n`);

  if ((await Post.countDocuments()) === 0) {
    for (const [posicion, cronica] of CRONICAS.entries()) {
      const autor = usuarios[posicion % usuarios.length];

      const post = await Post.create({
        titulo: cronica.titulo,
        destino: cronica.destino,
        contenido: cronica.contenido,
        imagen: await enBase64(cronica.archivo),
        autor: autor._id,
      });

      for (const [vuelta, texto] of cronica.comentarios.entries()) {
        await Comment.create({
          texto,
          post: post._id,
          autor: usuarios[(posicion + vuelta + 1) % usuarios.length]._id,
        });
      }
    }

    process.stdout.write(`Crónicas añadidas: ${CRONICAS.length}\n`);
  } else {
    process.stdout.write("Ya había crónicas, no añado ninguna.\n");
  }

  if ((await Booking.countDocuments()) === 0) {
    const viajes = await Travel.find().limit(2);

    for (const [posicion, viaje] of viajes.entries()) {
      await Booking.create({
        viaje: viaje._id,
        usuario: usuarios[posicion % usuarios.length]._id,
        personas: posicion + 2,
        estado: "confirmada",
        notas: "Reserva de ejemplo para ver el panel con datos.",
      });
    }

    process.stdout.write(`Reservas añadidas: ${viajes.length}\n`);
  } else {
    process.stdout.write("Ya había reservas, no añado ninguna.\n");
  }

  process.stdout.write(`Viajes en el catálogo: ${await Travel.countDocuments()}\n`);
}

sembrar()
  .catch((err) => {
    process.stderr.write(`No ha salido bien: ${err.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

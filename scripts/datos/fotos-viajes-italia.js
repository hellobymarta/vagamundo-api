/*
 * Una fotografía propia para cada viaje italiano.
 *
 *     cd ~/Documents/"FULL JUNIO 2026 old "/PEC3
 *     node fotos-viajes-italia.js
 *
 * Los tres viajes italianos tienen el campo `imagen` vacío, así que en el
 * catálogo los tres caían en la foto de reserva del destino y salían
 * exactamente iguales. Aquí se le pone a cada uno la suya.
 *
 * Las rutas son las de la carpeta public/ del frontend.
 */

require('dotenv').config()
const mongoose = require('mongoose')

const FOTOS = [
  { nombre: 'Retiro en la costa amalfitana', imagen: '/italia-amalfi/amalfi-mar.jpg' },
  {
    nombre: 'Cinque Terre y el golfo de los Poetas',
    imagen: '/italia-amalfi/cinqueterre-riomaggiore.jpg',
  },
  { nombre: 'La Toscana, de Florencia a Siena', imagen: '/toscana/florencia.jpg' },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en el .env')

  await mongoose.connect(uri)
  const viajes = mongoose.connection.collection('viajes')

  for (const { nombre, imagen } of FOTOS) {
    const res = await viajes.updateOne({ nombre }, { $set: { imagen } })
    console.log(
      res.matchedCount === 0
        ? `· ${nombre}: no está en la base de datos`
        : `· ${nombre} -> ${imagen}`,
    )
  }

  console.log('\n--- FOTOGRAFÍA DE CADA VIAJE ---')
  const todos = await viajes.find({}).sort({ destino: 1 }).toArray()
  todos.forEach((v) =>
    console.log(
      [v.destino.padEnd(19), String(v.nombre || '').slice(0, 38).padEnd(40), v.imagen || '(la del destino)'].join(' '),
    ),
  )

  const italianos = todos.filter((v) => v.destino === 'Italia').map((v) => v.imagen)
  console.log(
    '\n' +
      (new Set(italianos).size === italianos.length && italianos.every(Boolean)
        ? 'Los viajes de Italia llevan tres fotografías distintas: correcto.'
        : 'Cuidado: siguen repitiéndose o falta alguna.'),
  )

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

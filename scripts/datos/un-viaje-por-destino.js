/*
 * Un solo viaje por destino: quita las propuestas cortas de Turquía y de
 * Estados Unidos, y deja las largas, que son las que cubre la página de
 * cada país.
 *
 *     cd ~/Documents/"FULL JUNIO 2026 old "/PEC3
 *     node un-viaje-por-destino.js
 *
 * Se queda:  Turquía de punta a punta (12 días)
 *            Nueva York, Washington, Miami y Los Ángeles (14 días)
 *
 * Antes de borrar imprime cada viaje entero, para poder recuperarlo si
 * hiciera falta. No toca ningún otro viaje.
 */

require('dotenv').config()
const mongoose = require('mongoose')

const FUERA = [
  { destino: 'Turquía', nombre: 'Estambul, Capadocia y el Egeo' },
  { destino: 'Estados Unidos', nombre: 'Nueva York, de punta a punta' },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en el .env')

  await mongoose.connect(uri)
  const viajes = mongoose.connection.collection('viajes')

  for (const filtro of FUERA) {
    const viaje = await viajes.findOne(filtro)

    if (!viaje) {
      console.log(`· ${filtro.nombre}: no está en la base de datos`)
      continue
    }

    console.log(`\n--- COPIA DE SEGURIDAD · ${filtro.nombre} ---`)
    console.log(JSON.stringify(viaje, null, 2))

    const res = await viajes.deleteOne(filtro)
    console.log(`\n· ${filtro.nombre}: borrados ${res.deletedCount}`)
  }

  console.log('\n--- CATÁLOGO COMPLETO ---')
  const todos = await viajes.find({}).sort({ destino: 1 }).toArray()
  todos.forEach((v) =>
    console.log(
      [
        v.destino.padEnd(19),
        String(v.nombre || '').slice(0, 38).padEnd(40),
        String(v.categoria || '?').padEnd(10),
        `${v.duracionDias}d`.padEnd(5),
        `${v.precio} €`.padEnd(9),
        v.disponible ? 'abierto' : 'agotado',
      ].join(' '),
    ),
  )

  const porDestino = {}
  todos.forEach((v) => {
    porDestino[v.destino] = (porDestino[v.destino] || 0) + 1
  })
  const repetidos = Object.entries(porDestino).filter(([, n]) => n > 1)

  console.log(`\nTOTAL: ${todos.length} viajes`)
  console.log(
    repetidos.length === 0
      ? 'Un viaje por destino: correcto.'
      : `Destinos con más de un viaje: ${repetidos.map(([d, n]) => `${d} (${n})`).join(', ')}`,
  )

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

/*
 * Los tres viajes italianos cuelgan de un solo destino: Italia.
 *
 *     cd ~/Documents/"FULL JUNIO 2026 old "/PEC3
 *     node italia-un-destino.js
 *
 * Toscana y Cinque Terre dejan de ser destinos propios en la web, así que el
 * campo `destino` de esos viajes pasa a decir «Italia», que es la página a la
 * que tienen que ir. No toca nada más.
 */

require('dotenv').config()
const mongoose = require('mongoose')

const A_ITALIA = [
  'La Toscana, de Florencia a Siena',
  'Cinque Terre y el golfo de los Poetas',
  'Retiro en la costa amalfitana',
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en el .env')

  await mongoose.connect(uri)
  const viajes = mongoose.connection.collection('viajes')

  for (const nombre of A_ITALIA) {
    const res = await viajes.updateOne({ nombre }, { $set: { destino: 'Italia' } })
    console.log(
      res.matchedCount === 0
        ? `· ${nombre}: no está en la base de datos`
        : `· ${nombre}: destino Italia (modificados: ${res.modifiedCount})`,
    )
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

  console.log(`\nTOTAL: ${todos.length} viajes en ${Object.keys(porDestino).length} destinos`)
  Object.entries(porDestino)
    .filter(([, n]) => n > 1)
    .forEach(([d, n]) => console.log(`  ${d}: ${n} viajes`))

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

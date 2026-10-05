/*
 * Quita del catálogo el viaje griego antiguo, «Atenas y las Cícladas».
 *
 *     cd ~/Documents/"FULL JUNIO 2026 old "/PEC3
 *     node quitar-grecia-viejo.js
 *
 * Antes de borrarlo lo imprime entero, para poder recuperarlo si hiciera
 * falta. No toca ningún otro viaje. Al final enseña el catálogo completo.
 */

require('dotenv').config()
const mongoose = require('mongoose')

const FILTRO = { destino: 'Grecia', nombre: 'Atenas y las Cícladas' }

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en el .env')

  await mongoose.connect(uri)
  const viajes = mongoose.connection.collection('viajes')

  const viaje = await viajes.findOne(FILTRO)

  if (!viaje) {
    console.log('No está en la base de datos: no hay nada que quitar.')
  } else {
    console.log('--- COPIA DE SEGURIDAD, POR SI HAY QUE VOLVER ATRÁS ---')
    console.log(JSON.stringify(viaje, null, 2))
    const res = await viajes.deleteOne(FILTRO)
    console.log(`\nBorrados: ${res.deletedCount}`)
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
  console.log(`\nTOTAL: ${todos.length} viajes`)

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

/*
 * Islandia deja de ser la caza de la aurora y pasa a ser la vuelta a la isla.
 *
 *     cd ~/Documents/"FULL JUNIO 2026 old "/PEC3
 *     node islandia-vuelta.js
 *
 * Cambia el nombre, la descripción y el itinerario del viaje de Islandia.
 * Busca por el nombre antiguo, así que solo hace falta ejecutarlo una vez.
 *
 * El día 8 va en avión de Akureyri a Reikiavik en vez de por carretera: por
 * tierra son unos 400 kilómetros y casi cinco horas, que es la etapa más
 * larga del viaje con diferencia y se come la tarde de Snæfellsnes.
 */

require('dotenv').config()
const mongoose = require('mongoose')

const NOMBRE_VIEJO = 'Islandia, a la caza de la aurora'

const VIAJE = {
  nombre: 'Islandia, la vuelta a la isla',
  categoria: 'naturaleza',
  precio: 3480,
  duracionDias: 9,
  disponible: true,
  descripcion:
    'La vuelta entera por la carretera de circunvalación en septiembre, cuando los fiordos del este siguen abiertos y ya oscurece lo bastante para que salga la aurora. Nueve días con Snæfellsnes al final, y el tramo largo del norte en avión y no en carretera.',
  itinerario: [
    'Día 1 · Llegada a Reikiavik y tarde a pie por el centro: la Hallgrímskirkja, cuya fachada son las columnas de basalto de Svartifoss llevadas a hormigón, el Harpa junto al agua y el puerto viejo. Se cena pescado del día y se duerme en la ciudad.',
    'Día 2 · Círculo Dorado. Þingvellir a primera hora, andando por dentro de la falla de Almannagjá, donde se reunía el Althingi desde el año 930. Después el área geotérmica de Geysir, con Strokkur reventando cada pocos minutos, y Gullfoss, dos saltos de once y veintiún metros metiéndose en una grieta de treinta y dos. Parada en el cráter de Kerið, que es de camino, y noche en la zona de Hella.',
    'Día 3 · La costa sur entera. Seljalandsfoss, que se rodea por detrás, y Gljúfrabúi escondido en su grieta a doscientos metros. Skógafoss, con los 527 escalones al mirador de arriba, y Kvernufoss al lado, que casi nadie busca. Por la tarde, el promontorio de Dyrhólaey y la playa negra de Reynisfjara, con la advertencia de siempre: no se da la espalda al agua. Noche en Vík.',
    'Día 4 · El cañón de Fjaðrárgljúfur de mañana temprano y entrada en el Parque Nacional Vatnajökull, Patrimonio Mundial desde 2019. Desde Skaftafell se sube andando a Svartifoss, la cascada negra de las columnas hexagonales, hora y media ida y vuelta. Por la tarde, la laguna glaciar de Jökulsárlón en lancha entre los bloques de hielo, y enfrente, cruzando la carretera, la playa de los diamantes. Noche cerca de Höfn.',
    'Día 5 · Los fiordos del este, que es el día de conducir despacio. La carretera va bordeando uno detrás de otro, con parada en Djúpivogur y en Breiðdalsvík, y un desvío a Seyðisfjörður, al final de un fiordo de diecisiete kilómetros, con su iglesia azul y la calle pintada delante. Noche en Egilsstaðir. No se llena el día de paradas a propósito: aquí la carretera es el viaje.',
    'Día 6 · El lago Mývatn y lo que tiene alrededor: las fumarolas y la tierra ocre de Hverir, las formaciones de lava de Dimmuborgir y la cueva de Grjótagjá. Se cierra el día en los baños naturales, con la norma islandesa de la ducha completa antes de entrar. Noche junto al lago.',
    'Día 7 · Goðafoss de camino al oeste, la cascada donde la saga cuenta que se tiraron las figuras de los antiguos dioses después del Althingi del año 1000. Akureyri por la tarde, al fondo del fiordo más largo del país, con su jardín botánico a menos de cien kilómetros del círculo polar. Quien quiera sube a Húsavík a ver ballenas, que en septiembre todavía salen los barcos. Noche en Akureyri.',
    'Día 8 · Vuelo interno de Akureyri a Reikiavik a primera hora: por carretera son unos cuatrocientos kilómetros y casi cinco horas, y ese día se iría entero en conducir. Desde Reikiavik se sale a la península de Snæfellsnes, a dos horas largas, y queda la tarde completa para Kirkjufell y los saltos de Kirkjufellsfoss que tiene enfrente. Noche en la península.',
    'Día 9 · Snæfellsnes de mañana: Arnarstapi, el arco de Gatklettur y el sendero de la costa hasta Hellnar, dos kilómetros y medio por el borde con el Snæfellsjökull detrás. Regreso a Reikiavik, tiempo libre en la ciudad y, si el vuelo lo permite, un último baño en el Sky Lagoon antes de ir al aeropuerto.',
  ].join('\n'),
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en el .env')

  await mongoose.connect(uri)
  const viajes = mongoose.connection.collection('viajes')

  const res = await viajes.updateOne(
    { $or: [{ nombre: NOMBRE_VIEJO }, { nombre: VIAJE.nombre }] },
    { $set: VIAJE },
  )

  console.log(
    res.matchedCount === 0
      ? 'No encuentro el viaje de Islandia en la base de datos.'
      : `«${VIAJE.nombre}»: actualizado (modificados: ${res.modifiedCount}).`,
  )

  const islandia = await viajes.findOne({ nombre: VIAJE.nombre })
  if (islandia) {
    console.log(`\nDías escritos: ${String(islandia.itinerario || '').split('\n').filter(Boolean).length}`)
  }

  console.log('\n--- CATÁLOGO COMPLETO ---')
  const todos = await viajes.find({}).sort({ destino: 1 }).toArray()
  todos.forEach((v) =>
    console.log(
      [
        v.destino.padEnd(19),
        String(v.nombre || '').slice(0, 38).padEnd(40),
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

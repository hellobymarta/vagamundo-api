/*
 * Jordania, replanteada: se descarga el día 4 y Petra by Night deja de ser
 * una lotería.
 *
 *     cd ~/Documents/"FULL JUNIO 2026 old "/PEC3
 *     node jordania-itinerario.js
 *
 * Dos cambios de fondo respecto al recorrido anterior:
 *
 *  · Se duerme en Dana. El día que juntaba el Mar Muerto por la mañana, dos
 *    horas y media de carretera, un sendero y Little Petra antes de cenar era
 *    el más cargado del viaje, y encima el único con paisaje. Ahora se parte
 *    en dos: se llega a Dana a media tarde y se duerme allí.
 *
 *  · Petra by Night pasa a la noche del día 5, la víspera del día completo en
 *    Petra. Se celebra de domingo a jueves, a las 20:30 desde el centro de
 *    visitantes, así que con salida en domingo el día 5 cae en jueves y
 *    siempre hay. Saliendo lunes o martes caería en viernes o sábado, que son
 *    las dos noches que no funciona.
 */

require('dotenv').config()
const mongoose = require('mongoose')

const NOMBRE = 'Jordania, el desierto por dentro'

const ITINERARIO = [
  'Día 1 · Llegada a Amán y tarde en la Ciudadela, sobre la colina más alta de la ciudad: las columnas del templo de Hércules, con la mano de mármol que es lo único que queda de su estatua, y el palacio omeya. Se baja andando al Teatro Romano, excavado en la ladera para seis mil personas, y se cena en el centro, entre Rainbow Street y el zoco.',
  'Día 2 · Jerash, que es de las ciudades romanas mejor conservadas de Oriente Medio y no un puñado de piedras sueltas: se entra por el arco de Adriano, levantado para su visita del año 129, y se sigue por la plaza Oval con sus columnas en herradura, el Cardo Máximo con las rodadas de los carros todavía marcadas, el templo de Artemisa y el teatro sur. Por la tarde, el castillo de Ajloun, que mandó levantar en 1184 un comandante de Saladino para vigilar las rutas del hierro. Vuelta a Amán.',
  'Día 3 · Madaba y la iglesia de San Jorge, donde está el mapa en mosaico del siglo VI: la representación cartográfica más antigua que se conserva de Tierra Santa, con Jerusalén en el centro y sus calles reconocibles. Después el monte Nebo, desde donde la tradición dice que Moisés vio la tierra prometida y desde donde se ve de verdad el valle del Jordán entero. Bajada al mar Muerto, a cuatrocientos treinta metros bajo el nivel del mar, que es el punto más bajo de tierra firme del planeta. El baño, al final de la tarde. Noche allí.',
  'Día 4 · Día corto a propósito, porque el siguiente no lo es. Un último baño temprano y salida hacia el sur, subiendo de la depresión a la meseta, hasta la Reserva de la Biosfera de Dana, la mayor reserva natural del país, que baja desde los mil quinientos metros hasta el desierto y por eso tiene cuatro pisos de vegetación distintos. Llegada a media tarde y sendero corto por el borde del valle con la luz cayendo. Noche en Dana.',
  'Día 5 · Sendero de mañana con guía local por el Wadi Dana, que es la parte que casi ningún grupo hace porque no cabe en el día. A mediodía, traslado a Little Petra, el Siq al-Barid: un cañón de cuatro metros de ancho con sus comedores tallados y el techo pintado que queda en uno de ellos, de lo poco que se conserva de la pintura nabatea. Tarde tranquila en Wadi Musa y, a las ocho y media, Petra by Night: el Siq y el Tesoro alumbrados con velas, desde el centro de visitantes.',
  'Día 6 · Petra, el día entero y sin prisa. El Siq, con el canal de agua tallado a media altura que abastecía la ciudad, el Tesoro, la calle de las Fachadas, el teatro excavado en la roca, las Tumbas Reales y la Columnata. Y por la tarde, quien quiera, los ochocientos escalones al Monasterio, que es más grande que el Tesoro y tiene mucha menos gente. Segunda noche en Wadi Musa.',
  'Día 7 · Salida a Wadi Rum y entrada en el desierto en 4x4 con conductores beduinos de la zona: el manantial de Lawrence, el cañón de Khazali con sus inscripciones nabateas y tamúdicas, las dunas rojas y los puentes naturales de roca. Se para a esperar la puesta de sol desde una duna y se duerme en campamento, con el cielo que hay cuando no hay una sola luz alrededor.',
  'Día 8 · Amanecer en el desierto, que es la media hora por la que merece la pena dormir allí, y desayuno sin prisa. Traslado a Aqaba, a una hora, y baño en el mar Rojo: los arrecifes están a pocos metros de la orilla y se ven con tubo, sin necesidad de botella. Comida frente al agua y salida.',
].join('\n')

const DESCRIPCION =
  'Ocho días de Amán a Aqaba, con Jerash y el mar Muerto al principio, una noche en la reserva de Dana, un día entero en Petra y dos noches de desierto en Wadi Rum. Entramos en Petra dos veces, una de ellas de noche.'

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en el .env')

  await mongoose.connect(uri)
  const viajes = mongoose.connection.collection('viajes')

  const res = await viajes.updateOne(
    { nombre: NOMBRE },
    { $set: { descripcion: DESCRIPCION, itinerario: ITINERARIO, duracionDias: 8 } },
  )

  console.log(
    res.matchedCount === 0
      ? `No encuentro «${NOMBRE}» en la base de datos.`
      : `«${NOMBRE}»: itinerario actualizado (modificados: ${res.modifiedCount}).`,
  )

  const jordania = await viajes.findOne({ nombre: NOMBRE })
  if (jordania) {
    const dias = String(jordania.itinerario || '').split('\n').filter(Boolean)
    console.log(`\nDías escritos: ${dias.length}`)
    dias.forEach((d) => console.log('  ' + d.slice(0, 90) + '…'))
  }

  await mongoose.disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

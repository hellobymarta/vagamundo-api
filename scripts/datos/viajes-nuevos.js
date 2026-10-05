/*
 * Alta de los tres viajes que faltaban en el catálogo: Grecia, Turquía y
 * Estados Unidos. Y, al final, un listado de todo lo que hay en la base de
 * datos para comprobar de un vistazo que no falta nada.
 *
 *     cd ~/Documents/"FULL JUNIO 2026 old "/PEC3
 *     node viajes-nuevos.js
 *
 * Es idempotente: busca por "destino" y, si el viaje ya existe, lo actualiza
 * en vez de crear uno repetido. No borra nada.
 */

require('dotenv').config()
const mongoose = require('mongoose')

const VIAJES = [
  {
    destino: 'Grecia',
    nombre: 'Atenas y las Cícladas',
    categoria: 'islas',
    precio: 2650,
    duracionDias: 8,
    disponible: true,
    descripcion:
      'Tres días de piedra en Atenas y cinco de isla en isla por el Egeo, en el barco de línea y no en excursión. Se empieza por el Partenón a la hora de apertura y se acaba en una cala de Naxos a la que no llega la carretera.',
    itinerario: [
      'Día 1 · Llegada a Atenas y tarde en Plaka y Anafiotika, el barrio que levantaron los canteros de Naxos al pie de la Acrópolis. Cena de mezedes en Psyrri.',
      'Día 2 · Acrópolis a la apertura, a las ocho, cuando el mármol todavía está frío: Partenón, Erecteión y sus cariátides, y el Odeón de Herodes Ático. Por la tarde, el Museo de la Acrópolis, donde están cinco de las seis cariátides originales, y el Museo de Arte Cicládico, que es la mejor entrada a lo que vamos a ver después.',
      'Día 3 · Mañana en el mercado de Varvakios y el Museo Arqueológico Nacional, con el mecanismo de Anticitera y las máscaras de Micenas. Tarde de excursión a Cabo Sunion, a 70 kilómetros por la costa, para ver el atardecer desde el templo de Poseidón.',
      'Día 4 · Ferry a Míkonos desde Rafina, unas dos horas y media. Tarde a pie por la Chora: la Pequeña Venecia, con los balcones colgados sobre el agua, y los molinos de Kato Mili, que molieron grano para los barcos hasta bien entrado el siglo XX. El callejero se trazó para despistar a los piratas y sigue funcionando.',
      'Día 5 · Delos por la mañana, en caique, treinta minutos de travesía. Es Patrimonio Mundial desde 1990 y no vive nadie en ella: fue santuario de Apolo desde al menos el siglo IX antes de Cristo y después puerto franco del Egeo. Tres horas con arqueóloga, que es lo que pide el sitio. Tarde libre en una cala del sur.',
      'Día 6 · Ferry a Naxos, una hora. La Portara, el marco de mármol del templo de Apolo que Lígdamis empezó hacia el 530 antes de Cristo y nunca terminó, y el casco viejo con el castillo del ducado veneciano que fundó Marco Sanudo en 1207.',
      'Día 7 · Naxos por dentro: las aldeas de Halki y Apiranthos, una destilería de kitron, los talleres de mármol de Kinidaros y el kouros inacabado de Flerio, tumbado en la ladera desde hace veintiséis siglos. Baño de tarde en Plaka o en Alyko.',
      'Día 8 · Ferry rápido a El Pireo y vuelo de regreso desde Atenas.',
    ].join('\n'),
  },
  {
    destino: 'Turquía',
    nombre: 'Estambul, Capadocia y el Egeo',
    categoria: 'cultural',
    precio: 2890,
    duracionDias: 8,
    disponible: true,
    descripcion:
      'Ocho días en los que se vuela lo que otros hacen en autocar. Tres en Estambul, dos en Capadocia y dos en el Egeo, y ni un solo día perdido en una etapa de seiscientos kilómetros por carretera.',
    itinerario: [
      'Día 1 · Llegada a Estambul y primera tarde en Sultanahmet: Santa Sofía, levantada entre 532 y 537 por dos matemáticos, y la Cisterna Basílica, con sus 336 columnas reaprovechadas de edificios griegos y romanos. Cena de pescado en Kumkapı.',
      'Día 2 · Mañana en Topkapi, que no es un palacio sino una ciudad de patios, y en la Mezquita Azul, con sus veinte mil azulejos de Iznik. Tarde en el Gran Bazar y en el de las Especias, con un maestro alfombrero que explica cómo se lee un nudo. Al anochecer, vapor de línea a Üsküdar: se cruza a Asia por el precio de un billete de metro.',
      'Día 3 · La Süleymaniye de Mimar Sinan, de 1550, entendida como lo que es: un külliye con medersa, hospital, cocina de pobres y baño. Después, Chora y sus mosaicos bizantinos, y el barrio de Balat a pie. Tarde libre y hamam en un baño del siglo XVI.',
      'Día 4 · Vuelo a Kayseri, una hora y cuarto, y entrada en Capadocia. Museo al aire libre de Göreme con guía, el valle de Devrent y la puesta de sol desde Uçhisar. Noche en un hotel excavado en la toba.',
      'Día 5 · Globo al amanecer si el viento lo permite, y si no se intenta al día siguiente. Después, la ciudad subterránea de Kaymaklı, el valle de Ihlara a pie junto al río y un taller de cerámica en Avanos, donde se trabaja el barro del Kızılırmak desde época hitita.',
      'Día 6 · Vuelo a Esmirna y ruta a Pamukkale. Las terrazas de cal se cruzan descalzos por obligación, para no rayar el travertino, y encima está Hierápolis, con su teatro y una necrópolis de más de dos kilómetros.',
      'Día 7 · Éfeso por la mañana, entrando por la puerta alta para bajar andando: la calle de los Curetes, la biblioteca de Celso del año 117 y las casas adosadas con sus mosaicos. Tarde en Şirince, pueblo de viñas, y cena en la costa.',
      'Día 8 · Mañana libre en Esmirna, con el bazar de Kemeraltı y el paseo de Kordon, y vuelo de regreso.',
    ].join('\n'),
  },
  {
    destino: 'Estados Unidos',
    nombre: 'Nueva York, de punta a punta',
    categoria: 'ciudad',
    precio: 3450,
    duracionDias: 9,
    disponible: true,
    descripcion:
      'Nueve días de ciudad en otoño, por barrios y no por monumentos. Del Bronx a Coney Island en metro, con el follaje de Central Park cayendo y tres días finales en la otra costa para quien quiera alargarlo.',
    itinerario: [
      'Día 1 · Llegada a Nueva York y primera tarde a pie por Midtown, con el vapor saliendo del asfalto de la red que calienta media ciudad desde 1882. Cena temprana, que el desfase horario se paga.',
      'Día 2 · Downtown: el memorial del 11-S, con las dos huellas de Michael Arad, y Wall Street. Después, el ferry de Staten Island, que es gratis y da la mejor vista de la bahía, y una tarde en el Lower East Side con el Tenement Museum, donde se visita una casa de vecinos de 1863 tal como estaba.',
      'Día 3 · Ellis Island y la Estatua de la Libertad por la mañana, con billete de acceso al pedestal reservado. Por ese edificio pasaron más de doce millones de personas entre 1892 y 1954. Tarde en Chelsea: la High Line de punta a punta y el Whitney.',
      'Día 4 · Central Park de norte a sur, a pie y en barca de remos en el Loeb Boathouse. Por la tarde, uno de los museos de la Quinta Avenida, el Met o el Guggenheim, y paseo por el Upper West Side.',
      'Día 5 · Brooklyn: Dumbo con el puente de Manhattan encajado entre los almacenes, el mercado de Smorgasburg si es fin de semana, Williamsburg y vuelta a pie por el puente de Brooklyn al atardecer.',
      'Día 6 · Harlem por la mañana, con misa de gospel el domingo, el Apollo y las casas de Strivers Row. Tarde en Queens, el distrito con más diversidad lingüística del mundo: se come en Jackson Heights y se termina en el MoMA PS1.',
      'Día 7 · Coney Island en metro, que es una hora larga y merece la pena: el paseo de tablas, la noria de 1920 y el puesto de perritos que abrió en 1916. De vuelta, Times Square de noche, una vez y ya está.',
      'Día 8 · Mañana libre para mercados y librerías, y vuelo a Los Ángeles. Tarde en Venice y Santa Monica, con el Pacífico a media hora del aeropuerto.',
      'Día 9 · Los Ángeles: Griffith Observatory por la mañana, con la ciudad entera debajo, el Getty por la tarde y regreso. Vamos en otoño a propósito: en mayo y junio esa costa amanece tapada casi todos los días.',
    ].join('\n'),
  },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en el .env')

  await mongoose.connect(uri)
  const viajes = mongoose.connection.collection('viajes')

  for (const { destino, ...campos } of VIAJES) {
    const res = await viajes.updateOne({ destino }, { $set: { destino, ...campos } }, { upsert: true })
    console.log(`· ${destino}: ${res.upsertedCount ? 'creado' : 'actualizado'}`)
  }

  console.log('\n--- CATÁLOGO COMPLETO ---')
  const todos = await viajes.find({}).sort({ destino: 1 }).toArray()
  todos.forEach((v) =>
    console.log(
      [
        v.destino.padEnd(20),
        String(v.categoria || '?').padEnd(12),
        `${v.duracionDias}d`.padEnd(5),
        `${v.precio} €`.padEnd(9),
        v.disponible ? 'abierto' : 'agotado',
        `itinerario: ${String(v.itinerario || '').split('\n').filter(Boolean).length} días`,
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

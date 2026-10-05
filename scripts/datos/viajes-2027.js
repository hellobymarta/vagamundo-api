/*
 * Los viajes nuevos y los replanteados: Cinque Terre, Toscana, Turquía de
 * doce días, el gran viaje por Estados Unidos y Grecia con Milos.
 *
 *     cd ~/Documents/"FULL JUNIO 2026 old "/PEC3
 *     node viajes-2027.js
 *
 * Busca por "destino" y "nombre": si el viaje ya existe lo actualiza, y si no,
 * lo crea. No borra nada. Al final imprime el catálogo entero.
 */

require('dotenv').config()
const mongoose = require('mongoose')

const VIAJES = [
  {
    destino: 'Italia',
    nombre: 'Cinque Terre y el golfo de los Poetas',
    categoria: 'costa',
    precio: 2980,
    duracionDias: 7,
    disponible: true,
    descripcion:
      'Los cinco pueblos a pie, en tren y en barco, con base en Monterosso, y después el golfo de La Spezia, que es lo que casi nadie añade: Portovenere, la isla Palmaria y Lerici.',
    itinerario: [
      'Día 1 · Vuelo a Pisa o Génova y tren regional hasta Monterosso al Mare, el único de los cinco con playa de verdad y el más llano, que por eso es la base. Tarde de reconocimiento por el casco viejo y el paseo de Fegina, y primera cena de anchoas de Monterosso, que tienen su propia denominación.',
      'Día 2 · Levanto y Punta Mesco, la entrada por la puerta de atrás. Se sube al promontorio que cierra el parque por el norte, con las ruinas de la ermita de Sant’Antonio arriba y los cinco pueblos alineados abajo. Unas cuatro horas de ida y vuelta. Tarde libre en la playa.',
      'Día 3 · El tramo abierto del Sentiero Azzurro: Monterosso a Vernazza, 3,5 kilómetros y unas dos horas de subidas y bajadas entre bancales, con la escalera de piedra seca que sostiene la ladera desde hace ochocientos años. Vernazza tiene el único puerto natural de los cinco y la iglesia de Santa Margarita con los pies en el agua. Se sigue a Corniglia y se sube la Lardarina, 382 escalones, o el autobús.',
      'Día 4 · Manarola y Riomaggiore. El sendero de costa entre los dos sigue cortado desde 2012, así que se rodea por Volastra, por arriba, entre viñas. Por la tarde, la Via dell’Amore, reabierta en 2024 con reserva de franja horaria y sentido único desde Riomaggiore: veinte minutos colgados sobre el agua. Cata de Sciacchetrà, el vino dulce de bancal que se hace aquí desde el siglo XIII.',
      'Día 5 · Santuario de Montenero, a 340 metros sobre Riomaggiore, con los cinco pueblos de una sola vista. Traslado al golfo de La Spezia y llegada a Portovenere: la iglesia de San Pedro en el filo de la roca, el castillo Doria y la gruta de Byron.',
      'Día 6 · Día de barco por el golfo de los Poetas: la isla Palmaria y la del Tino, la costa de Lerici y el castillo de San Terenzo. Se come pescado en el puerto y se vuelve por la tarde.',
      'Día 7 · Mañana libre en Portovenere y regreso desde Pisa o Génova.',
    ].join('\n'),
  },
  {
    destino: 'Toscana',
    nombre: 'La Toscana, de Florencia a Siena',
    categoria: 'cultural',
    precio: 3390,
    duracionDias: 9,
    disponible: true,
    descripcion:
      'Nueve días y tres bases: Florencia, San Gimignano y la Val d’Orcia, para acabar en Siena. Sin deshacer la maleta cada noche y con las entradas de hora reservadas desde el primer día.',
    itinerario: [
      'Día 1 · Llegada a Florencia y primera tarde a pie por el centro: la plaza de la Signoria, el Ponte Vecchio y el barrio de Santa Croce. Cena de bistecca alla fiorentina, que se pide al peso y poco hecha, porque así se sirve.',
      'Día 2 · Florencia de manual, con hora reservada: la cúpula de Brunelleschi, cerrada en 1436 sin cimbra y todavía la mayor de fábrica del mundo, 463 escalones; el Baptisterio con las puertas de Ghiberti; y la Accademia, donde está el David. Tarde en Santa Maria Novella.',
      'Día 3 · Uffizi a primera hora, con el Nacimiento de Venus y la Primavera, y después el Oltrarno: los talleres de artesanía de Santo Spirito, el Palacio Pitti y el jardín de Boboli. Puesta de sol desde San Miniato al Monte, que está por encima del Piazzale Michelangelo y tiene menos gente.',
      'Día 4 · El Chianti Classico camino del sur. Cosme III delimitó la zona en 1716, de las primeras denominaciones del mundo, y de ahí viene el gallo negro del cuello. Visita a una bodega con cata y comida, y llegada a San Gimignano por la tarde, cuando ya se han ido los autocares.',
      'Día 5 · San Gimignano de mañana temprano, con las catorce torres que quedan de las setenta y dos que hubo, y después Volterra: la muralla etrusca, el teatro romano y un taller de alabastro, que se sigue trabajando a torno. Traslado a la Val d’Orcia.',
      'Día 6 · Montalcino y la abadía de Sant’Antimo, románica del siglo XII, en mitad de un valle de olivos. Cata de Brunello, que no sale al mercado hasta cinco años después de la vendimia, y tarde libre entre viñas.',
      'Día 7 · Pienza, que Pío II mandó rehacer entera en 1459 como ciudad ideal del Renacimiento, con el pecorino que se cura en cuevas de toba, y Montepulciano, con el Vino Nobile y el templo de San Biagio a los pies del pueblo.',
      'Día 8 · La Val d’Orcia por dentro, que es Patrimonio Mundial desde 2004 como paisaje cultural: Bagno Vignoni y su plaza convertida en piscina termal, los cipreses de San Quirico y el camino de la Foce. Por la tarde, llegada a Siena.',
      'Día 9 · Siena de mañana: la plaza del Campo, la catedral y su pavimento de mármol taraceado, y la fachada inacabada del Duomo Nuovo, que la peste de 1348 dejó a medias. Regreso desde Florencia.',
    ].join('\n'),
  },
  {
    destino: 'Turquía',
    nombre: 'Turquía de punta a punta',
    categoria: 'cultural',
    precio: 3690,
    duracionDias: 12,
    disponible: true,
    descripcion:
      'Doce días de Ankara a Estambul pasando por Capadocia, Pamukkale, Éfeso, Troya y Bursa. Los transportes internos van incluidos, y los tramos largos se vuelan: cuatro días más que el circuito clásico, dedicados a estar y no a rodar.',
    itinerario: [
      'Día 1 · Vuelo a Ankara vía Estambul y primera noche en la capital.',
      'Día 2 · Ankara entera: el Anıtkabir, el mausoleo de Atatürk levantado entre 1944 y 1953, al que se entra por una avenida de leones hititas, y el Museo de las Civilizaciones de Anatolia, que guarda lo que se sacó de Çatalhöyük y de Hattusa. Nueve mil años en dos plantas.',
      'Día 3 · Ruta a Capadocia con parada en la ciudad subterránea de Saratlı: siete pisos estimados, tres visitables, cuarenta salas y las puertas de piedra que se hacían rodar desde dentro. Llegada a Uçhisar y noche en hotel cueva.',
      'Día 4 · Museo al aire libre de Göreme con guía, y las iglesias rupestres que conservan los frescos del siglo XI. Por la tarde, el Valle de Devrent y la puesta de sol desde la fortaleza de Uçhisar. Globo al amanecer si el viento lo permite, y si no, se intenta otro día: por eso hay cuatro noches aquí.',
      'Día 5 · El Valle de Ihlara: catorce kilómetros de garganta junto al río, con iglesias excavadas en las paredes. Se andan los siete del tramo central, en bajada, y se come en Belisırma, a pie de agua.',
      'Día 6 · Capadocia a pie y sin coche: el Valle Rosa y el Valle de las Palomas al atardecer, un taller de cerámica en Avanos, donde se trabaja el barro del Kızılırmak desde época hitita, y tarde libre.',
      'Día 7 · Vuelo de Kayseri a Esmirna, una hora y cuarenta, que sustituye las ocho horas y media de autocar que hace el circuito clásico. Traslado a Pamukkale y primera tarde en las terrazas, cuando ya han bajado los grupos.',
      'Día 8 · Hierápolis por la mañana, con su teatro y la necrópolis de más de dos kilómetros, y bajada por las terrazas descalzos, que es obligatorio para no rayar el travertino. Ruta a Esmirna.',
      'Día 9 · Éfeso entrando por la puerta alta para bajar andando: la calle de los Curetes, la biblioteca de Celso del año 117 y las casas adosadas con sus mosaicos. Tarde en Şirince y regreso a Esmirna.',
      'Día 10 · Esmirna de mañana: el ágora romana, el bazar de Kemeraltı, abierto desde el siglo XVII, y el paseo del Kordon. Por la tarde, ruta al norte con parada en Pérgamo y su acrópolis colgada.',
      'Día 11 · Troya y el museo que abrió en 2018, un cubo de acero oxidado medio enterrado que explica el yacimiento mejor que el yacimiento mismo: nueve ciudades superpuestas, excavadas desde 1871. Por la tarde, Çanakkale y los Dardanelos, y traslado a Bursa cruzando el mar de Mármara en ferry.',
      'Día 12 · Bursa por la mañana, la primera capital otomana: la Mezquita Verde, el mercado de la seda y, a diez kilómetros, Cumalıkızık, un pueblo otomano de adobe y madera que entró en la lista de la UNESCO en 2014. Por la tarde, Estambul: Santa Sofía y la Mezquita Azul, el vapor de línea cruzando el Cuerno de Oro y cena en Sultanahmet antes del vuelo de regreso.',
    ].join('\n'),
  },
  {
    destino: 'Estados Unidos',
    nombre: 'Nueva York, Washington, Miami y Los Ángeles',
    categoria: 'ciudad',
    precio: 5450,
    duracionDias: 14,
    disponible: true,
    descripcion:
      'Catorce días y cuatro ciudades que no se parecen en nada, con los tres vuelos internos incluidos en el precio. Nueva York por barrios, Washington por su eje institucional, Miami por sus dos orillas y Los Ángeles para terminar mirando al Pacífico.',
    itinerario: [
      'Día 1 · Llegada a Nueva York y primera tarde a pie por Midtown, con el vapor saliendo del asfalto de la red que calienta media ciudad desde 1882. Cena temprana, que el desfase se paga.',
      'Día 2 · Downtown: el memorial del 11-S con las dos huellas de Michael Arad, Wall Street y el ferry de Staten Island, que es gratis y da la mejor vista de la bahía. Tarde en el Lower East Side con el Tenement Museum, una casa de vecinos de 1863 conservada tal cual.',
      'Día 3 · Ellis Island y la Estatua de la Libertad, con pase de pedestal reservado. Por esa isla pasaron más de doce millones de personas entre 1892 y 1954. Tarde en Chelsea: la High Line entera y el Whitney.',
      'Día 4 · Central Park de norte a sur, a pie y en barca de remos, y uno de los museos de la Quinta Avenida. Al final del día, Harlem: el Apollo, las casas de Strivers Row y, si es domingo, misa de gospel.',
      'Día 5 · Brooklyn y Queens, que es el distrito con más diversidad lingüística del mundo: Dumbo, Williamsburg, comida en Jackson Heights y vuelta a pie por el puente de Brooklyn al atardecer.',
      'Día 6 · Coney Island en metro, una hora larga que merece la pena: el paseo de tablas, la noria de 1920 y el puesto de perritos que abrió en 1916. Times Square de noche, una vez.',
      'Día 7 · Tren o vuelo corto a Washington D. C. Tarde en el National Mall: tres kilómetros y medio en línea recta del Capitolio al Lincoln Memorial, con el obelisco de 169 metros en medio.',
      'Día 8 · La zona institucional con guía: el Capitolio por dentro, con pase reservado, y la Casa Blanca desde la verja del Ellipse. Por la tarde, dos museos del Smithsonian, que son gratuitos: el del Aire y el Espacio y el de Historia Afroamericana.',
      'Día 9 · Lincoln Memorial al amanecer, con el estanque en calma, y los memoriales de Vietnam, Corea y Martin Luther King. Por la tarde, el cementerio de Arlington. Vuelo a Miami.',
      'Día 10 · Miami Beach: el South Beach Art Deco District, más de ochocientos edificios de los años treinta protegidos desde 1979, el conjunto art déco más denso del mundo. Se recorre de mañana a pie y se vuelve al anochecer, cuando encienden los neones.',
      'Día 11 · Little Havana y la Calle Ocho: el parque del dominó, las ventanitas de café y una fábrica de puros donde se sigue liando a mano. Por la tarde, Wynwood y sus muros, que se repintan cada año.',
      'Día 12 · Salida en barco por la bahía de Biscayne, que es como se entiende la ciudad, y tarde de playa. Vuelo nocturno a Los Ángeles.',
      'Día 13 · Los Ángeles: el Griffith Observatory por la mañana, con la ciudad entera debajo y el cartel de Hollywood enfrente, y el Getty por la tarde. Atardecer en Venice Beach.',
      'Día 14 · Última mañana en Santa Monica y vuelo de regreso.',
    ].join('\n'),
  },
  {
    destino: 'Grecia',
    nombre: 'Atenas, Milos y Santorini',
    categoria: 'islas',
    precio: 3150,
    duracionDias: 9,
    disponible: true,
    descripcion:
      'Dos días de piedra en Atenas y siete de isla: Milos, que casi nadie pone en el mapa, y Santorini por dentro. Se vuela a Atenas y se vuelve desde Santorini, sin deshacer el camino.',
    itinerario: [
      'Día 1 · Llegada a Atenas y paseo sin prisa por Plaka, Anafiotika, que levantaron los canteros de Anafi al pie de la Acrópolis, Monastiraki y el Ágora Antigua. Cena en una terraza de Psirí con la Acrópolis iluminada enfrente.',
      'Día 2 · Acrópolis a la apertura, a las ocho, que es la única hora sin calor y sin cola: Partenón, Erecteión y el Teatro de Dioniso. Después el Museo de la Acrópolis, donde están cinco de las seis cariátides originales. Por la tarde, el Templo de Zeus Olímpico y el Estadio Panatenaico, y el atardecer desde el Areópago o el Licabeto.',
      'Día 3 · Salto a Milos en ferry rápido, unas dos horas y media, o en vuelo de cincuenta minutos. Llegada a Adamas y subida a Plaka, la capital, colgada a 220 metros. El Kastro veneciano del siglo XIII al atardecer y cena allí arriba.',
      'Día 4 · La costa norte de Milos: Sarakiniko, ceniza volcánica blanqueada por el sol y la sal hasta parecer otro planeta; Papafragas y sus canales entre paredes; el yacimiento de Filakopi; Pollonia para comer pescado; y Firopotamos y Plathiena al final de la tarde. Coche o quad, que la isla se recorre así.',
      'Día 5 · Día de mar: la costa sur en barco hasta Kleftiko, donde los farallones y las cuevas servían de escondite a los piratas, de donde viene el nombre. Se entra en las grutas y se hace snorkel dentro. No hay carretera que llegue. Si sopla el meltemi se cambia por el día 4. Tarde en Klima, la fila de syrmata pintados a pie de agua.',
      'Día 6 · Ferry rápido a Santorini, una hora y cincuenta. Paseo del borde de la caldera de Fira a Firostefani e Imerovigli, poco más de una hora andando con el volcán siempre a la izquierda.',
      'Día 7 · Oía: las iglesias de cúpulas azules, el castillo y la bajada de trescientos escalones a Ammoudi Bay, donde se come pescado con los pies casi en el agua. Se sube otra vez para el atardecer.',
      'Día 8 · La otra Santorini. Akrotiri por la mañana, la ciudad de la Edad del Bronce sepultada por la erupción, con sus casas de varias plantas y su red de saneamiento, bajo cubierta y sin sol. Después Pyrgos, Megalochori y Emporio, pueblos de tierra adentro donde no para ningún autocar, una bodega de Assyrtiko con las viñas conducidas en cesto a ras de suelo, y la playa negra de Perissa. Cena de despedida.',
      'Día 9 · Vuelo de regreso desde Santorini, sin volver a Atenas.',
    ].join('\n'),
  },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en el .env')

  await mongoose.connect(uri)
  const viajes = mongoose.connection.collection('viajes')

  for (const { destino, nombre, ...campos } of VIAJES) {
    // Italia tiene dos viajes, así que el filtro es destino + nombre.
    const res = await viajes.updateOne(
      { destino, nombre },
      { $set: { destino, nombre, ...campos } },
      { upsert: true },
    )
    console.log(`· ${destino} — ${nombre}: ${res.upsertedCount ? 'creado' : 'actualizado'}`)
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
        `${String(v.itinerario || '').split('\n').filter(Boolean).length} días escritos`,
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

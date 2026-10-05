require('dotenv').config()
const mongoose = require('mongoose')
 
const CONTENIDO = [
  {
    destino: 'Italia',
    descripcion:
      'Siete días entre Ravello y Amalfi, con los dos yacimientos del Vesubio al principio y Paestum al final. La costa se recorre a pie y en barco, que es como se recorría antes de que existiera la carretera.',
    itinerario: [
      'Día 1 · Llegada a Nápoles y tarde a pie por el centro antiguo: el claustro mayólico de Santa Chiara, el Cristo velado de la Cappella Sansevero y los talleres de belenes de San Gregorio Armeno. Cena de pizza en el barrio.',
      'Día 2 · Herculano por la mañana, con sus casas de dos plantas y la madera carbonizada, y subida al Gran Cono del Vesubio: treinta minutos de sendero de ceniza hasta el borde del cráter, a 1.170 metros, con el golfo entero delante. Tarde en el Museo Arqueológico Nacional, donde están los bronces y el mosaico de Alejandro.',
      'Día 3 · Pompeya a la hora de apertura, tres horas largas entrando por Porta Marina. A mediodía, traslado a la costa por el interior y no por la SS163: parada en el mirador de Agerola y comida de quesos de los Monti Lattari. Llegada a Ravello.',
      'Día 4 · Ravello a pie: Villa Rufolo a primera hora y la Terrazza dell’Infinito de Villa Cimbrone. Por la tarde, Tramonti y una bodega de la DOC Costa d’Amalfi, con viñas de Tintore de pie franco en pérgola y cata.',
      'Día 5 · Sentiero degli Dei, de Bomerano a Nocelle: 4,5 kilómetros y unas dos horas y media con paradas, colgados sobre la costa. Bajada a Positano, comida tardía y regreso a Amalfi en el ferry de línea.',
      'Día 6 · Amalfi al abrir: el Duomo con el Chiostro del Paradiso y el arsenal de la república marinera, y subida por el Valle dei Mulini hasta el Museo del Papel. Media hora andando hasta Atrani. Tarde en Cetara, con visita a un obrador de colatura di alici y cena de pescado allí mismo.',
      'Día 7 · Paestum: los tres templos dóricos y la Tumba del Nadador en el museo. Comida de mozzarella de búfala recién hecha en la llanura del Sele y salida desde Nápoles.',
    ].join('\n'),
  },
  {
    destino: 'Japón',
    descripcion:
      'Seis días en Kansai sin pisar Tokio. Kioto a primera hora, Nara en tren y dos noches en Koyasan durmiendo en un templo, con la cena vegetariana de los monjes y el oficio del amanecer.',
    itinerario: [
      'Día 1 · Llegada a Kansai y tren Haruka hasta Kioto, ochenta minutos. Tarde suave y a pie: el Sanjusangendo, con sus mil imágenes alineadas, y Gion al anochecer. Cena de obanzai en Pontocho.',
      'Día 2 · Fushimi Inari a las siete de la mañana, que es la única hora a la que los torii están vacíos. Arashiyama antes de las ocho y media: el bambú de Sagano y el jardín del siglo XIV del Tenryu-ji. Tarde en el Kinkaku-ji y el Ryoan-ji. Cena kaiseki, con la secuencia de la estación explicada plato a plato.',
      'Día 3 · Nara en tren, cuarenta y cinco minutos. El Daibutsuden del Todai-ji, que se reconstruyó a siete vanos de los once originales y aun así sigue siendo uno de los mayores edificios de madera del mundo, y el camino de linternas de Kasuga-taisha. Comida de kakinoha-zushi. Por la tarde, subida a Koyasan en tren, funicular y autobús.',
      'Día 4 · Koyasan entero: el Okunoin entre cedros de siglos, el Danjo Garan y la pagoda Konpon Daito. Noche en un shukubo, con cena shojin ryori servida en la habitación sobre el tatami y recorrido del cementerio con linterna.',
      'Día 5 · Oficio budista del amanecer, a las seis, y desayuno vegetariano. El Okunoin otra vez de día, que es un sitio completamente distinto. Bajada a Kioto por la tarde.',
      'Día 6 · Mercado de Nishiki, última compra de cuchillos, cerámica y té, y regreso desde Kansai.',
    ].join('\n'),
  },
  {
    destino: 'Namibia',
    descripcion:
      'Ocho días del norte al desierto: las charcas de Etosha a primera hora, los grabados de Twyfelfontein con guía local y Deadvlei antes de que apriete el calor. Unos dos mil kilómetros, más de la mitad en pista de grava.',
    itinerario: [
      'Día 1 · Llegada a Windhoek y subida al norte por la B1, con parada en el mercado de tallas de madera de Okahandja. Noche en la zona de Otjiwarongo.',
      'Día 2 · Entrada en Etosha por la puerta de Andersson a la apertura, que es cuando hay actividad. Charcas de Nebrownii, Gemsbokvlakte y Olifantsbad por la mañana; descanso a mediodía en Okaukuejo, porque entre las doce y las tres no se mueve nada; y ruta al este por el borde de la pan. Noche en Halali, con la charca iluminada de Moringa.',
      'Día 3 · Sector de Namutoni, donde el bosque de mopane cambia la fauna respecto al oeste: más kudu, más dik-dik de Damara. Salida del parque por Andersson y traslado hacia el suroeste, con noche en Kamanjab para no hacer los 480 kilómetros de un tirón.',
      'Día 4 · Twyfelfontein a primera hora, con guía del centro de visitantes y la luz rasante sobre los grabados. Después, los Órganos de Piedra y el bosque petrificado. Por la tarde, búsqueda del elefante del desierto por los lechos secos del Huab y el Aba-Huab con un rastreador de la conservancy. No se garantiza: se busca.',
      'Día 5 · Bajada a la costa. Cape Cross, con la colonia de lobos marinos y el padrão que dejó Diogo Cão en 1486, y después la Salt Road hacia el sur, una pista de sal compactada con el Atlántico a la derecha y la niebla entrando. Noche en Swakopmund.',
      'Día 6 · Mañana en Walvis Bay: catamarán por la bahía o salida en 4x4 a Sandwich Harbour, donde las dunas caen directamente al mar. A mediodía, ruta al interior por los pasos de Gaub y Kuiseb. Llegada a Sesriem con luz, que allí no se conduce de noche.',
      'Día 7 · Salida antes del amanecer a la puerta interior. Duna 45 para la primera luz y desayuno de picnic al pie. Después, los últimos cinco kilómetros de arena blanda hasta Deadvlei, con sus acacias muertas hace novecientos años que el clima no ha dejado pudrirse. Cañón de Sesriem por la tarde y puesta de sol desde la duna Elim.',
      'Día 8 · Regreso a Windhoek por el paso de Spreetshoogte, con el escarpe entero delante, y vuelo de vuelta.',
    ].join('\n'),
  },
  {
    destino: 'Polinesia Francesa',
    descripcion:
      'Nueve días y cuatro islas, de Moorea a las Tuamotu: los marae de Taputapuatea al atardecer, la vainilla y las perlas de Taha’a, y el paso sur de Fakarava, donde el CNRS ha contado cerca de setecientos tiburones grises en un kilómetro de canal.',
    itinerario: [
      'Día 1 · Llegada a Papeete con trece horas de desfase en contra, así que el primer día es de aclimatación y está pensado como tal: el Museo de Tahití y las Islas, un baño en la costa oeste y cena en las roulottes de la plaza Vai’ete.',
      'Día 2 · Mercado de Papeete con la primera luz, que además es la hora a la que el jet lag deja despierto a todo el mundo. Ferry a Moorea y vuelta a la isla: las bahías de Cook y Opunohu, los marae del valle y el Belvédère al atardecer, con el Rotui en medio.',
      'Día 3 · Lagón de Moorea en lancha: rayas látigo y tiburones de puntas negras en un metro de agua y esnórquel en los jardines de coral. De julio a noviembre, la salida se convierte en avistamiento de ballena jorobada con prestador homologado, a cien metros y en rumbo paralelo, como manda la ley. Por la noche, ma’a Tahiti cocinado en horno de tierra con una familia.',
      'Día 4 · Vuelo a Huahine, cuarenta minutos. Tarde en Maeva, con guía local: los marae junto al lago Fauna Nui, el museo del Fare Pote’e y las trampas de pesca de piedra en uve, que siguen funcionando. Al caer la tarde, las anguilas de ojos azules de Faie.',
      'Día 5 · Vuelta a Huahine por la carretera de costa y vuelo corto a Raiatea. Taputapuatea al atardecer, cuando baja la luz y se queda vacío: mil años de civilización maohi y el paso sagrado de Te Ava Mo’a, por donde entraban las canoas que llegaban de las islas lejanas. Travesía a Taha’a por el lagón.',
      'Día 6 · Taha’a: una plantación de vainilla, con la polinización a mano y el curado de hasta nueve meses, y una granja perlera familiar donde se aprende a leer una perla antes de comprarla. Deriva en apnea por el Jardín de Coral, entre los motu Tautau y Maharare, en poco más de un metro de agua. Bora Bora se ve en el horizonte.',
      'Día 7 · Vuelo a Fakarava vía Papeete. El cambio de escala se nota de golpe: de montañas de setecientos metros a una franja de coral de trescientos metros de ancho, con el océano a un lado y el lagón al otro. Bicicleta por la única carretera y primera puesta de sol de atolón.',
      'Día 8 · Día completo en el paso sur de Tumakohua, hora y media de lancha hasta Tetamanu. Los titulados bucean a la deriva con la corriente entrante; el resto lo ve en apnea con guía, que se ve igual y no pide título. Comida sobre pilotes y regreso al atardecer.',
      'Día 9 · Último baño en el lagón, vuelo a Papeete y regreso, cruzando otra vez la línea de cambio de fecha.',
    ].join('\n'),
  },
  {
    destino: 'Costa Rica',
    descripcion:
      'Del bosque nuboso de Monteverde a los canales de Tortuguero y a Corcovado, que National Geographic describió como el lugar biológicamente más intenso de la Tierra. Un naturalista para ocho personas durante los diez días.',
  },
]
 
async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en el .env')
 
  await mongoose.connect(uri)
  // El modelo Travel de la PEC 3 guarda en la colección «viajes».
  const Viaje = mongoose.connection.collection('viajes')
 
  for (const { destino, ...campos } of CONTENIDO) {
    const res = await Viaje.updateOne({ destino }, { $set: campos })
    console.log(
      res.matchedCount === 0
        ? `· ${destino}: NO encontrado en la base de datos`
        : `· ${destino}: actualizado (${Object.keys(campos).join(', ')})`,
    )
  }
 
  await mongoose.disconnect()
  console.log('\nListo. Recarga la web para verlo.')
}
 
main().catch((error) => {
  console.error(error)
  process.exit(1)
})

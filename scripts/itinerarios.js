// Reescribe los itinerarios de India y de Costa Rica.
//
// Los dos se quedaron en una línea por día, de un par de frases, mientras que
// los de Islandia, Jordania o Turquía explican cada etapa. Aquí van los dos
// completos, con los mismos días y las mismas paradas que ya tenían: lo que
// cambia es que ahora se cuenta qué se hace en cada una.
//
// Las paradas, los kilómetros y los tiempos salen del folleto de Asia y
// Oceanía 2026 de Viajes El Corte Inglés (programa «India Masala», 11 días) y
// del de Centroamérica y Sudamérica 2026 (programas «Pura esencia» y
// «Emoción y aventura»), que son los mismos de los que salió el catálogo.
//
// Se puede ejecutar más de una vez: reescribe el campo y nada más.
//
//   npm run itinerarios

require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../src/config/db");
const Travel = require("../src/models/travel.model");

const INDIA = [
  "Día 1 · Vuelo a Delhi. Se llega a última hora de la noche o de madrugada, así que el primer día no lleva nada escrito: traslado al hotel y dormir. El desfase son tres horas y media por delante, que se nota menos que a la vuelta.",
  "Día 2 · Delhi, la vieja y la nueva en el mismo día, que es la manera de entender la ciudad. Por la mañana la Jama Masjid y Chandni Chowk, que no admite coche y se recorre en rickshaw y después a pie. Raj Ghat, donde se incineró a Gandhi, y la panorámica de la Delhi colonial: la Puerta de la India, el Parlamento y los edificios oficiales. Por la tarde el Qutub Minar, el pozo escalonado de Agrasen ki Baoli y el templo sij de Bangla Sahib, donde se come a diario y gratis para miles de personas.",
  "Día 3 · Salida por carretera hacia Jaipur, doscientos sesenta kilómetros y unas cinco horas, con parada en Samode. El pueblo vive de los estampadores de tela y de los brazaletes de vidrio, y dentro de las murallas está el palacio, con pinturas murales de trescientos años y la sala Durbar forrada de espejo. Se come allí. Llegada a Jaipur a media tarde y ceremonia de aarti en el templo de Birla, con la luz cayendo.",
  "Día 4 · Jaipur. El fuerte Amber, levantado entre los siglos XVI y XVIII sobre el lago Maota, con la subida y la bajada en jeep por la rampa empedrada. Después el Palacio de la Ciudad, del XVII, con sus patios y sus sucesivas estancias, y el Jantar Mantar, el observatorio astronómico de obra que Jai Singh II construyó entre 1728 y 1734 y que sigue midiendo la hora con una sombra. Parada frente al Hawa Mahal, que mira al este y por eso se fotografía por la mañana, y paseo por los mercados.",
  "Día 5 · Jaipur a Agra, doscientos treinta y seis kilómetros y unas seis horas, parando en Fatehpur Sikri. Akbar la levantó entera en arenisca roja y la capital duró catorce años: se abandonó por falta de agua y por eso se la llama la ciudad fantasma. Patrimonio Mundial desde 1986. Por la tarde, ya en Agra, se cruza el río hasta el mirador de la otra orilla, que es donde el Taj Mahal se ve sin cola y con la luz de frente.",
  "Día 6 · El Taj Mahal a las seis de la mañana, antes de desayunar, con el mármol todavía frío y la piedra cambiando de color según sube el sol. Se vuelve al hotel a desayunar y después se anda la parte vieja de la ciudad y el Fuerte de Agra, de arenisca roja, desde cuyas estancias altas Shah Jahan veía el mausoleo que había mandado construir. Tarde libre.",
  "Día 7 · Traslado a la estación y tren hasta Jhansi, y de ahí ciento setenta y seis kilómetros por carretera hasta Khajuraho, con parada en Orchha. A orillas del Betwa están los palacios y los templos que levantaron los bundela en los siglos XVI y XVII, con el Jahangir Mahal construido para una visita del emperador que, dice la tradición, duró una sola noche. Llegada a Khajuraho al final del día.",
  "Día 8 · Los templos de Khajuraho por la mañana, que son de los mejores ejemplos de arquitectura de templo del norte de la India: de los ochenta y cinco que llegó a tener el conjunto quedan unos veinte, levantados por la dinastía Chandela entre los siglos X y XI. Patrimonio Mundial desde 1986. Por la tarde, salida hacia Benarés.",
  "Día 9 · Benarés. Al amanecer se sale en barca por el Ganges para ver los baños de purificación y las ofrendas en los ghats, y después se recorre a pie la orilla. A diez kilómetros está Sarnath, donde Buda dio su primer sermón, con el museo arqueológico y el Dhamek Stupa. Al caer la tarde se vuelve al río, en rickshaw, para el aarti del Dashashwamedh: los sacerdotes mueven a la vez las lámparas de fuego y se oye desde el agua. Depende del nivel del río.",
  "Día 10 · Vuelo de Benarés a Delhi y enlace con el vuelo de vuelta, que sale de madrugada. Entre los dos hay tiempo de sobra y cambio de terminal. Noche a bordo.",
  "Día 11 · Llegada a España por la mañana, con el cambio de hora en contra y la sensación de haber estado fuera mucho más de once días.",
].join("\n");

const COSTA_RICA = [
  "Día 1 · Llegada a San José y noche en el valle central, a mil doscientos metros, que es donde el cuerpo se acostumbra sin pasar calor. El vuelo es largo y el primer día no lleva nada más.",
  "Día 2 · Salida temprano hacia el Caribe, con el desayuno en ruta, hasta el embarcadero donde empieza el recorrido en lancha por los canales. A Tortuguero no llega carretera: se entra por agua o en avioneta, y eso explica cómo está. Por la tarde, el pueblo, con sus casas de colores entre los canales, y el trabajo de conservación de las tortugas marinas que vienen a desovar cada año.",
  "Día 3 · Tortuguero a primera hora, cuando bajan los aulladores y el canal está quieto. Se navegan los caños pequeños del parque, que es donde se ve de verdad: dos mil especies de plantas, más de cuatrocientas de aves, monos, perezosos, caimanes y tortugas. Tarde con los biólogos de la estación. De julio a septiembre, y por la noche, se puede salir a ver el desove, que es la razón por la que existe este sitio.",
  "Día 4 · Vuelta en lancha hasta el muelle y continuación por tierra hacia Guápiles y el Arenal. Estuvo cuarenta y dos años en erupción continua, de 1968 a 2010, y lo decimos antes de que nadie reserve: lava ya no hay. Lo que hay es un cono casi perfecto, un bosque que no se seca nunca y las termales calentadas por el propio volcán, que es como se acaba el día.",
  "Día 5 · Mañana de puentes colgantes por las faldas del volcán, cruzando a la altura de las copas, que es donde viven los tucanes, los monos y los perezosos. El naturalista va delante con el telescopio y se anda despacio. Por la tarde, las cuevas del Venado, ocho cámaras que abrió un río subterráneo en la caliza y que se recorren con casco, linterna y los pies en el agua. Es opcional: hay tramos estrechos.",
  "Día 6 · Carretera a Monteverde, por la montaña. El bosque nuboso se recorre por arriba, entre las copas y con la niebla entrando por el collado, y se busca el quetzal, que baja a los aguacatillos entre febrero y julio. No se promete: se madruga, se espera con el guía y algunas mañanas aparece. Aquí llueve o chispea casi cualquier día del año, y eso es justo lo que lo mantiene así.",
  "Día 7 · Vuelo corto a bahía Drake, en la península de Osa, y entrada en lancha hasta el alojamiento, metido dentro del bosque. Se cambia de país sin salir de él: aquí el Pacífico sur es húmedo, cerrado y sin una sola torre en toda la costa.",
  "Día 8 · Corcovado, día completo por la estación Sirena, con guía certificado, que allí es obligatorio, y cupo diario. El parque protege ocho hábitats distintos y tiene la mayor riqueza silvestre del país: bosque primario y secundario, monos araña, congos y capuchinos, perezosos, pizotes y árboles de más de cien años. National Geographic lo describió como el lugar biológicamente más intenso de la Tierra, y la caminata se nota.",
  "Día 9 · Isla del Caño, a tres cuartos de hora en bote: una reserva biológica cubierta de bosque húmedo en estado virgen, con quince especies de coral y de las mejores visibilidades del Pacífico costarricense. Se hace snorkel y no se toca nada, que el fondo está vivo. Quien prefiera quedarse tiene la mañana libre en la playa.",
  "Día 10 · Traslado en bote y por tierra hasta la pista de Palmar Sur, vuelo doméstico a San José y vuelo de vuelta.",
].join("\n");

const ITINERARIOS = [
  { nombre: "India, de Delhi al Ganges", itinerario: INDIA, destino: "India" },
  { nombre: "Costa Rica de punta a punta", itinerario: COSTA_RICA },
];

async function escribirItinerarios() {
  await connectDB(process.env.MONGODB_URI);

  for (const { nombre, itinerario, destino } of ITINERARIOS) {
    const viaje = await Travel.findOne({ nombre });

    if (!viaje) {
      process.stdout.write(`No encuentro el viaje "${nombre}".\n`);
      continue;
    }

    const etapas = itinerario.split("\n").length;

    viaje.itinerario = itinerario;

    // El resto del catálogo guarda el país en `destino`, y este viaje era el
    // único que guardaba una región.
    if (destino) viaje.destino = destino;

    await viaje.save();

    process.stdout.write(`"${nombre}": ${etapas} etapas escritas.\n`);
  }
}

escribirItinerarios()
  .catch((err) => {
    process.stderr.write(`No ha salido bien: ${err.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

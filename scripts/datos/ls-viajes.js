require('dotenv').config()
const mongoose = require('mongoose')
;(async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  const v = await mongoose.connection.collection('viajes').find({}).toArray()
  v.forEach(x => console.log([x._id, x.destino, x.nombre, x.categoria, x.duracionDias+'d', x.precio, x.disponible, 'itin:'+String(x.itinerario||'').length].join(' | ')))
  console.log('TOTAL', v.length)
  await mongoose.disconnect()
})()

// Prueba la API de punta a punta contra el servidor que esté levantado: entra
// con una cuenta, recorre el catálogo, el diario y las reservas, comprueba que
// lo ajeno y lo que no tiene sesión se rechaza, y borra lo que ha creado.
//
//   npm run dev     (en una pestaña)
//   npm run probar  (en otra)

const BASE = process.env.API_URL || "http://localhost:4000";

let fallos = 0;

function comprobar(titulo, condicion, detalle = "") {
  const marca = condicion ? "  ok  " : "FALLA ";
  process.stdout.write(`${marca} ${titulo}${detalle ? ` · ${detalle}` : ""}\n`);
  if (!condicion) fallos += 1;
}

async function pedir(ruta, { metodo = "GET", cuerpo, token } = {}) {
  const cabeceras = {};
  if (cuerpo) cabeceras["Content-Type"] = "application/json";
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  const respuesta = await fetch(BASE + ruta, {
    method: metodo,
    headers: cabeceras,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });

  const texto = await respuesta.text();

  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }

  return { estado: respuesta.status, datos };
}

// Un píxel en PNG, para no depender de ningún archivo.
const IMAGEN =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const CUENTA = { email: "marta@vagamundo.es", password: "vagamundo2026" };

async function probar() {
  process.stdout.write(`Probando ${BASE}\n\n`);

  const salud = await pedir("/");
  comprobar("la API responde", salud.estado === 200, JSON.stringify(salud.datos));

  if (salud.estado !== 200) {
    process.stderr.write("\nNo hay nadie escuchando. Levanta la API con npm run dev.\n");
    process.exit(1);
  }

  process.stdout.write("\n-- sesión --\n");

  const mala = await pedir("/api/auth/login", {
    metodo: "POST",
    cuerpo: { email: CUENTA.email, password: "otra-cosa" },
  });
  comprobar("contraseña incorrecta devuelve 401", mala.estado === 401);

  const buena = await pedir("/api/auth/login", { metodo: "POST", cuerpo: CUENTA });
  comprobar("entrar devuelve token", buena.estado === 200 && Boolean(buena.datos?.token));
  comprobar("el login no devuelve la contraseña", !("password" in (buena.datos?.usuario || {})));

  if (buena.estado !== 200) {
    process.stderr.write("\nSin sesión no puedo seguir. ¿Has ejecutado npm run sembrar?\n");
    process.exit(1);
  }

  const token = buena.datos.token;

  comprobar("/auth/me con token responde", (await pedir("/api/auth/me", { token })).estado === 200);
  comprobar("/auth/me sin token devuelve 401", (await pedir("/api/auth/me")).estado === 401);
  comprobar(
    "/auth/me con token inventado devuelve 401",
    (await pedir("/api/auth/me", { token: "esto-no-es-un-token" })).estado === 401
  );

  process.stdout.write("\n-- catálogo --\n");

  const catalogo = await pedir("/api/travels");
  comprobar("el catálogo es público", catalogo.estado === 200 && Array.isArray(catalogo.datos));
  comprobar(
    "cada viaje trae sus plazas libres",
    catalogo.datos.length === 0 || typeof catalogo.datos[0].plazasLibres === "number"
  );

  const viajeNuevo = {
    nombre: "Viaje de prueba automática",
    destino: "Ninguno",
    precio: 1000,
    duracionDias: 5,
    plazas: 6,
    descripcion: "Creado por el script de pruebas.",
  };

  comprobar(
    "crear sin sesión devuelve 401",
    (await pedir("/api/travels", { metodo: "POST", cuerpo: viajeNuevo })).estado === 401
  );

  const creado = await pedir("/api/travels", { metodo: "POST", token, cuerpo: viajeNuevo });
  comprobar("crear con sesión devuelve 201", creado.estado === 201);

  const idViaje = creado.datos.id || creado.datos._id;

  comprobar("el viaje se puede leer", (await pedir(`/api/travels/${idViaje}`)).estado === 200);

  const editado = await pedir(`/api/travels/${idViaje}`, {
    metodo: "PUT",
    token,
    cuerpo: { precio: 1200 },
  });
  comprobar("editar con sesión funciona", editado.estado === 200 && editado.datos.precio === 1200);

  comprobar(
    "id inexistente devuelve 404",
    (await pedir("/api/travels/000000000000000000000000")).estado === 404
  );
  comprobar("id con mala forma devuelve 400", (await pedir("/api/travels/pepito")).estado === 400);
  comprobar("una ruta que no existe devuelve 404", (await pedir("/api/loquesea")).estado === 404);

  const sinCampos = await pedir("/api/travels", { metodo: "POST", token, cuerpo: { nombre: "X" } });
  comprobar("valida los campos obligatorios", sinCampos.estado === 400, sinCampos.datos?.mensaje);

  process.stdout.write("\n-- reservas --\n");

  comprobar("las reservas piden sesión", (await pedir("/api/bookings")).estado === 401);

  const reserva = await pedir("/api/bookings", {
    metodo: "POST",
    token,
    cuerpo: { viaje: idViaje, personas: 2 },
  });
  comprobar("reservar devuelve 201", reserva.estado === 201);

  const pasada = await pedir("/api/bookings", {
    metodo: "POST",
    token,
    cuerpo: { viaje: idViaje, personas: 9 },
  });
  comprobar("no deja pasarse de plazas", pasada.estado === 409, pasada.datos?.mensaje);

  const conPlazas = await pedir(`/api/travels/${idViaje}`);
  comprobar(
    "las plazas libres bajan al reservar",
    conPlazas.datos.plazasLibres === 4,
    `quedan ${conPlazas.datos.plazasLibres}`
  );

  comprobar(
    "anular la reserva funciona",
    (await pedir(`/api/bookings/${reserva.datos.id}`, { metodo: "DELETE", token })).estado === 200
  );

  process.stdout.write("\n-- diario --\n");

  const diario = await pedir("/api/posts");
  comprobar("el diario es público", diario.estado === 200);
  comprobar("el diario viene paginado", typeof diario.datos?.paginas === "number");

  const cronica = {
    titulo: "Crónica de prueba",
    destino: "Ninguno",
    contenido: "Texto de prueba suficientemente largo para pasar la validación.",
    imagen: IMAGEN,
  };

  comprobar(
    "escribir sin sesión devuelve 401",
    (await pedir("/api/posts", { metodo: "POST", cuerpo: cronica })).estado === 401
  );

  const sinFoto = await pedir("/api/posts", {
    metodo: "POST",
    token,
    cuerpo: { ...cronica, imagen: undefined },
  });
  comprobar("la fotografía es obligatoria", sinFoto.estado === 400, sinFoto.datos?.mensaje);

  const publicada = await pedir("/api/posts", { metodo: "POST", token, cuerpo: cronica });
  comprobar("publicar con sesión devuelve 201", publicada.estado === 201);

  const idPost = publicada.datos.id;

  const comentario = await pedir(`/api/posts/${idPost}/comments`, {
    metodo: "POST",
    token,
    cuerpo: { texto: "Comentario de prueba" },
  });
  comprobar("comentar devuelve 201", comentario.estado === 201);

  const conComentario = await pedir(`/api/posts/${idPost}`);
  comprobar("el comentario sale en la crónica", conComentario.datos?.comentarios?.length === 1);

  process.stdout.write("\n-- panel --\n");

  comprobar("el panel pide sesión", (await pedir("/api/stats")).estado === 401);

  const stats = await pedir("/api/stats", { token });
  comprobar(
    "el panel devuelve los números",
    stats.estado === 200 && typeof stats.datos.ocupacion === "number",
    `${stats.datos?.viajes} viajes, ${stats.datos?.plazas} plazas, ${stats.datos?.ocupacion}% ocupación`
  );

  process.stdout.write("\n-- limpieza --\n");

  comprobar(
    "borrar la crónica funciona",
    (await pedir(`/api/posts/${idPost}`, { metodo: "DELETE", token })).estado === 200
  );
  comprobar(
    "sus comentarios se han ido con ella",
    (await pedir(`/api/comments/${comentario.datos.id}`, { metodo: "DELETE", token })).estado === 404
  );
  comprobar(
    "borrar el viaje funciona",
    (await pedir(`/api/travels/${idViaje}`, { metodo: "DELETE", token })).estado === 200
  );

  process.stdout.write(
    fallos === 0 ? "\nTodo correcto.\n" : `\n${fallos} comprobaciones han fallado.\n`
  );

  process.exitCode = fallos === 0 ? 0 : 1;
}

probar().catch((err) => {
  process.stderr.write(`\nError inesperado: ${err.message}\n`);
  process.exitCode = 1;
});

# Errores típicos y qué mirar

Busca el síntoma. Casi siempre la causa está en la segunda columna.

## En el navegador (consola de F12)

| Qué ves | Causa probable | Arreglo |
|---|---|---|
| Pantalla en blanco | Un error en el `<script>`, o un import mal escrito | F12 → Console: el primer error rojo dice el fichero y la línea |
| `X is not defined` | Falta importarlo, o lo pegaste dentro de otra función | Mira los `import` de arriba y que la variable esté al nivel del `<script setup>` |
| `Cannot access X before initialization` | Usas un `const` antes de su línea | Mueve el bloque **encima** de donde se usa |
| `Failed to resolve import` | La ruta está mal | Cuenta los `../`: desde `src/components/` son `../api/`, `../store/`, `../utils/` |
| `Failed to resolve component: X` | Falta importar el componente, o el nombre no coincide | El import y la etiqueta tienen que escribirse igual |
| `Cannot read properties of undefined` | Lees un campo de algo que todavía no ha llegado | Usa `?.` (`paciente?.nomepac`) o envuélvelo en un `v-if` |
| La tabla no cambia al cambiar el filtro | El `v-for` sigue leyendo la lista original | Cambia `v-for="u in pacientes"` por la lista filtrada |
| Un `computed` no se recalcula | Dentro del script leíste el `ref` sin `.value` | `lista.value.filter(...)`, no `lista.filter(...)` |
| El dato cambia en el script pero no en pantalla | Asignaste a la variable en vez de a su `.value` | `lista.value = nuevaLista` |
| `x-invalid-end-tag` al compilar | Pegaste dentro de una etiqueta, entre sus atributos | Pega siempre **encima o debajo de una etiqueta entera**, nunca en medio de un `<div ...>` |
| `Unexpected token` al guardar el fichero | Llaves o paréntesis descuadrados al pegar | Mira las líneas justo antes y después de lo que pegaste |
| El botón «Guardar» no se activa nunca | Un `:disabled` con una condición que nunca es falsa | Pon un `console.log` de la condición y mírala en la consola |
| `Network Error` | El backend no está arrancado | `npm start` (no `npm run dev`: eso arranca solo Vue) |
| `503` en una petición | Mongo no está conectado | `docker compose up -d`, y mira la terminal del backend |
| `404` en una petición | La URL no existe en Express | Pestaña Network (F12): compara la URL con `backend/rutas/` |
| `400` con un mensaje | Una validación del modelo no se cumple | El mensaje dice qué campo |
| Un cambio de color no se nota | Tailwind cachea las clases | Ctrl+C y `npm start` otra vez |

## En el servidor (la terminal del backend)

| Qué ves | Causa probable | Arreglo |
|---|---|---|
| El cambio del backend no hace nada | No reiniciaste | Ctrl+C y `npm start`: el backend **no** recarga solo |
| `MONGO_URI no está configurado` | Falta la variable de entorno | El servidor arranca, pero las rutas de datos responden `503` |
| `ECONNREFUSED ... 27017` | Mongo no está levantado | `docker compose up -d` |
| `ValidationError` | Un `required`, `match` o `validate` del schema | El mensaje nombra el campo |
| `CastError ... ObjectId` | Mandaste un DNI donde se espera un `_id`, o al revés | **Paciente por DNI, doctor por `_id`**: es el fallo más habitual de este proyecto |
| Un campo nuevo no se guarda | Falta en el schema de `backend/modelos/` | Mongoose ignora lo que no conoce. Añádelo y reinicia |
| `Port 3000 already in use` | Quedó un backend viejo corriendo | Cierra la otra terminal, o `taskkill /F /IM node.exe` |

## Los cinco fallos propios de este proyecto

1. **Paciente por DNI, doctor por `_id`.** Las citas guardan `pacienteDNI` (texto) y
   `doctorId` (ObjectId). Las rutas de pacientes son `/api/pacientes/:dni` y las de doctores
   `/api/doctores/:id`. Confundirlos da `404` o `CastError`.

2. **Los DNI se guardan en mayúsculas.** Si comparas un DNI escrito a mano con uno de la
   base de datos, normaliza los dos lados: `String(x).trim().toUpperCase()`.

3. **`XestionPacientes.vue` no importa `computed`.** Solo `ref`, `reactive` y `onMounted`.
   Si pegas un `computed` ahí sin tocar el import, sale `computed is not defined`.

4. **En Citas, paciente y doctor vienen de Pinia, no del formulario.** Los dos selectores
   están `disabled`: se eligen en sus pantallas. Si el formulario no deja guardar, casi
   siempre es que falta seleccionar uno de los dos.

5. **Las fechas son texto `aaaa-mm-dd`.** Se comparan con `<`, `>` y `===` directamente. No
   hace falta `new Date(...)`, y usarlo puede darte el día anterior por la zona horaria.

## Cómo buscar el fallo, en orden

1. ¿Hay algo rojo en la **consola del navegador** (F12 → Console)? Empieza por el **primer**
   error, no por el último: los de abajo suelen ser consecuencia del primero.
2. ¿Sale la petición? Pestaña **Network**: mira su código (`200`, `400`, `404`, `503`) y su
   respuesta.
3. ¿Falla en el servidor? Mira la **terminal donde corre `npm start`**.
4. Si nada de eso: pon un `console.log(...)` justo antes de la línea sospechosa, mira el
   valor en la consola y bórralo al acabar.

Y el truco que más tiempo ahorra: **deshaz lo último que pegaste** (Ctrl+Z) y comprueba que
sin eso funcionaba. Si seguía roto, el problema era anterior.

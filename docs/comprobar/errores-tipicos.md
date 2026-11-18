# Errores típicos y qué mirar

Busca el síntoma. Casi siempre la causa está en la primera columna.

## En el navegador

| Qué ves | Causa probable | Arreglo |
|---|---|---|
| Pantalla en blanco | Un error en el `<script>` o un import mal escrito | F12 → Console: el primer error rojo dice el fichero y la línea |
| `X is not defined` | Falta importarlo, o está dentro de otra función | Mira los `import` de arriba; que la variable esté al nivel del `<script setup>` |
| `Failed to resolve import` | Ruta equivocada | Cuenta los `../` y comprueba que el fichero existe y se llama igual |
| `Cannot read properties of undefined` | Lees un campo de algo que aún no ha llegado | Usa `?.` (`p?.nome`) o un `v-if` |
| La tabla no cambia al cambiar el filtro | Falta `.value` en el script, o la tabla sigue leyendo la lista antigua | Revisa `:filas="..."` y que uses `lista.value` dentro del script |
| El dato no se actualiza en pantalla | Desestructuraste un store sin `storeToRefs` | `const { x } = storeToRefs(store)` |
| `x-invalid-end-tag` al compilar | Pegaste dentro de una etiqueta, entre sus atributos | Pega siempre **encima o debajo de una etiqueta entera** |
| `Network Error` en la consola | El backend no está arrancado, o el puerto del `.env` no coincide | `npm start`; compara `PORT` y `VITE_API_URL` |
| `404` en una petición | La URL o la ruta de Express no existe | Mira la URL en la pestaña Network (F12) y compárala con `backend/rutas/` |
| El botón «Gardar» no se activa | Un `:disabled` que devuelve `""` en lugar de `false` | Usa `Boolean(...)` |

## En el servidor (la terminal del backend)

| Qué ves | Causa probable | Arreglo |
|---|---|---|
| El cambio no hace nada | No reiniciaste el backend | Ctrl+C y `npm start` |
| `400` con un mensaje | Falla una validación del modelo (`required`, `match`, `validate`) | Lee el mensaje: dice qué campo |
| `409` | Valor repetido (DNI, nombre) o una cita que choca | Es una regla del servidor; el mensaje lo explica |
| `404 … non atopado` | El id no existe | Comprueba que mandas el `id` y no el DNI, o al revés |
| `MongoServerError … connect ECONNREFUSED` | Mongo no está arrancado | `docker start mongodb` |
| Un campo nuevo no se guarda | Falta en el modelo (`backend/modelos/`): Mongoose ignora lo que no conoce | Añádelo al schema y reinicia |

## Cómo buscar el fallo

1. ¿Sale algo rojo en la **consola del navegador**? Empieza por ahí.
2. ¿Llega la petición? Pestaña **Network**: mira su código y su respuesta.
3. ¿Falla en el servidor? Mira la **terminal del backend**.
4. Si nada de eso, pon un `console.log(...)` justo antes de la línea sospechosa y comprueba qué valor tiene; bórralo al acabar.

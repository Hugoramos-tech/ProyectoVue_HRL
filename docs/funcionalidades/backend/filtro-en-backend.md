# Filtro en el backend: `?estado=` y `?fecha=`

`GET /api/citas?estado=pendente&fecha=2026-11-19` devuelve solo esas citas, y la pantalla de citas tiene un selector de estado y un calendario que usan esos parámetros.

**Antes de empezar:** arranca el proyecto (`npm start`). El backend **no recarga solo**: hay que reiniciarlo después del Paso 1.

## La idea

El filtro por paciente y por doctor ya existe. La ruta lee `req.query` (lo que va tras el `?` en la URL) y monta un objeto `filtros` que le pasa a Mongoose:

```js
const filtros = {}
if (req.query.pacienteDNI) { filtros.pacienteDNI = ... }
if (req.query.doctorId) { filtros.doctorId = req.query.doctorId }
const citas = await Cita.find(filtros).sort({ fecha: 1, hora: 1 }).lean()
```

Aquí se añaden dos filtros más al mismo objeto.

**La buena noticia:** `src/api/citas.js` **no hay que tocarlo**. Tu `getCitas` ya pasa el objeto entero como query params:

```js
export async function getCitas(filtros = {}) {
  const res = await axios.get(API_URL, { params: filtros })
  return res.data
}
```

Así que en cuanto el backend entienda `estado` y `fecha`, desde la web basta con llamar a `getCitas({ estado: "pendente" })`. Un filtro menos que programar.

## Filtrar en el servidor o en el navegador

| | En el servidor (esta receta) | En el navegador ([filtro en el cliente](../listas/filtro-en-cliente.md)) |
|---|---|---|
| Cómo | La URL lleva `?estado=...` y Mongo filtra | Un `computed` filtra la lista ya cargada |
| Ventaja | Viajan menos datos; vale con miles de citas | Instantáneo, sin esperar al servidor |
| Inconveniente | Cada cambio es una petición | Hay que traerse todo primero |
| Cuándo | Muchos registros, o el enunciado pide la URL con parámetros | Pocos registros |

Para este proyecto las dos valen. Si el enunciado menciona la URL o `req.query`, es esta.

## Qué vas a tocar

| # | Fichero | Para qué |
|---|---|---|
| 1 | `backend/rutas/citas.rutas.js` | Que la ruta lea los parámetros nuevos |
| 2 | `src/components/Citas.vue` | Los controles y la petición |

`src/api/citas.js` no se toca.

## Paso 1 · La ruta

En `backend/rutas/citas.rutas.js`, busca la línea `const citas = await Cita.find(filtros).sort({ fecha: 1, hora: 1 }).lean()` y pega esto **justo encima**:

```js
        // Coincidencia exacta: ?estado=pendente
        if (req.query.estado) {
            filtros.estado = req.query.estado
        }
        // Un dia concreto: ?fecha=2026-11-19
        if (req.query.fecha) {
            filtros.fecha = req.query.fecha
        }
        // Rango: ?desde=2026-11-14&hasta=2026-11-20
        // Las fechas se guardan como texto aaaa-mm-dd, y comparar ese texto da el
        // orden cronologico correcto. $gte = mayor o igual; $lte = menor o igual.
        if (req.query.desde || req.query.hasta) {
            filtros.fecha = {}
            if (req.query.desde) {
                filtros.fecha.$gte = req.query.desde
            }
            if (req.query.hasta) {
                filtros.fecha.$lte = req.query.hasta
            }
        }
```

Ese es el sitio correcto: justo antes de que `filtros` se use, y dentro del mismo `try` que ya está ahí. Fíjate en que se pega **encima** de esa línea, no debajo de los `if` que ya existen: si lo pones justo detrás de `filtros.doctorId = req.query.doctorId` te quedas en medio de un `if` y las llaves dejan de cuadrar.

**Reinicia el backend** y pruébalo antes de tocar la web:

```bash
curl "localhost:3000/api/citas?estado=confirmada"
curl "localhost:3000/api/citas?fecha=2026-11-19"
curl "localhost:3000/api/citas?desde=2026-11-14&hasta=2026-11-20"
curl "localhost:3000/api/citas"
```

Los tres primeros devuelven solo lo que cumple; el cuarto, todas, como antes. Si el cuarto devuelve menos que antes, algo está mal: un filtro vacío no debe filtrar.

## Paso 2 · Los controles en la pantalla

En `src/components/Citas.vue`, busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega esto **justo encima**:

```js
// Lo elegido en los dos controles del filtro ("" = sin filtrar).
const filtroEstadoServidor = ref("")
const filtroFechaServidor = ref("")

// Al cambiar cualquiera de los dos se vuelve a pedir la lista al servidor.
// Es la diferencia con el filtro en el cliente: aqui hay una peticion nueva.
watch([filtroEstadoServidor, filtroFechaServidor], async () => {
  await cargarDatos()
})
```

Después busca la línea `getCitas({ pacienteDNI: dniPaciente, doctorId: idDoctor }),` y **sustitúyela** por:

```js
      getCitas({
        pacienteDNI: dniPaciente,
        doctorId: idDoctor,
        // Si el ref esta vacio se manda "" y la ruta lo ignora, porque
        // `if (req.query.estado)` es falso con cadena vacia.
        estado: filtroEstadoServidor.value,
        fecha: filtroFechaServidor.value,
      }),
```

Y en el `<template>`, busca la línea `<div class="citas-cabecera-lista">` y pega esto **justo encima**:

```vue
      <div class="mb-3 flex flex-wrap items-center gap-3">
        <select v-model="filtroEstadoServidor">
          <option value="">Todos os estados</option>
          <option value="pendente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="realizada">Realizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <input
          v-model="filtroFechaServidor"
          type="date"
        >
        <!-- Vaciar los dos ref dispara el watch, que vuelve a pedir la lista completa -->
        <button
          class="citas-boton-secundario"
          type="button"
          @click="filtroEstadoServidor = ''; filtroFechaServidor = ''"
        >
          Limpar filtros
        </button>
      </div>
```

No hace falta `@change`: el `watch` del Paso 2 ya se encarga de recargar.

## Un detalle importante de esta pantalla

`cargarDatos()` empieza con esto:

```js
  if (!dniPaciente && !idDoctor) {
    citas.value = []
    ...
    return
  }
```

Es decir, **sin un paciente o un doctor seleccionado no pide nada**. Así que los filtros nuevos funcionan sobre las citas de la selección, no sobre toda la base de datos. Si quieres que la pantalla liste todas las citas filtradas sin seleccionar a nadie, hay que quitar ese `return`, pero entonces cambia el comportamiento de toda la pantalla: piénsalo antes.

## Qué deberías ver

1. Un selector de estado, un calendario y un botón «Limpar filtros» encima de «📋 Listado de citas».
2. Elegir un estado recarga la tabla desde el servidor con solo esas citas.
3. Elegir una fecha filtra por ese día; las dos cosas se combinan.
4. «Limpar filtros» devuelve la lista completa de la selección.
5. En la pestaña **Red** de F12 verás una petición nueva a `/api/citas?...` en cada cambio. Eso es lo que distingue esta receta de la del filtro en el cliente.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El `curl` devuelve todas las citas | No reiniciaste el backend, o el bloque quedó fuera de `router.get("/", ...)` |
| `SyntaxError: Unexpected token` al arrancar el backend | Las llaves no cuadran: pegaste el bloque «justo debajo» del `if` |
| El `curl` sin parámetros devuelve menos citas | Estás metiendo filtros vacíos en `filtros`: cada `if` debe comprobar que el valor existe |
| La web no filtra pero el `curl` sí | Falta el cambio en la llamada a `getCitas` |
| `filtroEstadoServidor is not defined` | El Paso 2 quedó dentro de otra función |
| La tabla no se recarga al cambiar | Falta el `watch` del Paso 2 |
| Da error de fecha | `?fecha=` espera `aaaa-mm-dd`, que es lo que da un `<input type="date">` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `req.query` | Lo que va tras el `?` en la URL |
| `$gte` y `$lte` | Operadores de Mongo para «mayor o igual» y «menor o igual» |
| Fechas como texto | `aaaa-mm-dd` se ordena y compara como texto sin convertir a `Date` |
| `watch` | Hacer algo cuando cambia un dato |
| Parámetros por objeto | `getCitas({...})` pasa el objeto entero como query params |

## Guías relacionadas

- [Filtro en el cliente](../listas/filtro-en-cliente.md)
- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)
- [Borrado en cascada](borrado-en-cascada.md)

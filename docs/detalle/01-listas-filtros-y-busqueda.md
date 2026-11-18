# Listas, filtros y búsqueda

[← Índice](README.md) · [Siguiente: formularios y campos →](02-formularios-y-campos.md)

Todo lo que pueden pedirte sobre **qué se ve en una tabla**: filtrar, buscar, ordenar, paginar y contar. Está pensado para no salir de esta página.

## En esta página

1. [Cliente o servidor](#1-cliente-o-servidor)
2. [Lo que necesitas saber](#2-lo-que-necesitas-saber)
3. [Las piezas de tu proyecto](#3-las-piezas-de-tu-proyecto)
4. [Filtrar por estado](#4-filtrar-por-estado)
5. [Buscador de texto](#5-buscador-de-texto)
6. [Rango de fechas](#6-rango-de-fechas)
7. [Filtrar por especialidad a través del doctor](#7-filtrar-por-especialidad-a-través-del-doctor)
8. [Ordenar y paginar](#8-ordenar-y-paginar)
9. [Limpiar filtros y contar resultados](#9-limpiar-filtros-y-contar-resultados)
10. [Hacerlo en el servidor](#10-hacerlo-en-el-servidor)
11. [Si te piden esto, mira aquí](#11-si-te-piden-esto-mira-aquí)
12. [Fallos que quitan puntos](#12-fallos-que-quitan-puntos)
13. [Recetas cortas](#13-recetas-cortas)

## 1. Cliente o servidor

Hay dos sitios donde filtrar y el enunciado casi nunca dice cuál. Decídelo tú:

| | En el cliente | En el servidor |
|---|---|---|
| Cómo | Un `computed` filtra la lista que ya tienes | Se vuelve a pedir con un parámetro en la URL |
| Velocidad | Instantáneo, sin red | Una petición por cada cambio |
| ¿Hay que tocar el backend? | No | Sí, y reiniciarlo |
| Con muchos datos | Se vuelve lento: te bajas todo | Bien: solo bajas lo que se ve |
| El PDF y los contadores | Solo de lo cargado | De todo lo que cumple el filtro |
| El enunciado dice | «un filtro», «un buscador» | «el backend admite `?estado=`», «`curl` devuelve solo…» |

Regla práctica: si el enunciado habla de parámetros de la URL, de `curl` o de que «el
backend» filtre, es **servidor**. Si habla de la pantalla, **cliente**.

Si te dejan elegir y hay prisa: cliente. Se hace en tres pasos y se explica bien.

## 2. Lo que necesitas saber

**`ref`**: una caja que Vue vigila. Si su valor cambia, se repinta lo que lo usa. En el
script se lee y se escribe con `.value`; en el template, **sin** `.value`.

**`v-model`**: ata un campo del formulario a un dato en los dos sentidos. En un `<select>`,
lo que se guarda es el `:value` de la opción elegida, no el texto que se ve.

**`computed`**: un dato que sale de otros. No lo asignas: escribes la fórmula y Vue la
recalcula cuando cambia algo de lo que lee. Es la pieza de **todos** los filtros del cliente.

**`filter` e `includes`**: `lista.filter((x) => condición)` devuelve un array **nuevo** con
los que cumplen la condición, sin tocar el original. `texto.includes("ab")` dice si el texto
contiene «ab». Con una cadena vacía, `includes("")` es siempre `true`: por eso un buscador
vacío deja pasar todo, sin tener que escribir un caso aparte.

**Parámetros de la URL** (`?pacienteDNI=12345678Z&estado=pendente`): lo que va detrás del
`?`. En Express se leen en `req.query`; con axios se mandan en `{ params: {...} }`.

**La fórmula del filtro opcional**: `(!filtro || cumple)`. Si el filtro está vacío, pasa
todo; si tiene valor, tiene que cumplirse. Se repite en todo este documento.

**Fechas y horas como texto**: en este proyecto la fecha es `aaaa-mm-dd` y la hora `hh:mm`.
Los dos formatos se comparan con `<`, `>` y `===` **sin convertirlos**, porque están
ordenados de lo más general a lo más concreto. Es el motivo de que se guarden así.

## 3. Las piezas de tu proyecto

Qué hay en cada sitio cuando filtras citas:

| Fichero | Qué hay dentro | Para qué lo usas |
|---|---|---|
| `src/components/Citas.vue` | `citas`, `doctores`, `cargando`, `etiquetaEstado()`, `nombreDoctor()`, `nombrePaciente()` | Añadir los filtros y la lista filtrada |
| `src/api/citas.js` | `getCitas(filtros)` → `axios.get(URL, { params: filtros })` | Mandar parámetros nuevos sin tocar nada |
| `backend/rutas/citas.rutas.js` | `router.get("/")` con un objeto `filtros` | Leer parámetros nuevos |
| `src/store/pacienteStore.js` y `doctorStore.js` | Quién está seleccionado | Lo que ya filtra la pantalla al entrar |

Tres cosas de tu proyecto que conviene tener claras antes de empezar:

1. **No hay componente de tabla.** La cabecera y las filas están escritas a mano en cada
   pantalla, con `<th>` y `<td>`. Añadir o quitar una columna son siempre **dos** cambios.
2. **Pinia no guarda las listas.** Solo guarda quién está seleccionado. Las listas viven en
   un `ref` dentro de cada componente.
3. **`XestionPacientes.vue` no importa `computed`.** Solo `ref`, `reactive` y `onMounted`.
   Cualquier filtro que hagas ahí empieza por arreglar ese import.

## 4. Filtrar por estado

El caso más pedido. Tres piezas, siempre las mismas.

**El valor del filtro.** En `Citas.vue`, con los demás `ref`:

```js
// "" significa "todos". ref porque es un valor suelto.
const filtroEstado = ref("")
```

**La lista filtrada.** Un `computed`, nunca una variable normal:

```js
// La lista original no se toca: computed devuelve una lista NUEVA.
// Si el filtro esta vacio, se devuelven todas.
const citasFiltradas = computed(() =>
  filtroEstado.value
    ? citas.value.filter((item) => item.estado === filtroEstado.value)
    : citas.value
)
```

**El selector y la tabla.** En el template:

```vue
        <select v-model="filtroEstado">
          <option value="">Todos los estados</option>
          <option value="pendente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="realizada">Realizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
```

Y en el `v-for` de la tabla, cambiar `citas` por `citasFiltradas`.

**Ese tercer paso es el que se olvida.** Sin él el filtro funciona perfectamente y la tabla
sigue mostrando todo, que es el fallo más desesperante de depurar porque no da ningún error.

Los `value` tienen que ser los que guarda el backend (`pendente`, con «e»), no las etiquetas
que se ven. Para eso está `etiquetaEstado()`.

### Dos filtros a la vez

No se encadenan dos `computed`: se juntan las condiciones con `&&`.

```js
const citasFiltradas = computed(() =>
  citas.value.filter(
    (item) =>
      // Cada linea es "o el filtro esta vacio, o se cumple".
      (!filtroEstado.value || item.estado === filtroEstado.value) &&
      (!filtroDoctor.value || String(item.doctorId) === String(filtroDoctor.value))
  )
)
```

Esa estructura crece sin despeinarse: cada filtro nuevo es una línea más con `&&`.

## 5. Buscador de texto

Buscar en varios campos a la vez, sin distinguir mayúsculas **ni tildes**.

```js
const busqueda = ref("")

// Pasa a minusculas y quita las tildes.
// normalize("NFD") separa la letra de su tilde: "á" pasa a ser "a" + la tilde suelta.
// Luego se borran esas marcas, que estan en el rango unicode 0300-036f.
function normalizar(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

const pacientesFiltrados = computed(() => {
  const q = normalizar(busqueda.value).trim()

  // includes("") es siempre true, pero este atajo evita normalizar toda la lista.
  if (!q) {
    return pacientes.value
  }

  return pacientes.value.filter((p) =>
    // Se juntan los campos en los que se quiere buscar y se mira si contiene el texto.
    normalizar(`${p.nomepac} ${p.apelpac} ${p.dnipac} ${p.mailpac}`).includes(q)
  )
})
```

```vue
        <input v-model="busqueda" type="search" placeholder="Buscar...">
```

Lo de las tildes es lo que separa un buscador que funciona de uno que no encuentra «López»
si escribes «lopez». Merece la pena escribirlo bien.

En `XestionPacientes.vue` hace falta **añadir `computed`** al import de Vue.

### Que no busque en cada tecla

Con muchos registros, o si la búsqueda va al servidor, conviene esperar a que el usuario pare
de escribir:

```js
let temporizador = null

watch(busqueda, () => {
  // clearTimeout cancela el aviso anterior: solo sobrevive el ultimo.
  clearTimeout(temporizador)
  temporizador = setTimeout(cargarDatos, 400)
})
```

Eso es un *debounce*. Con el filtro en el cliente no hace falta: no hay red de por medio.

## 6. Rango de fechas

Dos campos `type="date"` y dos comparaciones de texto.

```js
const desde = ref("")
const hasta = ref("")

const citasFiltradas = computed(() =>
  citas.value.filter(
    (item) =>
      (!desde.value || item.fecha >= desde.value) &&
      (!hasta.value || item.fecha <= hasta.value)
  )
)
```

No hace falta `new Date()` en ningún momento: los dos lados son textos `aaaa-mm-dd` y se
comparan directamente. Si alguna vez lo conviertes, recuerda que `new Date("2026-11-18")` se
interpreta en UTC y puede darte el día anterior.

### Hoy, futuras y pasadas

```js
// toLocaleDateString("sv-SE") da aaaa-mm-dd en hora LOCAL. Es el atajo corto.
const hoy = new Date().toLocaleDateString("sv-SE")

const citasFiltradas = computed(() => {
  if (periodo.value === "hoy") {
    return citas.value.filter((item) => item.fecha === hoy)
  }
  if (periodo.value === "futuras") {
    return citas.value.filter((item) => item.fecha > hoy)
  }
  if (periodo.value === "pasadas") {
    return citas.value.filter((item) => item.fecha < hoy)
  }
  return citas.value
})
```

## 7. Filtrar por especialidad a través del doctor

La cita **no guarda** la especialidad: guarda `doctorId`. Así que hay que pasar por la lista
de doctores, que ya está cargada en `Citas.vue`.

```js
const filtroEspecialidad = ref("")

// Las especialidades que realmente tienen doctores, sin repetir y ordenadas.
const especialidades = computed(() =>
  [...new Set(doctores.value.map((d) => d.espedoc))].filter(Boolean).sort()
)

// Los ids de los doctores de la especialidad elegida.
// Se calcula aparte para no recorrer la lista de doctores en cada fila de la tabla.
const idsDeLaEspecialidad = computed(() =>
  doctores.value
    .filter((d) => d.espedoc === filtroEspecialidad.value)
    .map((d) => String(d._id))
)

const citasFiltradas = computed(() =>
  filtroEspecialidad.value
    ? citas.value.filter((item) => idsDeLaEspecialidad.value.includes(String(item.doctorId)))
    : citas.value
)
```

Eso es **un filtro a través de una relación**, y es de lo que más valoran: demuestra que
entiendes que los datos están repartidos en dos colecciones.

El `String(...)` en los dos lados no es decorativo: el `_id` de MongoDB llega como texto en
unos sitios y como objeto en otros, y `===` entre los dos daría `false` siempre.

## 8. Ordenar y paginar

### Ordenar pulsando la cabecera

```js
const campoOrden = ref("fecha")
const ascendente = ref(true)

function ordenarPor(campo) {
  if (campoOrden.value === campo) {
    // Mismo campo: se invierte el sentido.
    ascendente.value = !ascendente.value
  } else {
    campoOrden.value = campo
    ascendente.value = true
  }
}

const citasOrdenadas = computed(() => {
  // [...lista] hace una COPIA: sort() ordena el array en el sitio y
  // modificar la lista original dentro de un computed es un error que da
  // bucles de repintado.
  return [...citasFiltradas.value].sort((a, b) => {
    const x = a[campoOrden.value] ?? ""
    const y = b[campoOrden.value] ?? ""
    // localeCompare ordena textos respetando tildes y la ñ. Devuelve -1, 0 o 1.
    const resultado = String(x).localeCompare(String(y), "es", { numeric: true })
    return ascendente.value ? resultado : -resultado
  })
})
```

```vue
            <th @click="ordenarPor('fecha')" style="cursor: pointer">
              Fecha {{ campoOrden === 'fecha' ? (ascendente ? '▲' : '▼') : '' }}
            </th>
```

El `[...lista]` antes de `sort` es el detalle que más se olvida y el que más problemas raros
da.

### Paginar

```js
const pagina = ref(1)
const porPagina = 5

// Math.ceil redondea hacia arriba: 11 elementos de 5 en 5 son 3 paginas.
// El || 1 evita que salga "pagina 1 de 0" con la lista vacia.
const totalPaginas = computed(() =>
  Math.ceil(citasOrdenadas.value.length / porPagina) || 1
)

const citasPagina = computed(() => {
  const inicio = (pagina.value - 1) * porPagina
  // slice(desde, hasta) corta un trozo sin tocar el original.
  return citasOrdenadas.value.slice(inicio, inicio + porPagina)
})

// Al cambiar un filtro hay que volver a la pagina 1: si estabas en la 3 y
// el filtro deja dos paginas, la tabla saldria vacia.
watch([filtroEstado, busqueda], () => {
  pagina.value = 1
})
```

Ese `watch` es, otra vez, lo que se olvida.

### La cadena completa

```
citas  →  citasFiltradas  →  citasOrdenadas  →  citasPagina  →  la tabla
```

Cada `computed` lee el anterior. Así cada uno hace **una** cosa y se pueden quitar o añadir
eslabones sin tocar los demás. Y el `v-for` de la tabla lee **el último**.

## 9. Limpiar filtros y contar resultados

```js
function limpiarFiltros() {
  filtroEstado.value = ""
  busqueda.value = ""
  desde.value = ""
  hasta.value = ""
  pagina.value = 1
}

// ¿Hay algún filtro puesto? Sirve para enseñar el botón de limpiar solo cuando hace falta.
const hayFiltros = computed(() =>
  Boolean(filtroEstado.value || busqueda.value || desde.value || hasta.value)
)
```

```vue
        <p>{{ citasFiltradas.length }} de {{ citas.length }} citas</p>
        <button v-if="hayFiltros" type="button" @click="limpiarFiltros">
          Limpiar filtros
        </button>
```

Y el texto de la tabla vacía, que debería distinguir los dos casos:

```js
const textoVacio = computed(() =>
  citas.value.length === 0
    ? "No hay citas cargadas."
    : "Ninguna cita coincide con el filtro."
)
```

Es un detalle pequeño que se nota mucho: «no hay nada» y «no hay nada **con este filtro**»
son problemas distintos para quien usa la aplicación.

## 10. Hacerlo en el servidor

Cuatro capas, de abajo arriba.

**1. Express.** En `backend/rutas/citas.rutas.js`, dentro del `GET /`, el objeto `filtros` ya
existe: se le añaden claves.

```js
        if (req.query.estado) {
            filtros.estado = req.query.estado
        }

        // Rango de fechas. $gte = mayor o igual, $lte = menor o igual.
        // Se construye el objeto poco a poco para admitir solo "desde", solo "hasta" o los dos.
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

**Reinicia el backend.** No recarga solo.

**2. La API.** Nada que hacer: `getCitas(filtros)` ya hace
`axios.get(API_URL, { params: filtros })`, y axios convierte el objeto en `?clave=valor`.

**3. El componente.** Pasar el filtro en la llamada:

```js
    const listaCitas = await getCitas({
      pacienteDNI: dniPaciente,
      doctorId: idDoctor,
      estado: filtroEstado.value || undefined,
    })
```

El `|| undefined` importa: axios **omite** las claves con `undefined`, pero sí manda
`?estado=` si el valor es una cadena vacía, y entonces el backend no filtraría nada… o sí,
según cómo esté escrito el `if`. Con `undefined` no hay duda.

**4. Recargar al cambiar:** `@change="cargarDatos"` en el `<select>`.

### Búsqueda en el servidor

```js
        if (req.query.q) {
            // Se escapan los caracteres especiales para que una busqueda con "." o "("
            // no se interprete como expresion regular y reviente.
            const texto = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            // "i" = sin distinguir mayusculas. $or = vale si cumple cualquiera.
            const patron = new RegExp(texto, "i")
            filtros.$or = [{ motivo: patron }, { pacienteDNI: patron }]
        }
```

Lo de escapar los caracteres es lo que diferencia una búsqueda profesional de una que se
rompe cuando alguien escribe un paréntesis.

### Paginación con el total

```js
        const limite = Number(req.query.limit) || 10
        const pagina = Number(req.query.page) || 1

        // countDocuments cuenta TODOS los que cumplen el filtro, no solo esta pagina.
        const total = await Cita.countDocuments(filtros)

        const citas = await Cita.find(filtros)
            .sort({ fecha: 1, hora: 1 })
            // skip salta los de las paginas anteriores, limit coge los de esta.
            .skip((pagina - 1) * limite)
            .limit(limite)
            .lean()

        // El total viaja en una cabecera, para no cambiar la forma de la respuesta.
        res.set("X-Total-Count", total)
        res.json(citas)
```

Y en `server.js`, `app.use(cors({ exposedHeaders: ["X-Total-Count"] }))`: **sin eso el
navegador no deja leer la cabecera** aunque el servidor la mande. Es el fallo clásico de esta
receta y cuesta una hora encontrarlo si no lo sabes.

## 11. Si te piden esto, mira aquí

| El enunciado dice | Dónde | Apartado |
|---|---|---|
| «filtra las citas por estado» | Cliente | [4](#4-filtrar-por-estado) |
| «un buscador» | Cliente | [5](#5-buscador-de-texto) |
| «entre dos fechas» | Cliente | [6](#6-rango-de-fechas) |
| «por especialidad» | Cliente | [7](#7-filtrar-por-especialidad-a-través-del-doctor) |
| «ordenar al pulsar la cabecera» | Cliente | [8](#8-ordenar-y-paginar) |
| «de cinco en cinco» | Cliente | [8](#8-ordenar-y-paginar) |
| «cuántos resultados hay» | Cliente | [9](#9-limpiar-filtros-y-contar-resultados) |
| «el backend admite `?estado=`» | Servidor | [10](#10-hacerlo-en-el-servidor) |
| «`curl` devuelve solo las de…» | Servidor | [10](#10-hacerlo-en-el-servidor) |
| «con muchos registros» | Servidor | [10](#10-hacerlo-en-el-servidor) |

## 12. Fallos que quitan puntos

1. **No cambiar el `v-for`.** El filtro funciona, la tabla no. Sin error en consola.
2. **Olvidar `.value`** dentro del script. En el template no se pone; en el script, siempre.
3. **Usar una variable normal en vez de `computed`.** Se calcula una vez y no se vuelve a
   recalcular nunca.
4. **`sort()` sin copiar.** Ordena el array original y puede dar bucles de repintado.
5. **Comparar `_id` sin `String(...)`.** Da `false` siempre y el filtro no encuentra nada.
6. **No volver a la página 1** al cambiar un filtro: tabla vacía sin motivo aparente.
7. **No reiniciar el backend** después de tocarlo.
8. **No exponer `X-Total-Count`** en CORS: el total llega siempre `null`.
9. **Olvidar que `XestionPacientes.vue` no importa `computed`.**
10. **Mandar `?estado=` vacío** en vez de omitir la clave.

## 13. Recetas cortas

- [Filtro en el cliente](../funcionalidades/listas/filtro-en-cliente.md)
- [Buscador mientras se escribe](../funcionalidades/listas/buscador.md)
- [Ordenar y paginar](../funcionalidades/listas/ordenar-y-paginar.md)
- [Ordenar por cabecera](../funcionalidades/columnas-y-filtros/ordenar-por-cabecera.md)
- [Combinar filtros y orden](../funcionalidades/columnas-y-filtros/combinar.md)
- [Contadores y el que más](../funcionalidades/columnas-y-filtros/contador-de-resultados.md)
- [Totales y estadísticas](../funcionalidades/listas/estadisticas.md)
- [Filtro en el backend](../funcionalidades/backend/filtro-en-backend.md)
- [Búsqueda en el servidor](../funcionalidades/backend/busqueda.md)
- [Paginación](../funcionalidades/backend/paginacion.md)
- [Ordenar en el servidor](../funcionalidades/backend/orden.md)

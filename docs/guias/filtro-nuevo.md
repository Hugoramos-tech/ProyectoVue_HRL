# Filtro nuevo en un listado

La pregunta que decide todo: **¿el dato ya está en la pantalla, o hay que pedirlo al servidor?**

| Si... | Entonces | Ejemplo en la wiki |
|---|---|---|
| La lista ya está cargada y solo quieres ver una parte | Filtro **en el cliente**: un `ref` para el valor y un `computed` que filtra | [filtro en el cliente](../funcionalidades/listas/filtro-en-cliente.md) |
| Hay muchos registros, o el filtro tiene que afectar al PDF completo | Filtro **en el backend**: un parámetro en la URL y `req.query` en Express | [filtro en el backend](../funcionalidades/backend/filtro-en-backend.md) |

Para un examen, el del cliente se hace en tres minutos y se explica bien. El del backend
demuestra que entiendes `req.query`. Si te dejan elegir, haz el del cliente y menciona que
con muchos datos lo moverías al servidor.

## Receta corta · Filtro en el cliente

Son siempre los mismos tres pasos. Pongamos filtrar pacientes por provincia en
`XestionPacientes.vue`:

**1. El valor del filtro** (junto a los otros `ref` del script):

```js
const filtroProvincia = ref("");
```

**2. La lista filtrada** (un `computed`, debajo del `ref`):

```js
// La lista original no se toca: computed devuelve una lista NUEVA.
// Sin filtro (cadena vacia) se devuelven todos.
const pacientesFiltrados = computed(() =>
  filtroProvincia.value
    ? pacientes.value.filter((p) => p.propac === filtroProvincia.value)
    : pacientes.value
);
```

En `XestionPacientes.vue` hay que **añadir `computed`** al import de Vue: ese fichero solo
importa `ref`, `reactive` y `onMounted`.

**3. El selector y la tabla**: el `<select v-model="filtroProvincia">` en el template, y en
el `v-for` de la tabla cambiar `pacientes` por `pacientesFiltrados`.

El paso 3 es el que más se olvida: si no cambias el `v-for`, el filtro funciona pero la
tabla sigue mostrando todo.

## Receta corta · Filtro en el backend

Cuatro pasos, uno por capa:

**1. Express** (`backend/rutas/citas.rutas.js`), dentro del `GET /`:

```js
  // req.query son los parametros de la URL: ?estado=pendente llega como req.query.estado
  if (req.query.estado) {
    filtros.estado = req.query.estado
  }
```

En tu proyecto el objeto ya existe y se llama `filtros`: se le añaden claves y al final se
le pasa entero a `Cita.find(filtros)`. **Reinicia el backend.**

**2. La API** (`src/api/citas.js`): nada. `getCitas(filtros)` ya hace
`axios.get(API_URL, { params: filtros })`, y axios convierte el objeto en `?clave=valor`.

**3. El componente**: pasar el filtro en la llamada.

```js
citas.value = await getCitas({ pacienteDNI: dniPaciente, estado: filtroEstado.value })
```

**4. Recargar al cambiar**: `@change="cargarDatos"` en el `<select>`, o un `watch`.

La diferencia práctica: en el cliente el filtro es instantáneo y no hay petición; en el
backend hay un viaje al servidor, pero el PDF y los contadores salen sobre **todo** lo
filtrado, no solo sobre lo que estaba cargado.

## Un botón extra en cada fila

Las tablas de este proyecto están escritas a mano, así que un botón nuevo es un `<button>`
más dentro de la celda de acciones:

- En pacientes, la celda termina con el botón del emoji `✅`/`👤`.
- En doctores, la celda es `<td class="celda-acciones">`.
- En citas, es `<td class="citas-celda-acciones">`.

Pega el `<button>` nuevo dentro de esa celda, después del `</button>` del último que haya.
Hay un ejemplo completo en [ruta con parámetro](../funcionalidades/pantallas/ruta-con-parametro.md), Paso 3.2.

## Recetas relacionadas

- [Filtro en el cliente](../funcionalidades/listas/filtro-en-cliente.md)
- [Filtro en el backend](../funcionalidades/backend/filtro-en-backend.md)
- [Buscador mientras se escribe](../funcionalidades/listas/buscador.md)
- [Filtros en pacientes](../funcionalidades/columnas-y-filtros/filtro-pacientes.md)
- [Combinar filtros y orden](../funcionalidades/columnas-y-filtros/combinar.md)

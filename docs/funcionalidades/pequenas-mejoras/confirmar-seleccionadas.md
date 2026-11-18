# Confirmar varias citas a la vez

Una casilla junto a la fecha de cada cita y un botón «Confirmar seleccionadas» encima de la tabla: todas las marcadas pasan a «confirmada» de una vez.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Necesitas varias citas pendientes.

## La idea

Un `v-model` sobre un **array** con casillas de verificación guarda los `value` de las que están marcadas. Aquí cada casilla vale el `_id` de su cita.

El botón recorre esa lista y manda un `PUT` por cada una. Las peticiones se lanzan **a la vez** con `Promise.all` y la tabla se recarga **una sola vez** al final, no después de cada cita.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | La lista de marcadas, la función, la casilla y el botón |

## Paso 1 · Los imports

**No hay que tocar nada.** `ref` y `updateCita` ya están importados:

```js
import { computed, onMounted, reactive, ref, watch } from "vue"
import { deleteCita, getCitas, saveCita, updateCita } from "../api/citas.js"
```

## Paso 2 · La lógica

Busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega esto **justo encima**:

```js
// Los _id de las citas marcadas. Una casilla con v-model sobre un ARRAY anade
// o quita su `value` de la lista al marcarse y desmarcarse.
const seleccionadas = ref([])

async function confirmarSeleccionadas() {
  // Se guarda el total antes, porque la lista se vacia al final.
  const cuantas = seleccionadas.value.length

  try {
    // .map convierte cada id en una peticion PUT; Promise.all las lanza todas a la
    // vez y espera a que acaben. Si una falla, Promise.all rechaza y entra en el catch.
    await Promise.all(
      seleccionadas.value.map((id) => updateCita(id, { estado: "confirmada" }))
    )

    // Se vacian las casillas y se recarga la tabla UNA sola vez.
    seleccionadas.value = []
    await cargarDatos()
    await alertaExito(`${cuantas} cita(s) confirmadas.`)
  } catch (error) {
    alertaError(mensajeError(error, "No se pudieron confirmar las citas."))
    // Se recarga igual, para que la tabla refleje las que si se guardaron.
    await cargarDatos()
  }
}
```

> `updateCita`, `cargarDatos`, `alertaExito`, `alertaError` y `mensajeError` ya existen en este fichero.

## Paso 3 · La casilla

En el `<template>`, busca la línea `<td>{{ item.fecha }} · {{ item.hora }}</td>` y **sustitúyela** por:

```vue
              <td>
                <label class="flex items-center gap-2">
                  <!-- v-model sobre el array + :value="item._id": al marcar, el _id de
                       esta cita entra en la lista; al desmarcar, sale.
                       :disabled apaga la casilla de las que ya estan confirmadas. -->
                  <input
                    v-model="seleccionadas"
                    type="checkbox"
                    :value="item._id"
                    :disabled="item.estado === 'confirmada'"
                  >
                  {{ item.fecha }} · {{ item.hora }}
                </label>
              </td>
```

## Paso 4 · El botón

Busca la línea `<div class="citas-cabecera-lista">` y pega esto **justo encima**:

```vue
      <!-- El boton solo existe si hay alguna casilla marcada -->
      <button
        v-if="seleccionadas.length > 0"
        class="citas-boton-principal mb-3"
        type="button"
        :disabled="cargando"
        @click="confirmarSeleccionadas"
      >
        Confirmar seleccionadas ({{ seleccionadas.length }})
      </button>
```

## Variante · Marcar todas de golpe

Una casilla en la cabecera que marca o desmarca todas. En el Paso 2 añade:

```js
// Un computed con get y set: se puede leer Y escribir con v-model.
const todasMarcadas = computed({
  // get: esta marcada si hay citas y todas estan en la lista
  get: () => citas.value.length > 0 && seleccionadas.value.length === citas.value.length,
  // set: recibe true o false segun como quede la casilla
  set: (valor) => {
    seleccionadas.value = valor ? citas.value.map((item) => item._id) : []
  },
})
```

Y en la cabecera de la tabla, busca `<th>Fecha y hora</th>` y **sustitúyela** por:

```vue
              <th>
                <input
                  v-model="todasMarcadas"
                  type="checkbox"
                  title="Marcar todas"
                >
                Fecha y hora
              </th>
```

Un `computed` con `get` y `set` es la forma de atar un `v-model` a algo que no es un `ref` suelto. Es el único sitio de la wiki donde aparece, y queda bien en un examen.

## Variante · Borrar las seleccionadas

Lo mismo, pero con `deleteCita` y con confirmación, que borrar no se deshace:

```js
async function eliminarSeleccionadas() {
  const confirmacion = await alertaConfirmacion(
    `¿Eliminar ${seleccionadas.value.length} cita(s)?`,
    "Eliminar citas"
  )
  if (!confirmacion.isConfirmed) {
    return
  }

  try {
    await Promise.all(seleccionadas.value.map((id) => deleteCita(id)))
    seleccionadas.value = []
    await cargarDatos()
    await alertaExito("Citas eliminadas.")
  } catch (error) {
    alertaError(mensajeError(error, "No se pudieron eliminar las citas."))
    await cargarDatos()
  }
}
```

## Qué deberías ver

1. Una casilla delante de cada fecha, apagada en las citas ya confirmadas.
2. Al marcar una o más, aparece el botón «Confirmar seleccionadas (2)».
3. Al pulsarlo, esas citas pasan a «Confirmada», sale el aviso verde y las casillas se vacían.
4. En la pestaña **Red** de F12 verás varios `PUT` saliendo a la vez, no uno detrás de otro.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Al marcar una se marcan todas | Falta `:value="item._id"` en la casilla |
| El botón no aparece nunca | `seleccionadas` tiene que ser `ref([])`, un array, no `ref(null)` |
| La fecha desaparece de la celda | Falta `{{ item.fecha }} · {{ item.hora }}` dentro del `<td>` nuevo |
| Se confirman unas y otras no | Una petición falló: `Promise.all` para al primer error, pero las ya enviadas se completan |
| `seleccionadas is not defined` | El Paso 2 quedó dentro de otra función |
| Al recargar vuelven a estar pendientes | El `PUT` falló: mira la pestaña Red de F12 |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `v-model` con casillas y un array | Guardar cuáles están marcadas |
| `Promise.all` con `.map` | Lanzar varias peticiones a la vez |
| `computed` con `get` y `set` | Un valor calculado al que también se puede escribir |
| `PUT` parcial | Enviar solo el campo que cambia |

## Guías relacionadas

- [Cambiar el estado desde la tabla](../listas/estado-desde-la-tabla.md)
- [Resaltar por valor](../columnas-y-filtros/resaltar-por-valor.md)
- [Reprogramar una cita](reprogramar-cita.md)

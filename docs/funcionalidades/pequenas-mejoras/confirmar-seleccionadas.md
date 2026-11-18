# Confirmar varias citas a la vez

Una casilla junto a la fecha de cada cita y un botón «Confirmar seleccionadas» encima de la tabla: todas las marcadas pasan a «confirmada» de una vez.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Necesitas varias citas pendientes.

## La idea

Un `v-model` sobre un **array** con casillas de verificación guarda los `value` de las casillas marcadas. Aquí cada casilla vale el `id` de su cita. El botón recorre esa lista y actualiza cada cita. Las peticiones se lanzan a la vez con `Promise.all` y la tabla se recarga una sola vez al final.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | Imports, la lista de marcadas, la función, la casilla y el botón |

## Paso 1 · Los imports

En `src/components/Citas.vue`, hay dos líneas.

Busca `import { computed, watch } from "vue";` y **sustitúyela** por (si ya la cambiaste en otra receta, salta esta):

```js
import { ref, computed, watch } from "vue";
```

Busca la línea `import { datosParaPdf } from "../utils/tabla.js";` y pega esto **justo debajo**:

```js
// La función que hace el PUT de una cita (la que usa el store por dentro)
import { actualizarCita } from "../api/citas.js";
```

## Paso 2 · La lógica

Busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega esto **justo encima**:

```js
// Los id de las citas marcadas con la casilla. Una casilla con v-model sobre un ARRAY añade o quita
// su `value` de la lista al marcarse o desmarcarse.
const seleccionadas = ref([]);

async function confirmarSeleccionadas() {
  try {
    // .map convierte cada id en una petición PUT; Promise.all las lanza todas a la vez y espera a que acaben
    await Promise.all(seleccionadas.value.map((id) => actualizarCita(id, { estado: "confirmada" })));
    // La tabla se recarga UNA vez al final (si usáramos gardarCita se recargaría tras cada cita)
    await citaStore.cargarCitas();
    alertaExito(`${seleccionadas.value.length} citas confirmadas.`);
    seleccionadas.value = []; // se vacían las casillas
  } catch (e) {
    alertaError(mensajeError(e, "Non se puido confirmar as citas."));
  }
}
```

## Paso 3 · La casilla

Busca la línea `<template #acciones="{ fila }">` y pega esto **justo encima**:

```vue
      <!-- #celda-fecha = el hueco de la celda de la columna con clave fecha; `valor` es la fecha que se iba a escribir -->
      <template #celda-fecha="{ fila, valor }">
        <label class="flex items-center gap-2">
          <!-- v-model con el array `seleccionadas` + :value="fila.id": marcar añade el id de esta cita a la lista -->
          <input
            v-model="seleccionadas"
            type="checkbox"
            :value="fila.id"
          >
          {{ valor }}
        </label>
      </template>
```

## Paso 4 · El botón

Busca la línea `<DataTable` y pega esto **justo encima**:

```vue
    <!-- El botón solo existe si hay alguna casilla marcada. {{ ... }} enseña cuántas. -->
    <AppButton
      v-if="seleccionadas.length > 0"
      variante="primario"
      class="mb-3"
      @click="confirmarSeleccionadas"
    >
      Confirmar seleccionadas ({{ seleccionadas.length }})
    </AppButton>
```

## Qué deberías ver

1. Una casilla delante de cada fecha.
2. Al marcar una o más, aparece el botón «Confirmar seleccionadas (2)».
3. Al pulsarlo, esas citas pasan a «Confirmada», sale el aviso verde y las casillas se vacían.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Al marcar una se marcan todas | Falta `:value="fila.id"` en la casilla |
| El botón no aparece | `seleccionadas` no es un array, o falta `.length` en el `v-if` |
| `actualizarCita is not defined` | Falta el Paso 1 |
| La fecha desaparece de la tabla | Falta `{{ valor }}` dentro del hueco |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `v-model` con casillas y un array | Guardar cuáles están marcadas | `03_lecciones/vue/02_v_model.md` |
| `Promise.all` | Lanzar varias peticiones a la vez | `03_lecciones/03_crud_api_rest.md §5` |
| Hueco de celda | Personalizar la celda de la fecha | `03_lecciones/02_router_comunicacion.md` |

## Guías relacionadas

- [Estado desde la tabla](../listas/estado-desde-la-tabla.md)
- [Resaltar por valor](../columnas-y-filtros/resaltar-por-valor.md) (también usa `#celda-fecha`)

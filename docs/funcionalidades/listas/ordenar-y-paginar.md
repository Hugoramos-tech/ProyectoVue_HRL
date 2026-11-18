# Ordenar y paginar

Un desplegable para elegir el orden de las citas, un botón para invertirlo y paginación de cinco en cinco.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Para ver más de una página necesitas más de 5 citas.

## La idea

Las tres cosas se encadenan con `computed`: primero se ordena la lista, después se corta la página que toca, y la tabla lee **la última** de la cadena.

```
citas ─▶ citasOrdenadas ─▶ citasPagina ─▶ tabla
         (ordena)          (corta 5)
```

En este proyecto las funciones auxiliares viven dentro del propio componente, así que **no hace falta crear ningún fichero nuevo**.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | Las funciones, los controles, la lista paginada y la tabla |

## Paso 1 · Los imports

**No hay que tocar nada.** La primera línea del `<script setup>` ya es:

```js
import { computed, onMounted, reactive, ref, watch } from "vue"
```

`ref`, `computed` y `watch` ya están.

## Paso 2 · Orden, página y las dos funciones

Busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega este bloque **justo encima**:

```js
// Orden y paginacion. Cada ref es una caja vigilada: si cambia, la tabla se repinta.
const claveOrden = ref("fecha")  // por que campo se ordena
const ascendente = ref(true)     // true = de menor a mayor
const pagina = ref(1)            // pagina que se ve (la primera es la 1)
const TAMANO = 5                 // citas por pagina (constante: no cambia)

// Devuelve una lista NUEVA ordenada por clave. [...lista] copia el array antes de
// ordenar, porque sort() modifica el array que recibe y no queremos tocar el original.
function ordenarPor(lista, clave, asc) {
  const sentido = asc ? 1 : -1
  return [...lista].sort(
    // localeCompare compara textos respetando tildes y la ñ; numeric pone "9" antes de "10".
    // Multiplicar por el sentido (1 o -1) invierte el resultado.
    (a, b) =>
      String(a[clave] ?? "").localeCompare(String(b[clave] ?? ""), "es", { numeric: true }) *
      sentido
  )
}

// Devuelve solo los elementos de la pagina pedida.
function paginar(lista, pag, tamano) {
  // Pagina 1 empieza en la posicion 0; la 2, en 5 (si el tamano es 5)...
  const inicio = (pag - 1) * tamano
  // slice(desde, hasta) corta un trozo de la lista sin modificarla
  return lista.slice(inicio, inicio + tamano)
}

// La cadena. Si ya hiciste la receta del filtro, cambia las DOS apariciones de
// `citas.value` de estas tres lineas por `citasFiltradas.value`.
const citasOrdenadas = computed(() => ordenarPor(citas.value, claveOrden.value, ascendente.value))
const citasPagina = computed(() => paginar(citasOrdenadas.value, pagina.value, TAMANO))
// Math.ceil redondea hacia arriba: 11 citas / 5 = 2,2 -> 3 paginas.
// Math.max(1, ...) evita que ponga "1 / 0" cuando no hay ninguna.
const totalPaginas = computed(() => Math.max(1, Math.ceil(citas.value.length / TAMANO)))

// Si cambia el orden o el total de citas, se vuelve a la primera pagina.
// Si no, puedes quedarte en la pagina 4 de una lista que ahora solo tiene 2.
watch([claveOrden, ascendente, () => citas.value.length], () => {
  pagina.value = 1
})
```

## Paso 3 · Los controles

En el `<template>`, busca la línea `<div class="citas-cabecera-lista">` y pega esto **justo encima**:

```vue
      <div class="mb-3 flex flex-wrap items-center gap-3">
        <select v-model="claveOrden">
          <option value="fecha">Ordenar por data</option>
          <option value="hora">Ordenar por hora</option>
          <option value="estado">Ordenar por estado</option>
          <option value="motivo">Ordenar por motivo</option>
        </select>
        <!-- ascendente = !ascendente invierte el valor: true pasa a false y al reves -->
        <button
          class="citas-boton-secundario"
          type="button"
          title="Invertir el orden"
          @click="ascendente = !ascendente"
        >
          {{ ascendente ? "↑" : "↓" }}
        </button>
      </div>
```

## Paso 4 · La tabla lee la página

**4.1** Busca la línea `v-else-if="citas.length"` y **sustitúyela** por:

```vue
        v-else-if="citasOrdenadas.length"
```

> Aquí va `citasOrdenadas`, no `citasPagina`: lo que decide si se enseña la tabla es si hay **alguna** cita, no si hay alguna en esta página.

**4.2** Busca `v-for="item in citas"` y **sustitúyela** por:

```vue
              v-for="item in citasPagina"
```

## Paso 5 · Los botones de página

Busca la línea `</table>` y pega esto **justo debajo**:

```vue
          <!-- :disabled apaga el boton en la primera y en la ultima pagina.
               pagina-- y pagina++ restan y suman 1 -->
          <div class="mt-3 flex items-center justify-end gap-3 text-sm">
            <button
              class="citas-boton-secundario"
              type="button"
              :disabled="pagina === 1"
              @click="pagina--"
            >
              Anterior
            </button>
            <span>{{ pagina }} / {{ totalPaginas }}</span>
            <button
              class="citas-boton-secundario"
              type="button"
              :disabled="pagina === totalPaginas"
              @click="pagina++"
            >
              Seguinte
            </button>
          </div>
```

## Variante · El PDF ordenado y completo

Lo normal es que el PDF traiga **todas** las citas ordenadas, no solo la página que se ve. Dentro de `exportarCitas()`, busca `filas: citas.value.map((item) => [` y **sustitúyela** por:

```js
      filas: citasOrdenadas.value.map((item) => [
```

Si lo que quieres es justo lo contrario (solo la página), pon `citasPagina.value`.

## Qué deberías ver

1. Un desplegable de orden y una flecha encima de «📋 Listado de citas».
2. La tabla muestra 5 citas como máximo.
3. Debajo de la tabla, «1 / 2» con Anterior y Seguinte; Anterior está apagado en la primera página.
4. Elegir otro orden o pulsar la flecha reordena la lista y vuelve a la página 1.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Salen todas las citas | Falta el Paso 4.2: la tabla sigue leyendo `citas` |
| La tabla sale vacía pero hay citas | Estás en una página que ya no existe: el `watch` del Paso 2 es lo que lo evita |
| `paginar is not defined` | El Paso 2 quedó dentro de otra función |
| Ordena mal los números | Falta `{ numeric: true }` en el `localeCompare` |
| El orden cambia también en otras pantallas | Estás ordenando `citas.value` directamente: `ordenarPor` copia antes con `[...lista]` |
| «Seguinte» no se apaga nunca | `totalPaginas` cuenta una lista distinta de la que se pagina |
| Los botones salen fuera de la tabla | El Paso 5 va **dentro** del `<div class="citas-tabla-wrapper">`, justo tras `</table>` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `computed` encadenado | Cada lista parte de la anterior, no de la original |
| `sort` y `[...lista]` | Ordenar una copia para no tocar la lista original |
| `slice` | Cortar un trozo de una lista sin modificarla |
| `watch` | Hacer algo cuando cambia un dato |

## Guías relacionadas

- [Filtro en el cliente](filtro-en-cliente.md)
- [Ordenar por cabecera](../columnas-y-filtros/ordenar-por-cabecera.md)
- [Combinar varios filtros y ordenar](../columnas-y-filtros/combinar.md)

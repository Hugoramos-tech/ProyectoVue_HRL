# Ordenar y paginar

Un desplegable para elegir el orden de las citas, un botón para invertirlo y paginación de cinco en cinco.

*Versión extendida, con variantes y más casos: [apuntes a fondo, apartado 8](../../detalle/01-listas-filtros-y-busqueda.md).*

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Para ver las páginas necesitas más de 5 citas.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/utils/listas.js` | Fichero **nuevo** con las dos funciones |
| `src/components/Citas.vue` | Los controles, la lista paginada y la tabla |

## Paso 1 · Crear `src/utils/listas.js`

Crea el fichero `src/utils/listas.js` con este contenido:

```js
// Devuelve una lista nueva ordenada por `clave`. [...lista] copia el array antes de ordenar,
// porque sort() modifica el array que recibe y no debemos alterar el original del store.
export function ordenarPor(lista, clave, ascendente = true) {
  const sentido = ascendente ? 1 : -1; // 1 = de menor a mayor; -1 = al revés
  return [...lista].sort(
    // localeCompare compara dos textos respetando tildes y ñ. Multiplicar por `sentido` invierte el resultado.
    (a, b) => String(a[clave]).localeCompare(String(b[clave]), "es") * sentido
  );
}

// Devuelve solo los elementos de la página pedida (la primera es la 1).
export function paxinar(lista, pagina, tamano) {
  // Página 1 empieza en la posición 0; la 2, en 5 (si el tamaño es 5)...
  const inicio = (pagina - 1) * tamano;
  // slice(desde, hasta) corta un trozo de la lista sin modificarla
  return lista.slice(inicio, inicio + tamano);
}
```

## Paso 2 · Importarlas

En `src/components/Citas.vue`, busca la línea `import { useFormulario } from "../composables/useFormulario.js";` y pega esto **justo debajo**:

```js
import { ordenarPor, paxinar } from "../utils/listas.js";
```

Si la línea `import { computed, watch } from "vue";` no incluye `ref`, **sustitúyela** por `import { ref, computed, watch } from "vue";`.

## Paso 3 · Orden y página

En `src/components/Citas.vue`, busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega este bloque **justo encima**:

```js
// Orden y paginación. Cada ref es una caja vigilada: si cambia, la tabla se repinta.
const claveOrden = ref("fecha");   // por qué campo se ordena
const ascendente = ref(true);      // true = de menor a mayor
const pagina = ref(1);             // página que se ve (empieza en 1)
const TAMANO = 5;                  // citas por página (constante: no cambia)

// Se encadenan: primero se ordena, después se corta la página. Cada computed lee el anterior.
// Si ya hiciste la receta del filtro, cambia `citas.value` por `citasFiltradas.value`.
const citasOrdenadas = computed(() => ordenarPor(citas.value, claveOrden.value, ascendente.value));
const citasPagina = computed(() => paxinar(citasOrdenadas.value, pagina.value, TAMANO));
// Math.ceil redondea hacia arriba: 11 citas / 5 = 2,2 -> 3 páginas. Math.max(1, ...) evita "0 páginas".
const totalPaginas = computed(() => Math.max(1, Math.ceil(citas.value.length / TAMANO)));
```

## Paso 4 · Controles de orden

En `src/components/Citas.vue`, busca el comentario `<!-- Exporta a PDF todas las citas que hay ahora en la tabla -->`. Justo debajo hay un `<template #acciones>`. **Dentro de él, antes del `<AppButton`**, pega:

```vue
<!-- @change="pagina = 1": al cambiar el criterio se vuelve a la primera página -->
<select v-model="claveOrden" @change="pagina = 1">
  <option value="fecha">Ordenar por data</option>
  <option value="hora">Ordenar por hora</option>
  <option value="estado">Ordenar por estado</option>
</select>
<!-- ascendente = !ascendente: invierte el valor (true pasa a false y al revés) -->
<AppButton title="Invertir el orden" @click="ascendente = !ascendente">
  {{ ascendente ? "↑" : "↓" }}
</AppButton>
```

## Paso 5 · La tabla lee la página

Busca la línea `:filas="citas"` y **sustitúyela** por (si hiciste el filtro, ya dirá `citasFiltradas`; sustitúyela igualmente):

```vue
:filas="citasPagina"
```

## Paso 6 · Botones de página

En `src/components/Citas.vue`, busca el cierre `</DataTable>` y pega esto **justo debajo**:

```vue
<div class="mt-4 flex items-center justify-end gap-3 text-sm">
  <!-- :disabled apaga el botón en la primera/última página. pagina-- y pagina++ restan y suman 1 -->
  <AppButton :disabled="pagina === 1" @click="pagina--">Anterior</AppButton>
  <span>{{ pagina }} / {{ totalPaginas }}</span>
  <AppButton :disabled="pagina === totalPaginas" @click="pagina++">Seguinte</AppButton>
</div>
```

## Qué deberías ver

1. Un desplegable de orden y una flecha junto al botón PDF.
2. La tabla muestra 5 citas como máximo.
3. Abajo, «1 / 2» con Anterior y Seguinte; Anterior está desactivado en la primera página.
4. Elegir otro orden o pulsar la flecha reordena la lista.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Salen todas las citas | La tabla sigue leyendo `citas` o `citasFiltradas`: falta el Paso 5 |
| Un filtro deja la tabla vacía | Estabas en la página 4 y el filtro tiene 3 resultados: añade `watch(filtroEstado, () => { pagina.value = 1 })` |
| El orden cambia también en otras pantallas | Ordenas `citas.value` directamente con `sort`: usa `ordenarPor`, que copia antes |
| «Seguinte» no se desactiva | `totalPaginas` cuenta una lista distinta de la que pagina |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `computed` | Un dato que se calcula solo a partir de otros y se rehace cuando cambian | `03_lecciones/vue/07_computed.md` |
| `ref` | Una caja vigilada: si su valor cambia, la pantalla se repinta | `03_lecciones/01_reactividad.md §2` |
| `v-for` con `:key` | Repite un elemento por cada elemento de una lista | `03_lecciones/vue/03_v_for.md` |

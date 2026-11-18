# Filtro en el cliente y PDF filtrado

Dos desplegables encima de la tabla de citas (**estado** y **doctor**). La tabla cambia al instante y el PDF solo trae las citas que se ven.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Recuerda que esta pantalla solo carga datos si antes seleccionaste un paciente o un doctor en su pestaña.

## La idea

La tabla no pide nada al servidor al filtrar. Las citas ya están en `citas`, y un `computed` se queda con las que cumplen los filtros. Cuando cambias un desplegable, la lista se recalcula sola, y la tabla y el PDF, que la leen, se actualizan.

El filtro por doctor tiene sentido cuando solo has seleccionado un **paciente**: entonces sus citas pueden ser de varios doctores distintos.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | Todo: los filtros, la lista filtrada, la tabla y el PDF |

## Paso 1 · Los imports

**No hay que tocar nada.** La primera línea del `<script setup>` ya es:

```js
import { computed, onMounted, reactive, ref, watch } from "vue"
```

`ref` y `computed` ya están.

## Paso 2 · La lista filtrada

Busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega este bloque **justo encima**:

```js
// Lo que ha elegido el usuario en cada desplegable ("" = todos).
// ref es una caja que Vue vigila: si cambia lo que hay dentro, se recalcula lo que la use.
const filtroEstado = ref("")
const filtroDoctor = ref("")

// Las citas que cumplen los filtros. computed se rehace SOLO cuando cambia algo
// de lo que lee: citas, filtroEstado o filtroDoctor. La lista original no se toca.
const citasFiltradas = computed(() =>
  citas.value.filter(
    (c) =>
      // Pasa si no hay estado elegido (!"" es true) o si el de la cita coincide...
      (!filtroEstado.value || c.estado === filtroEstado.value) &&
      // ...Y pasa si no hay doctor elegido o si el de la cita coincide.
      // idRelacionado() ya existe abajo: deja el doctorId como texto, venga como
      // id suelto o como objeto poblado por Mongoose.
      (!filtroDoctor.value || idRelacionado(c.doctorId) === filtroDoctor.value)
  )
)

// True si hay algun filtro puesto. Sirve para cambiar el texto de "no hay nada".
const hayFiltro = computed(() => Boolean(filtroEstado.value || filtroDoctor.value))
```

## Paso 3 · Los dos desplegables

En el `<template>`, busca la línea `<div class="citas-cabecera-lista">` y pega esto **justo encima**:

```vue
      <!-- v-model ata cada desplegable a su ref: al elegir, el ref cambia y la tabla se recalcula -->
      <div class="mb-3 flex flex-wrap items-center gap-3">
        <select v-model="filtroEstado">
          <option value="">Todos os estados</option>
          <option value="pendente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="realizada">Realizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <select v-model="filtroDoctor">
          <option value="">Todos os doctores</option>
          <!-- Una opcion por doctor cargado. :value guarda su _id, que es con lo que se compara -->
          <option v-for="d in doctores" :key="d._id" :value="d._id">
            {{ d.nomedoc }} {{ d.apeldoc }}
          </option>
        </select>
      </div>
```

> Los valores `pendente`, `confirmada`, `realizada` y `cancelada` son los que guarda el backend. Si pones otro texto, el filtro no encontrará nada.

## Paso 4 · La tabla lee la lista filtrada

**4.1** Busca la línea `v-else-if="citas.length"` (está dentro de un `<div>` repartido en varias líneas, encima de la tabla) y **sustitúyela** por:

```vue
        v-else-if="citasFiltradas.length"
```

**4.2** Busca `v-for="item in citas"` y **sustitúyela** por:

```vue
              v-for="item in citasFiltradas"
```

> Aquí **no hay problema de índices**: los botones de esta tabla reciben la cita entera (`editarCita(item)`), no su número de fila.

## Paso 5 · El texto de «sin resultados»

Busca la línea `No hay citas cargadas.` y **sustitúyela** por:

```vue
        {{ hayFiltro ? "Ningunha cita coincide cos filtros." : "No hay citas cargadas." }}
```

Así distingues «no hay citas» de «hay citas, pero ninguna pasa el filtro», que es justo lo que despista cuando algo no sale.

## Paso 6 · El PDF lee la lista filtrada

Dentro de `exportarCitas()`, busca `filas: citas.value.map((item) => [` y **sustitúyela** por:

```js
      filas: citasFiltradas.value.map((item) => [
```

Y para que el botón se apague cuando el filtro no deja nada, busca `:disabled="cargando || citas.length === 0"` y **sustitúyela** por:

```vue
          :disabled="cargando || citasFiltradas.length === 0"
```

## Variante · El doctor elegido en el título del PDF

Dentro de `exportarCitas()`, el array `filtros` ya recoge el paciente y el doctor seleccionados en Pinia. Si quieres añadir el del desplegable, busca `try {` dentro de esa función y pega **justo encima**:

```js
  // Si hay un doctor elegido en el filtro, su nombre se suma a la descripcion del PDF.
  if (filtroDoctor.value) {
    filtros.push(`Filtro: ${nombreDoctor(filtroDoctor.value)}`)
  }
```

`nombreDoctor()` ya existe más abajo en el fichero.

## Qué deberías ver

1. Dos desplegables encima de «📋 Listado de citas».
2. Al elegir un estado, la tabla se queda solo con esas citas, sin recargar la página.
3. Al elegir un doctor, solo sus citas. Los dos filtros se combinan.
4. Con «Todos» en los dos, vuelven todas.
5. Con un filtro que no deja nada, sale «Ningunha cita coincide cos filtros.».
6. El PDF trae solo las filas que ves.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El desplegable cambia pero la tabla no | Falta el Paso 4.1 o el 4.2: la tabla sigue leyendo `citas` |
| Al filtrar por estado no queda nada | El `value` del `<option>` debe ser `pendente`, no `Pendiente` |
| Al filtrar por doctor no queda nada | Falta `idRelacionado()` en la comparación: `doctorId` puede llegar como objeto |
| El desplegable de doctores sale vacío | Los doctores aún no han cargado: esta pantalla solo los pide si hay una selección |
| El PDF sigue trayendo todas | Falta el Paso 6 |
| Sale «No hay citas cargadas» con filtros puestos | Falta el Paso 5 |
| `hayFiltro is not defined` | El Paso 2 quedó dentro de otra función |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `computed` | Un dato que se calcula solo y se rehace cuando cambia lo que lee |
| `ref` | Una caja vigilada: si su valor cambia, la pantalla se repinta |
| `v-model` en un `select` | Ata el desplegable a un dato |
| `filter` | Se queda con los elementos para los que la función devuelve `true` |

## Guías relacionadas

- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)
- [Filtros de especialidad y fecha en citas](../columnas-y-filtros/filtro-citas-especialidad-y-fecha.md)
- [Combinar varios filtros y ordenar](../columnas-y-filtros/combinar.md)

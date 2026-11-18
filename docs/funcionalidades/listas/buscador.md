# Buscador de texto

Un campo en la página de doctores que filtra mientras escribes, por nombre o apellidos, sin importar mayúsculas ni tildes.

*Versión extendida, con variantes y más casos: [apuntes a fondo, apartado 5](../../detalle/01-listas-filtros-y-busqueda.md).*

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Doctores** (`/xestionDoctores`).

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionDoctores.vue` | Todo: la función de comparar, el campo, la lista filtrada y la tabla |

> En este proyecto no hay carpeta `src/utils/texto.js`: las funciones de apoyo
> (como `capitalizarNome`) viven dentro del propio componente. Seguimos ese estilo.

## Paso 1 · La función `normalizar`

En `src/components/XestionDoctores.vue`, busca la función `capitalizarNome` y pega esto **justo encima**:

```js
// Quita las tildes y pasa a minusculas, para que "lopez" encuentre "López".
// normalize("NFD") separa cada letra de su tilde ("é" -> "e" + ´); el replace borra las tildes sueltas.
function normalizar(texto) {
  return String(texto) // String(...) por si llega un numero o undefined
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}
```

## Paso 2 · Los imports

**No hay que tocar nada.** La primera línea del `<script setup>` ya es:

```js
import { computed, onMounted, reactive, ref } from "vue";
```

`computed` y `ref` ya están importados, que es lo único que necesita este apartado.

## Paso 3 · El texto buscado y la lista visible

Busca la línea `const especialidades = ref([]);` y pega esto **justo debajo**:

```js
// Lo que se ha escrito en el buscador. ref = caja vigilada por Vue.
const busca = ref("");

// Los doctores que contienen lo escrito. Parte de `doctores`, la lista que
// rellena cargarDoctores() desde la API.
// computed = se recalcula solo cuando cambia `busca` o la lista de doctores.
const doctoresVisibles = computed(() => {
  // trim quita espacios sobrantes; normalizar quita tildes y mayusculas
  const q = normalizar(busca.value.trim());
  // Con el buscador vacio no se filtra nada
  if (!q) return doctores.value;
  // includes(q) = "el texto contiene lo buscado". Se busca en nombre y apellidos juntos.
  return doctores.value.filter((doctor) =>
    normalizar(`${doctor.nomedoc} ${doctor.apeldoc}`).includes(q)
  );
});
```

Qué hace: con el buscador vacío devuelve todos. Si hay texto, deja los doctores cuyo nombre y apellidos contienen ese texto.

## Paso 4 · El campo de búsqueda

En el `<template>`, busca el bloque `<div class="cabecera-informe">` y pega esto **justo encima**:

```vue
<!-- v-model: lo que se escribe llega a `busca` en cada tecla, y la tabla se filtra al instante -->
<input
  v-model="busca"
  type="search"
  placeholder="Buscar por nombre o apellidos"
  class="mb-4 w-full max-w-sm rounded-lg border border-[#cfe0d6] px-3 py-2"
>
```

## Paso 5 · La tabla lee la lista visible

En el mismo `<template>` hay **tres** líneas que cambiar.

Busca `<div v-if="doctores.length" class="tabla-doctores">` y **sustitúyela** por:

```vue
<div v-if="doctoresVisibles.length" class="tabla-doctores">
```

Busca `<tr v-for="doctor in doctores" :key="doctor._id">` y **sustitúyela** por:

```vue
<tr v-for="doctor in doctoresVisibles" :key="doctor._id">
```

Busca `<p v-else class="lista-vacia">Non hai doctores cargados.</p>` y **sustitúyela** por:

```vue
<p v-else class="lista-vacia">
  {{ busca ? "Ningún doctor coincide coa busca." : "Non hai doctores cargados." }}
</p>
```

Qué hace: si hay algo escrito en el buscador, el texto de «tabla vacía» dice que ningún doctor coincide; si el buscador está vacío, que no hay doctores. Es un `condición ? si_cierto : si_falso`.

## Paso 6 · El PDF respeta la búsqueda (opcional)

Dentro de `exportarDoctores()`, busca `filas: doctores.value.map((doctor) => [` y **sustitúyela** por:

```js
      filas: doctoresVisibles.value.map((doctor) => [
```

Y para que el botón se apague cuando la búsqueda no encuentra nada, busca `:disabled="doctores.length === 0"` y **sustitúyela** por:

```vue
:disabled="doctoresVisibles.length === 0"
```

## Qué deberías ver

1. Un campo de búsqueda encima del título «Listaxe de doctores».
2. Escribes `lopez` y salen los que se apellidan López (con tilde o sin ella).
3. Escribes algo que no existe: sale «Ningún doctor coincide coa busca.», no una tabla vacía.
4. Exportas el PDF con algo escrito: solo salen los doctores que se ven.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `normalizar is not defined` | Falta el Paso 1, o lo pegaste fuera del `<script setup>` |
| Escribes y no pasa nada | Falta el Paso 5: la tabla sigue leyendo `doctores` |
| `computed is not defined` | Mira el Paso 2: revisa que la línea del import siga entera |
| «lopez» no encuentra «López» | La función no quita las tildes: revisa el Paso 1 |
| La tabla desaparece al escribir | Cambiaste el `v-for` pero no el `v-if` del Paso 5 |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `computed` | Un dato que se calcula solo a partir de otros y se rehace cuando cambian |
| `v-model` | Ata un campo del formulario a un dato en los dos sentidos |
| `v-for` con `:key` | Repite un elemento por cada elemento de una lista |

## Guías relacionadas

- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)

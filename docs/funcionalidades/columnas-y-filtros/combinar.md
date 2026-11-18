# Combinar varios filtros y un orden en la misma tabla

Cada receta de filtro cambia las mismas líneas del `v-for` y del `v-if`. Si haces varias, la segunda ya no encuentra lo que busca. La solución es encadenar: cada paso lee la lista del paso anterior, y la tabla lee la última.

## La idea

```
pacientes ─▶ por provincia ─▶ por edad ─▶ ordenados ─▶ tabla
              (computed)       (computed)  (computed)
```

Cada `computed` parte de **otra lista**, no de `pacientes.value`.

## Cómo se hace

1. Haz la primera receta tal cual. La tabla pasa a leer, por ejemplo, `pacientesPorLugar`.
2. En la receta siguiente, **en vez de** `pacientes.value.filter(` escribe `pacientesPorLugar.value.filter(`, y llama a la lista nueva `pacientesPorEdad`.
3. Las líneas de la tabla ya no dirán `pacientes`, sino `pacientesPorLugar`. Sustitúyelas por `pacientesPorEdad`.
4. Haz lo mismo con el orden: `[...pacientesPorEdad.value].sort(...)` y la tabla lee `pacientesOrdenados`.
5. El PDF lee la **última** lista de la cadena.

## Ejemplo con tres pasos

En el `<script setup>`:

```js
const pacientesPorLugar = computed(() => pacientes.value.filter(/* provincia y municipio */));
const pacientesPorEdad = computed(() => pacientesPorLugar.value.filter(/* edad */));
const pacientesOrdenados = computed(() => [...pacientesPorEdad.value].sort(/* columna */));
```

En el `<template>`, las **cuatro** líneas de la tabla apuntan a la última lista:

```vue
    <div v-if="pacientesOrdenados.length > 0" class="tabla-wrapper">
```
```vue
          <tr v-for="u in pacientesOrdenados" :key="u.dnipac">
```
```vue
              {{ pacientesOrdenados.indexOf(u) + 1 }}
```

Y en `exportarPacientes()`:

```js
      filas: pacientesOrdenados.value.map((paciente) => [
```

## Lo que NO cambia al encadenar

Los botones de editar y eliminar siguen necesitando la posición en la lista **completa**, nunca en la filtrada:

```vue
                @click="editarPaciente(pacientes.indexOf(u))"
                @click="eliminarPaciente(pacientes.indexOf(u))"
```

Esto se escribe una sola vez y vale para toda la cadena, porque `pacientes` es siempre la lista original.

## Qué orden poner

Primero los filtros (da igual cuál va antes) y **al final** el orden: ordenar menos filas es más rápido y el resultado es el mismo.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Un filtro no hace nada | El siguiente paso lee `pacientes.value` en vez del paso anterior |
| La tabla ignora los filtros nuevos | Alguna de las cuatro líneas de la tabla sigue apuntando a la lista antigua |
| Error `is not defined` | Orden de las líneas: define las listas de la cadena de la primera a la última |
| El contador de fila salta números | La numeración debe usar la **última** lista de la cadena, no `pacientes` |
| Borra al paciente equivocado | Los botones deben seguir usando `pacientes.indexOf(u)` |

## Guías relacionadas

- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)
- [Filtros en pacientes](filtro-pacientes.md)
- [Filtro por rango de edad](filtro-rango-de-edad.md)
- [Filtro de provincia y municipio](filtro-municipio-en-cascada.md)
- [Ordenar por cabecera](ordenar-por-cabecera.md)

# Filtro de provincia y municipio en cascada

Dos desplegables encima de la tabla de pacientes. Al elegir una provincia, el segundo solo ofrece los municipios de esa provincia. La tabla muestra los pacientes que cumplan lo elegido.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). El formulario de la página ya tiene los dos desplegables en cascada (`cargarMunicipios`): esta receta repite la idea, pero para filtrar la tabla.

## La idea

Los municipios se enlazan con su provincia por un código (`id`), pero el paciente guarda los **nombres** (`propac: "Pontevedra"`). Para el filtro se busca la provincia elegida, se coge su `id`, y con él se piden sus municipios al servidor con `obtenerMunicipios(id)`.

**Diferencia importante con el formulario:** pedir los municipios es una petición al servidor, así que **no puede hacerse con un `computed`** (un computed no espera). Se hace con un `watch` que guarda el resultado en un `ref`.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | Los imports, los dos filtros, la lista filtrada, los desplegables y la tabla |

## Paso 1 · Los imports

Esta pantalla no importa ni `computed` ni `watch`. Busca:

```js
import { ref, reactive, onMounted } from "vue";
```

y **sustitúyela** por:

```js
import { ref, reactive, onMounted, computed, watch } from "vue";
```

> `obtenerMunicipios` y `obtenerProvincias` ya están importados arriba: no hay que tocarlos.

## Paso 2 · La lógica

Busca la línea `const pacienteStore = usepacienteStore();` y pega esto **justo debajo**:

```js
// Lo elegido en los dos desplegables del filtro ("" = todos)
const provinciaFiltro = ref("");
const municipioFiltro = ref("");
// Los municipios que ofrece el segundo desplegable. Se rellenan desde el servidor.
const municipiosFiltro = ref([]);

// watch vigila un dato y ejecuta algo cuando cambia.
// Al cambiar de provincia: se olvida el municipio anterior y se piden los nuevos.
watch(provinciaFiltro, async (nombreProvincia) => {
  municipioFiltro.value = "";

  // Sin provincia elegida, el segundo desplegable se queda vacio
  if (!nombreProvincia) {
    municipiosFiltro.value = [];
    return;
  }

  // El paciente guarda el NOMBRE de la provincia, pero la API de municipios
  // necesita su `id`: primero se busca la provincia por nombre.
  const provincia = provincias.value.find((p) => p.nm === nombreProvincia);
  if (!provincia) {
    municipiosFiltro.value = [];
    return;
  }

  try {
    municipiosFiltro.value = await obtenerMunicipios(provincia.id);
  } catch {
    municipiosFiltro.value = [];
  }
});

// La lista que se ensena: cumple la provincia (si hay) Y el municipio (si hay)
const pacientesPorLugar = computed(() =>
  pacientes.value.filter(
    (p) =>
      (!provinciaFiltro.value || p.propac === provinciaFiltro.value) &&
      (!municipioFiltro.value || p.munipac === municipioFiltro.value)
  )
);
```

## Paso 3 · Los desplegables

En el `<template>`, busca la línea `<div class="cabecera-informe">` y pega esto **justo encima**:

```vue
    <div class="mb-3 flex flex-wrap items-center gap-3">
      <select v-model="provinciaFiltro">
        <option value="">Todas as provincias</option>
        <option v-for="p in provincias" :key="p.id" :value="p.nm">{{ p.nm }}</option>
      </select>
      <!-- :disabled="!provinciaFiltro": desactivado mientras no haya provincia elegida -->
      <select v-model="municipioFiltro" :disabled="!provinciaFiltro">
        <option value="">Todos os concellos</option>
        <option v-for="m in municipiosFiltro" :key="m.id" :value="m.nm">{{ m.nm }}</option>
      </select>
    </div>
```

## Paso 4 · La tabla lee la lista filtrada

**Ojo con los botones**: reciben el número de fila y con él buscan al paciente en la lista completa. Si la tabla pinta una lista filtrada hay que recalcular la posición real, o editarás y borrarás al paciente equivocado.

**4.1** Busca `<div v-if="pacientes.length > 0" class="tabla-wrapper">` y **sustitúyela** por:

```vue
    <div v-if="pacientesPorLugar.length > 0" class="tabla-wrapper">
```

**4.2** Busca `<tr v-for="(u, index) in pacientes" :key="index">` y **sustitúyela** por:

```vue
          <tr v-for="u in pacientesPorLugar" :key="u.dnipac">
```

**4.3** Busca `@click="editarPaciente(index)"` y `@click="eliminarPaciente(index)"` y **sustitúyelas** por:

```vue
                @click="editarPaciente(pacientes.indexOf(u))"
```
```vue
                @click="eliminarPaciente(pacientes.indexOf(u))"
```

**4.4** Busca `{{ index + 1 }}` y **sustitúyela** por:

```vue
              {{ pacientesPorLugar.indexOf(u) + 1 }}
```

## Paso 5 · El PDF lee la lista filtrada

Dentro de `exportarPacientes()`, busca `filas: pacientes.value.map((paciente) => [` y **sustitúyela** por:

```js
      filas: pacientesPorLugar.value.map((paciente) => [
```

## Qué deberías ver

1. El segundo desplegable está gris hasta que eliges provincia.
2. Elegida «Pontevedra», solo ofrece sus municipios y la tabla muestra los pacientes de esa provincia.
3. Elegido un municipio, solo los de ese municipio.
4. Cambiar de provincia vacía el municipio y recarga la lista de concellos.
5. El PDF trae solo lo que ves.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `watch is not defined` o `computed is not defined` | Falta el Paso 1 |
| El segundo desplegable sale siempre vacío | La provincia no se encuentra por nombre: comprueba que `provincias` ya cargó |
| Se queda el municipio anterior al cambiar de provincia | Falta la primera línea del `watch` (`municipioFiltro.value = ""`) |
| Al elegir provincia no queda nadie | Se compara con el `id` y no con el nombre: usa `:value="p.nm"` |
| Borra al paciente equivocado | Falta el Paso 4.3 |
| Los concellos tardan un momento en salir | Es normal: se piden al servidor cada vez que cambias de provincia |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `watch` | Hacer algo cuando cambia un dato (y aquí, además, esperar a una petición) |
| `computed` | La lista filtrada se recalcula sola |
| Desplegables en cascada | Uno depende de lo elegido en el otro |

## Guías relacionadas

- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)
- [Filtros en pacientes](filtro-pacientes.md)
- [Combinar varios filtros y ordenar](combinar.md)

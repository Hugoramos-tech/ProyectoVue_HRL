# Filtros en la tabla de pacientes: provincia, con correo y mayores de edad

Un desplegable de provincia sobre la tabla de pacientes. Después, dos variantes que se añaden al mismo filtro: una casilla «solo con correo» y otra «solo mayores de edad». La tabla y el PDF solo muestran lo filtrado.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Si ya hiciste otra receta de filtros en este fichero, las líneas de `filtroProvincia` y `pacientesFiltrados` solo se escriben una vez.

## La idea

Nada se pide al servidor: los pacientes ya están cargados en `pacientes`. Un `computed` se queda con los que cumplen lo elegido, y la tabla y el PDF leen esa lista en vez de la completa. Cuando cambias el desplegable, se recalcula solo.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | El import, los filtros, la lista filtrada, la tabla y el PDF |

## Paso 1 · Importar `computed`

Esta pantalla **todavía no importa `computed`**. Busca la línea:

```js
import { ref, reactive, onMounted } from "vue";
```

y **sustitúyela** por:

```js
import { ref, reactive, onMounted, computed } from "vue";
```

> Si te saltas este paso, la consola dirá `computed is not defined`.

## Paso 2 · La lista filtrada

Busca la línea `const pacienteStore = usepacienteStore();` y pega esto **justo debajo**:

```js
// Lo que ha elegido el usuario en el desplegable ("" = todas las provincias).
// ref = una caja vigilada: si cambia lo que hay dentro, todo lo que la lea se recalcula.
const filtroProvincia = ref("");

// computed = una lista que se calcula sola a partir de otros datos y se rehace cuando estos cambian.
// Aqui: los pacientes que cumplen el filtro. `pacientes` NO se toca; es una copia filtrada.
const pacientesFiltrados = computed(() =>
  // filter se queda con los pacientes para los que la funcion devuelve true
  pacientes.value.filter(
    // Pasa si no hay provincia elegida (!"" es true) o si la suya coincide con la elegida
    (p) => !filtroProvincia.value || p.propac === filtroProvincia.value
  )
);
```

## Paso 3 · El desplegable

En el `<template>`, busca la línea `<div class="cabecera-informe">` y pega esto **justo encima**:

```vue
    <!-- Barra de filtros encima de la tabla. flex-wrap: si no caben, bajan a otra linea -->
    <div class="mb-3 flex flex-wrap items-center gap-3">
      <!-- v-model ata el desplegable a `filtroProvincia`: al elegir, el ref cambia y la tabla se recalcula -->
      <select v-model="filtroProvincia">
        <option value="">Todas as provincias</option>
        <!-- v-for repite la opcion por cada provincia; :key identifica cada una; :value es lo que se guarda -->
        <option v-for="p in provincias" :key="p.id" :value="p.nm">{{ p.nm }}</option>
      </select>
    </div>
```

Qué hace: `provincias` ya existe en el fichero (la usa el formulario). Cada opción guarda el **nombre** de la provincia, que es lo que tiene `propac`.

## Paso 4 · La tabla lee la lista filtrada

Aquí hay que cambiar **tres** líneas, y la tercera es importante.

**4.1** Busca `<div v-if="pacientes.length > 0" class="tabla-wrapper">` y **sustitúyela** por:

```vue
    <div v-if="pacientesFiltrados.length > 0" class="tabla-wrapper">
```

**4.2** Busca `<tr v-for="(u, index) in pacientes" :key="index">` y **sustitúyela** por:

```vue
          <tr v-for="u in pacientesFiltrados" :key="u.dnipac">
```

**4.3 · Cuidado con los botones.** Los botones de editar y eliminar reciben el **número de fila** (`index`) y con él buscan al paciente dentro de la lista **completa**:

```js
const paciente = pacientes.value[index];
```

Si la tabla pinta la lista filtrada, la fila 0 de la tabla ya no es la 0 de la lista completa: **borrarías al paciente equivocado**. Por eso en 4.2 se ha quitado el `index`. Ahora busca estas dos líneas:

```vue
                @click="editarPaciente(index)"
```
```vue
                @click="eliminarPaciente(index)"
```

y **sustitúyelas** por estas, que calculan la posición real en la lista completa:

```vue
                @click="editarPaciente(pacientes.indexOf(u))"
```
```vue
                @click="eliminarPaciente(pacientes.indexOf(u))"
```

`indexOf` funciona porque `u` es el mismo objeto que está dentro de `pacientes`: el filtro no copia pacientes, solo los selecciona.

**4.4** La primera columna de la tabla muestra `{{ index + 1 }}`. Como ya no hay `index`, busca:

```vue
              {{ index + 1 }}
```

y **sustitúyela** por:

```vue
              {{ pacientesFiltrados.indexOf(u) + 1 }}
```

## Paso 5 · El PDF lee la lista filtrada

Dentro de `exportarPacientes()`, busca `filas: pacientes.value.map((paciente) => [` y **sustitúyela** por:

```js
      filas: pacientesFiltrados.value.map((paciente) => [
```

Y para que el botón de exportar se apague cuando el filtro no deja a nadie, busca `:disabled="pacientes.length === 0"` y **sustitúyela** por:

```vue
        :disabled="pacientesFiltrados.length === 0"
```

## Variante A · Casilla «solo con correo»

**A1.** Debajo de la línea `const filtroProvincia = ref("");` pega:

```js
// Casilla marcada = true. Empieza sin marcar.
const soloConCorreo = ref(false);
```

**A2.** En el `filter` del Paso 2, sustituye la condición por:

```js
  pacientes.value.filter(
    (p) =>
      // Condicion 1: la provincia (como antes)
      (!filtroProvincia.value || p.propac === filtroProvincia.value) &&
      // Condicion 2: si la casilla esta marcada, solo pasan los que tienen correo
      (!soloConCorreo.value || p.mailpac)
  )
```

**A3.** Dentro del `<div>` del Paso 3, justo debajo del `</select>`, pega:

```vue
      <!-- v-model en un checkbox guarda true/false en `soloConCorreo` -->
      <label class="flex items-center gap-2 text-sm">
        <input v-model="soloConCorreo" type="checkbox"> Solo con correo
      </label>
```

## Variante B · Casilla «solo mayores de edad»

Igual que la A, con otra casilla `soloAdultos`. En tu proyecto la fecha de nacimiento es `nacipac`, un texto `aaaa-mm-dd`, así que se puede comparar como texto.

Antes del `computed`, pega:

```js
const soloAdultos = ref(false);
// La fecha de hace 18 anos, como texto "aaaa-mm-dd" (padStart pone el 0 delante: 5 -> "05")
const hoy = new Date();
const fechaCorte = `${hoy.getFullYear() - 18}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
```

Y añade esta condición al `filter`:

```js
      // Nacer en o antes de la fecha de corte = tener 18 anos o mas.
      (!soloAdultos.value || (p.nacipac && p.nacipac <= fechaCorte))
```

## Qué deberías ver

1. Un desplegable «Todas as provincias» encima del título «Listaxe de pacientes».
2. Al elegir «Pontevedra», solo los pacientes de esa provincia, sin recargar.
3. Con «Todas as provincias» vuelven todos.
4. El PDF trae solo lo que ves.
5. Con un filtro puesto, editar y eliminar siguen actuando sobre el paciente correcto.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `computed is not defined` | Falta el Paso 1 |
| El desplegable sale vacío | Las provincias no han cargado: la página las pide en `onMounted` con `obtenerProvincias()` |
| Al elegir provincia no queda nadie | Se compara con el id y no con el nombre: usa `:value="p.nm"` y `p.propac` |
| `pacientesFiltrados is not defined` | Falta el Paso 2 o se escribió dentro de otra función |
| La tabla no cambia | Falta el Paso 4.1 y 4.2: sigue leyendo `pacientes` |
| `index is not defined` | Hiciste 4.2 pero te falta 4.3 o 4.4 |
| Borra al paciente equivocado | Te falta el Paso 4.3: los botones siguen usando el índice de la lista filtrada |
| La casilla no hace nada | Falta usarla en el `filter`, o escribiste `soloConCorreo` sin `.value` dentro del script |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `computed` | Un dato que se recalcula solo cuando cambian los datos que usa |
| `v-model` en select y checkbox | Ata el campo a un dato en los dos sentidos |
| `ref` | La caja vigilada con lo elegido |
| `filter` | Se queda con los elementos que cumplen una condición |

## Guías relacionadas

- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)
- [Filtro en el cliente (citas)](../listas/filtro-en-cliente.md)

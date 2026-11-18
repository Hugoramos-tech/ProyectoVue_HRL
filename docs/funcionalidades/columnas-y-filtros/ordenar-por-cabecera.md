# Ordenar al pulsar la cabecera de una columna

En la tabla de pacientes, pulsas el título de una columna y la tabla se ordena por ella. Si vuelves a pulsarlo, se invierte el orden.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`).

## La idea

En este proyecto la cabecera `<thead>` está escrita a mano dentro de la propia pantalla, así que **no hace falta ningún `emit` ni ningún componente**: se le pone el `@click` directamente a cada `<th>`.

La pantalla guarda qué columna se eligió y en qué sentido, y un `computed` devuelve una **copia ordenada** de la lista. Se copia porque `sort` modifica el array sobre el que se llama, y no queremos desordenar la lista original.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | El import, la lógica de orden, las cabeceras y la tabla |

## Paso 1 · Importar `computed`

Busca:

```js
import { ref, reactive, onMounted } from "vue";
```

y **sustitúyela** por:

```js
import { ref, reactive, onMounted, computed } from "vue";
```

> Si ya lo hiciste en otra receta, este paso ya está.

## Paso 2 · La lógica de orden

Busca la línea `const pacienteStore = usepacienteStore();` y pega esto **justo debajo**:

```js
// Orden elegido: el nombre del campo ("" = sin orden) y el sentido (1 = A->Z, -1 = Z->A)
const campoOrden = ref("");
const sentidoOrden = ref(1);

// Se llama al pulsar una cabecera.
// Misma columna = invertir el sentido; otra columna = empezar de cero.
function ordenarPor(campo) {
  if (campoOrden.value === campo) {
    sentidoOrden.value = -sentidoOrden.value;
  } else {
    campoOrden.value = campo;
    sentidoOrden.value = 1;
  }
}

// La lista ordenada. computed = se rehace sola al cambiar la columna, el sentido o los pacientes.
const pacientesOrdenados = computed(() => {
  // Sin columna elegida, la lista tal cual
  if (!campoOrden.value) return pacientes.value;

  // [...lista] hace una COPIA: sort cambia el array sobre el que se llama.
  return [...pacientes.value].sort((a, b) =>
    // localeCompare compara textos respetando tildes y la ñ.
    // numeric: true hace que "9" vaya antes que "10".
    // Multiplicar por el sentido (1 o -1) invierte el resultado.
    String(a[campoOrden.value] ?? "").localeCompare(
      String(b[campoOrden.value] ?? ""),
      "es",
      { numeric: true }
    ) * sentidoOrden.value
  );
});
```

## Paso 3 · Las cabeceras pulsables

En el `<thead>`, sustituye las cabeceras que quieras poder ordenar. Por ejemplo, busca:

```vue
            <th>Nome</th>
            <th>Apellidos</th>
```

y **sustitúyelas** por:

```vue
            <!-- @click llama a la funcion con el nombre del campo tal y como esta en Mongo.
                 La flechita se pinta solo en la columna por la que se esta ordenando. -->
            <th class="cursor-pointer select-none" @click="ordenarPor('nomepac')">
              Nome
              <span v-if="campoOrden === 'nomepac'">{{ sentidoOrden === 1 ? "▲" : "▼" }}</span>
            </th>
            <th class="cursor-pointer select-none" @click="ordenarPor('apelpac')">
              Apellidos
              <span v-if="campoOrden === 'apelpac'">{{ sentidoOrden === 1 ? "▲" : "▼" }}</span>
            </th>
```

El mismo patrón sirve para las demás: `dnipac`, `mailpac`, `propac`.

## Paso 4 · La tabla lee la lista ordenada

**Ojo con los botones**, igual que en los filtros: reciben el número de fila y buscan al paciente en la lista original.

**4.1** Busca `<tr v-for="(u, index) in pacientes" :key="index">` y **sustitúyela** por:

```vue
          <tr v-for="u in pacientesOrdenados" :key="u.dnipac">
```

**4.2** Busca `@click="editarPaciente(index)"` y `@click="eliminarPaciente(index)"` y **sustitúyelas** por:

```vue
                @click="editarPaciente(pacientes.indexOf(u))"
```
```vue
                @click="eliminarPaciente(pacientes.indexOf(u))"
```

**4.3** Busca `{{ index + 1 }}` y **sustitúyela** por:

```vue
              {{ pacientesOrdenados.indexOf(u) + 1 }}
```

> El `v-if="pacientes.length > 0"` puede quedarse como está: ordenar no cambia **cuántos** hay.

## Variante · El PDF también ordenado

Dentro de `exportarPacientes()`, busca `filas: pacientes.value.map((paciente) => [` y **sustitúyela** por:

```js
      filas: pacientesOrdenados.value.map((paciente) => [
```

## Qué deberías ver

1. Pulsas «Nome» y la tabla se ordena de la A a la Z, con una ▲ al lado.
2. Lo pulsas otra vez y sale de la Z a la A, con una ▼.
3. Pulsas «Apellidos» y se ordena por apellidos, empezando de cero.
4. Editar y eliminar siguen actuando sobre el paciente correcto.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `computed is not defined` | Falta el Paso 1 |
| Pulso la cabecera y no pasa nada | Falta el Paso 4.1: la tabla sigue leyendo `pacientes` |
| `ordenarPor is not defined` | El Paso 2 quedó dentro de otra función |
| Ordena mal los números (9 después de 10) | Falta `{ numeric: true }` |
| `index is not defined` | Hiciste 4.1 pero te falta 4.2 o 4.3 |
| Borra al paciente equivocado | Falta el Paso 4.2 |
| La columna ordenada no tiene flecha | El nombre del campo del `v-if` no coincide con el del `@click` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `computed` | La lista ordenada se recalcula sola |
| `sort` y `[...lista]` | Ordenar una copia para no tocar la lista original |
| `localeCompare` | Comparar textos respetando tildes, ñ y números |

## Guías relacionadas

- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)
- [Combinar varios filtros y ordenar](combinar.md)

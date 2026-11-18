# Contador de pacientes y cumpleaños de hoy

Dos detalles en la tabla de pacientes: una línea con cuántos pacientes hay (y cuántos son menores de edad), y una tarta 🎂 junto al nombre de quien cumple años hoy.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Para ver la tarta necesitas un paciente cuya fecha de nacimiento caiga hoy, de cualquier año.

## La idea

El contador es un `computed` con `filter().length`. La tarta va dentro de la celda del nombre con un `v-if`, y solo se pinta cuando el día y el mes de `nacipac` coinciden con los de hoy.

El campo de nacimiento es `nacipac` y se guarda como texto `aaaa-mm-dd`, así que `"2000-05-10".slice(5)` da `"05-10"`: el día y el mes sin el año, que es justo lo que hay que comparar.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | El import, los cálculos, la tarta y la línea del contador |

## Paso 1 · Importar `computed`

Esta pantalla no lo importa. Busca:

```js
import { ref, reactive, onMounted } from "vue";
```

y **sustitúyela** por:

```js
import { ref, reactive, onMounted, computed } from "vue";
```

> Si ya lo hiciste en otra receta, este paso ya está.

## Paso 2 · Los cálculos

Busca la línea `const pacienteStore = usepacienteStore();` y pega esto **justo debajo**:

```js
// "mm-dd" de hoy, para comparar el dia y el mes de nacimiento (el ano no importa).
// getMonth() cuenta desde 0, por eso el +1; padStart(2, "0") convierte 5 en "05".
const hoyParaCumple = new Date();
const mesDiaHoy = `${String(hoyParaCumple.getMonth() + 1).padStart(2, "0")}-${String(hoyParaCumple.getDate()).padStart(2, "0")}`;

// nacipac es texto "aaaa-mm-dd": slice(5) corta desde la posicion 5 y deja "mm-dd".
// Boolean(...) evita el error si el paciente no tiene fecha de nacimiento.
function cumpleHoy(paciente) {
  return Boolean(paciente.nacipac) && String(paciente.nacipac).slice(5) === mesDiaHoy;
}

// Calcula la edad y responde si es menor de 18.
function esMenorDeEdad(paciente) {
  if (!paciente.nacipac) {
    return false;
  }

  // split("-") parte "2010-05-10" en ["2010","05","10"] y map(Number) los pasa a numero.
  const [anyo, mes, dia] = String(paciente.nacipac).split("-").map(Number);
  const hoy = new Date();
  let edad = hoy.getFullYear() - anyo;

  // Si este ano todavia no llego su cumpleanos, se resta uno.
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) {
    edad--;
  }

  return edad < 18;
}

// filter(esMenorDeEdad) llama a la funcion con cada paciente y se queda con los que
// devuelven true; .length cuenta cuantos son. Sin parentesis: se pasa la funcion, no su resultado.
const totalMenores = computed(() => pacientes.value.filter(esMenorDeEdad).length);
```

## Paso 3 · La tarta en la celda del nombre

En el `<template>`, busca la línea `<td>{{ u.nomepac }}</td>` y **sustitúyela** por:

```vue
            <td>
              {{ u.nomepac }}
              <!-- v-if: la tarta solo existe en la fila de quien cumple hoy -->
              <span
                v-if="cumpleHoy(u)"
                title="Cumpre anos hoxe"
              >🎂</span>
            </td>
```

## Paso 4 · La línea del contador

Busca la línea `<div class="cabecera-informe">` y pega esto **justo encima**:

```vue
    <!-- pacientes.length es el total; totalMenores viene del computed del Paso 2 -->
    <p class="mb-2 text-sm text-[#64737a]">
      {{ pacientes.length }} pacientes · {{ totalMenores }} menores de idade
    </p>
```

## Variante · El contador respetando los filtros

Si hiciste alguna receta de filtros, lo normal es que el contador cuente **lo que se ve**, no todo. Cambia el Paso 4 por:

```vue
    <p class="mb-2 text-sm text-[#64737a]">
      {{ pacientesPorLugar.length }} de {{ pacientes.length }} pacientes
    </p>
```

Y en el Paso 2, cambia `pacientes.value` por la lista filtrada que estés usando (`pacientesPorLugar`, `pacientesOrdenados`, la que sea la última de la cadena).

## Variante · Edad en una columna

Si quieres la edad como columna de la tabla, está en la receta de [columna calculada](../columnas-y-filtros/columna-calculada.md), que usa el mismo cálculo.

## Qué deberías ver

1. Encima de «📋 Listaxe de pacientes»: «12 pacientes · 3 menores de idade».
2. Una tarta 🎂 al lado del nombre de quien cumple años hoy, y solo en esa fila.
3. Al guardar un paciente nuevo, el número sube sin recargar la página.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `computed is not defined` | Falta el Paso 1 |
| La tarta no sale nunca | `nacipac` no tiene formato `aaaa-mm-dd`: míralo en la base de datos |
| La tarta sale en todas las filas | Falta el `v-if` |
| Siempre «0 menores» | Escribiste `filter(esMenorDeEdad())` con paréntesis: va sin ellos |
| `cumpleHoy is not defined` | El Paso 2 quedó dentro de otra función |
| El nombre desaparece de la celda | Falta `{{ u.nomepac }}` dentro del `<td>` nuevo |
| La edad sale mal en los cumpleaños de este mes | Falta el `if` que resta uno cuando aún no ha llegado el día |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `computed` y `filter().length` | Contar los que cumplen una condición |
| `v-if` | Pintar algo solo a veces |
| `slice(5)` | Quedarse con el «mm-dd» de una fecha en texto |
| `split` y `map(Number)` | Partir un texto y pasar los trozos a número |
| Pasar una función a `filter` | Sin paréntesis: se pasa la función, no su resultado |

## Guías relacionadas

- [Contador de resultados](../columnas-y-filtros/contador-de-resultados.md)
- [Columna calculada: la edad](../columnas-y-filtros/columna-calculada.md)
- [Resaltar por valor](../columnas-y-filtros/resaltar-por-valor.md)

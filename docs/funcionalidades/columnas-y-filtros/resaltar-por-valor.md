# Resaltar una celda según su valor

En la tabla de citas, la fecha de **hoy** sale en naranja y negrita, y las citas **pendientes con fecha ya pasada** en rojo. Sirve para cualquier «pinta en rojo lo que cumpla tal cosa».

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Crea una cita de hoy y otra pendiente con una fecha pasada.

## La idea

En este proyecto la tabla está escrita a mano con `<table>` y `v-for`, así que no hay huecos ni slots: se le pone `:class` directamente a la celda y una función decide qué clase devolver según la cita de esa fila.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | La función que decide el color y la celda de la fecha |

## Paso 1 · La fecha de hoy y la función

En `src/components/Citas.vue`, busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega esto **justo encima**:

```js
// La fecha de hoy como texto "aaaa-mm-dd", igual que las que guarda la base de datos.
const ahora = new Date()
const fechaDeHoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`

// Devuelve las clases de Tailwind que corresponden a una cita ("" = sin resaltar).
// Las fechas son texto aaaa-mm-dd: se pueden comparar con < y === como si fueran fechas.
function claseFecha(cita) {
  // Pendiente y con fecha ya pasada = atrasada: rojo
  if (cita.estado === "pendente" && cita.fecha < fechaDeHoy) return "font-semibold text-red-600"
  // De hoy: naranja
  if (cita.fecha === fechaDeHoy) return "font-semibold text-orange-600"
  return ""
}
```

Qué hace: como las fechas son texto `aaaa-mm-dd`, se pueden comparar con `<` y `===` directamente. La función devuelve las clases que toca, o un texto vacío si no hay que resaltar nada.

## Paso 2 · La celda

En el `<template>`, busca la línea:

```vue
              <td>{{ item.fecha }} · {{ item.hora }}</td>
```

y **sustitúyela** por:

```vue
              <!-- :class (con dos puntos) pone la clase que devuelve la funcion.
                   `item` es la cita de esta fila, la que reparte el v-for de arriba.
                   Si la funcion devuelve "", no se pone ninguna clase. -->
              <td :class="claseFecha(item)">{{ item.fecha }} · {{ item.hora }}</td>
```

## Variante · Resaltar el estado en vez de la fecha

La columna de estado es `<td>{{ etiquetaEstado(item.estado) }}</td>`. Para pintar las canceladas en gris y las realizadas en verde:

```vue
              <td :class="claseEstado(item.estado)">{{ etiquetaEstado(item.estado) }}</td>
```

con esta función junto a la anterior:

```js
function claseEstado(estado) {
  if (estado === "cancelada") return "text-gray-400 line-through"
  if (estado === "realizada") return "text-green-700"
  return ""
}
```

## Qué deberías ver

1. La fecha de hoy, en naranja y negrita.
2. Las citas pendientes de días anteriores, en rojo.
3. El resto, con el aspecto normal.
4. Si cambias el estado de una pendiente pasada a «realizada», deja de ser roja sin recargar.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| La fecha desaparece de la celda | Borraste el `{{ item.fecha }}` al sustituir la línea |
| `claseFecha is not defined` | El Paso 1 quedó dentro de otra función |
| El color no cambia nunca | `item.fecha` no tiene el formato `aaaa-mm-dd`: míralo con un `console.log` |
| Todo sale igual | La función devuelve siempre lo mismo: revisa los `if` |
| Las clases no se aplican | Tailwind necesita las clases escritas **enteras** (`text-red-600`), no construidas por partes. Si acabas de añadirlas, reinicia `npm start` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `:class` | Clases que cambian según los datos |
| `v-for` | La variable `item` de cada fila es la que se le pasa a la función |

## Guías relacionadas

- [Color por estado](../estilos/color-por-estado.md)
- [Guía: aspecto](../../guias/aspecto.md)

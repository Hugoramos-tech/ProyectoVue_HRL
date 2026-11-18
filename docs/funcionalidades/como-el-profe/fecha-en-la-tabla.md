# Fecha como dd/mm/aaaa en la tabla de citas

En la tabla de citas, la fecha se ve `18/11/2026` y no `2026-11-18`. Como se hace con una función, el PDF también la lleva con ese formato.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

La base de datos guarda la fecha como **texto** `aaaa-mm-dd` (así está declarado en `backend/modelos/Cita.js`: `fecha: { type: String }`). Para enseñarla de otra forma **no se cambia lo guardado**: se parte el texto y se recompone al pintarlo.

Ese formato `aaaa-mm-dd` no es casual: es el único que se ordena y compara correctamente como texto, que es lo que aprovechan casi todas las recetas de filtros por fecha. Si se guardara `dd/mm/aaaa`, ordenar por fecha dejaría de funcionar.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/utils/fechas.js` | La función (puede que ya exista) |
| `src/components/Citas.vue` | El import y la celda |

## Paso 1 · La función

Si ya hiciste la receta de [columna calculada](../columnas-y-filtros/columna-calculada.md), **salta este paso**: `formatearFecha` ya está en `src/utils/fechas.js`.

Si no, crea el fichero `src/utils/fechas.js` con este contenido:

```js
// "2026-11-18" -> "18/11/2026". Solo cambia lo que se VE: la base de datos
// sigue guardando aaaa-mm-dd, que es el formato que permite ordenar y comparar.
export function formatearFecha(fecha) {
  // Si la cita no tuviera fecha, un guion en vez de "undefined/undefined/undefined".
  if (!fecha) {
    return "—";
  }

  // split("-") parte el texto en tres trozos y los nombres entre corchetes
  // los reciben por orden: desestructurar un array.
  const [anyo, mes, dia] = String(fecha).split("-");
  // La plantilla con ${...} los mete en otro orden.
  return `${dia}/${mes}/${anyo}`;
}
```

## Paso 2 · El import

En `src/components/Citas.vue`, busca la línea `import { generarPDF } from "../utils/pdf.js"` y pega esto **justo debajo**:

```js
import { formatearFecha } from "../utils/fechas.js"
```

## Paso 3 · La celda de la tabla

En el `<template>`, busca la línea `<td>{{ item.fecha }} · {{ item.hora }}</td>` y **sustitúyela** por:

```vue
              <td>{{ formatearFecha(item.fecha) }} · {{ item.hora }}</td>
```

> Si hiciste la receta de [confirmar varias citas a la vez](../pequenas-mejoras/confirmar-seleccionadas.md), esa celda ya tiene una casilla dentro. En ese caso no la sustituyas: busca dentro de ella `{{ item.fecha }} · {{ item.hora }}` y cámbialo por `{{ formatearFecha(item.fecha) }} · {{ item.hora }}`.

## Paso 4 · El PDF

Dentro de `exportarCitas()`, busca la línea `        item.fecha ?? "",` y **sustitúyela** por:

```js
        formatearFecha(item.fecha),
```

El `?? ""` ya no hace falta: la función devuelve «—» cuando no hay fecha.

## Variante · Con `toLocaleDateString`

En lugar de partir el texto, se le puede pedir al navegador que dé el formato:

```js
export function formatearFecha(fecha) {
  if (!fecha) {
    return "—";
  }
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
```

**Ojo con esto:** `new Date("2026-11-18")` se interpreta como medianoche **en UTC**. En España, en invierno, eso es la una de la madrugada, así que coincide; pero en husos con desplazamiento negativo sale **el día anterior**. La versión con `split` no tiene ese problema porque no construye ninguna fecha: solo mueve trozos de texto.

Para un examen, la versión con `split` es la respuesta segura, y saber explicar por qué es lo que marca la diferencia.

## Variante · Con el día de la semana

```js
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
```

Da «miércoles, 18 de noviembre». El `T00:00:00` añadido fuerza a interpretarla en hora **local** y evita el problema del día anterior.

## Variante · La misma función en la tabla de pacientes

`nacipac` también es un texto `aaaa-mm-dd`. En `XestionPacientes.vue`, con el mismo import, cualquier celda que muestre esa fecha puede usar `{{ formatearFecha(u.nacipac) }}`.

## Qué deberías ver

1. La columna «Fecha y hora» muestra `18/11/2026 · 10:30`.
2. El PDF de citas también lleva la fecha en ese formato.
3. Crear y editar citas sigue funcionando igual: el campo del formulario es un `<input type="date">` y ese trabaja siempre con `aaaa-mm-dd` por dentro.
4. Si ordenas o filtras por fecha, sigue funcionando: lo guardado no ha cambiado.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `formatearFecha is not defined` | Falta el Paso 2, o la ruta del import (`../utils/fechas.js`) |
| Sale `undefined/undefined/undefined` | La fecha no está en formato `aaaa-mm-dd`: míralo en la consola de F12 |
| Sale el día anterior | Usaste la variante con `new Date(...)`: vuelve a la del `split`, o añade `T00:00:00` |
| Sale «—» en todas | El campo se llama `fecha`, no `data` ni `fechaCita` |
| Ahora no se puede guardar una cita | Cambiaste el dato guardado en vez de solo cómo se pinta: el formulario necesita `aaaa-mm-dd` |
| El PDF sigue con el formato viejo | Falta el Paso 4 |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Formatear al pintar | Cambiar lo que se ve sin tocar lo que se guarda |
| Desestructurar un array | `const [a, b, c] = lista` |
| `split("-")` | Partir un texto por un carácter |
| `aaaa-mm-dd` | El formato que se ordena y compara bien como texto |
| Zona horaria y `new Date` | Una fecha sin hora se interpreta en UTC |

## Guías relacionadas

- [Columna calculada: la edad](../columnas-y-filtros/columna-calculada.md)
- [Filtros de especialidad y fecha en citas](../columnas-y-filtros/filtro-citas-especialidad-y-fecha.md)
- [Filtro en el backend](../backend/filtro-en-backend.md)

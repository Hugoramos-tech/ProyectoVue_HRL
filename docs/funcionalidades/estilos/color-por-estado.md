# Color según el estado

La columna «Estado» de la tabla de citas se pinta como una etiqueta de color: ámbar para pendente, azul para confirmada, verde para realizada y rojo para cancelada.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

Hoy la celda es texto plano: `{{ etiquetaEstado(item.estado) }}`. Se envuelve en un `<span>` cuyo color sale de un objeto que relaciona cada estado con sus clases de Tailwind.

`class` son las clases fijas (la forma de píldora) y `:class` las que cambian según los datos de la fila.

> **Importante con Tailwind:** las clases tienen que estar escritas **enteras** en el código. Tailwind lee los ficheros buscando nombres de clase completos; si construyes el nombre pegando trozos (`` `bg-${color}-100` ``) no lo encuentra y la clase no se genera. Por eso el mapa lleva las cadenas completas.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | El mapa de colores y la celda |

## Paso 1 · El mapa de colores

Busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega esto **justo encima**:

```js
// Clases de Tailwind de cada estado, escritas ENTERAS.
// bg-... es el color de fondo, text-... el del texto, y el numero (100, 800)
// la intensidad: 100 es muy claro, 800 muy oscuro.
// Las claves son los valores que guarda el backend, no las etiquetas que se ven.
const clasesEstado = {
  pendente: "bg-amber-100 text-amber-800",
  confirmada: "bg-sky-100 text-sky-800",
  realizada: "bg-emerald-100 text-emerald-800",
  cancelada: "bg-red-100 text-red-800",
}
```

## Paso 2 · La celda

En el `<template>`, busca la línea `<td>{{ etiquetaEstado(item.estado) }}</td>` y **sustitúyela** por:

```vue
              <td>
                <!-- class = clases fijas (la forma de pildora).
                     :class = clases que cambian segun los datos de esta fila.
                     clasesEstado[item.estado] saca las del estado de esta cita. -->
                <span
                  class="inline-block rounded-full px-2 py-0.5 text-xs font-bold"
                  :class="clasesEstado[item.estado]"
                >
                  {{ etiquetaEstado(item.estado) }}
                </span>
              </td>
```

`etiquetaEstado` ya existe en el fichero: traduce `pendente` a «Pendiente».

> Si ya hiciste la receta de [cambiar el estado desde la tabla](../listas/estado-desde-la-tabla.md), esa celda ya tiene un `<select>`. No pongas las dos cosas: o el desplegable o la etiqueta de color. Abajo está cómo combinarlas.

## Variante · Las dos cosas: desplegable con color

Si quieres el desplegable **y** el color, sustituye la celda por esto:

```vue
              <td>
                <select
                  class="rounded-full px-2 py-0.5 text-xs font-bold"
                  :class="clasesEstado[item.estado]"
                  :value="item.estado"
                  :disabled="cargando"
                  @change="cambiarEstado(item, $event.target.value)"
                >
                  <option value="pendente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="realizada">Realizada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </td>
```

Necesita la función `cambiarEstado` de esa otra receta.

## Variante · Colores con la paleta del proyecto

Los colores de la aplicación son verdes concretos escritos entre corchetes, no de la paleta estándar de Tailwind. Si quieres que las etiquetas peguen con el resto:

```js
const clasesEstado = {
  pendente: "bg-[#fdf3d7] text-[#8a6d1a]",
  confirmada: "bg-[#e4f1ed] text-[#28695e]",
  realizada: "bg-[#dff0e6] text-[#14543a]",
  cancelada: "bg-[#fbe4e2] text-[#b3261e]",
}
```

La notación `bg-[#14543a]` es la que usa todo el proyecto: un color exacto entre corchetes, en vez de un nombre de la paleta.

## Variante · Resaltar la fila entera

En lugar de la celda, el `<tr>`. Busca `v-for="item in citas"` y añade un `:class` a ese mismo `<tr>`:

```vue
              :class="item.estado === 'cancelada' ? 'opacity-50 line-through' : ''"
```

Las canceladas salen grises y tachadas.

## Qué deberías ver

Cada fila muestra su estado como una etiqueta redondeada de color, no como texto plano. Cambia una cita a «Cancelada» y su etiqueta pasa a roja.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El texto sale pero sin ningún color | Las clases no están enteras en el código, o el servidor de Vite necesita un reinicio para generarlas |
| Todas las etiquetas del mismo color, o sin color | `clasesEstado[item.estado]` no encuentra la clave: el estado tiene que ser `pendente`, `confirmada`, `realizada` o `cancelada` |
| Sale «pendente» en vez de «Pendiente» | Falta llamar a `etiquetaEstado(...)` dentro del `<span>` |
| `clasesEstado is not defined` | El Paso 1 quedó dentro de otra función |
| Funcionó y al rato dejó de haber color | Tailwind cachea las clases generadas: para y vuelve a arrancar `npm start` |

## Otros ajustes de aspecto en este proyecto

| Qué | Dónde |
|---|---|
| Colores y estilos globales | `src/style.css` |
| Verde principal de la barra y los PDF | `#14543a` en `NavBar.vue` y `COLOR_PRIMARIO` en `src/utils/pdf.js` |
| Estilo de las alertas | `src/utils/alertas.js` |
| Aspecto de los PDF | `src/utils/pdf.js`, dentro de `autoTable(...)` |
| Orden y texto del menú | `src/components/NavBar.vue` (está escrito a mano, enlace por enlace) |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `:class` con un objeto de mapeo | Clases que cambian según los datos |
| `class` y `:class` juntos | Las fijas y las variables se suman |
| Clases completas en Tailwind | No se pueden construir pegando trozos de texto |
| `bg-[#color]` | Un color exacto en vez de uno de la paleta |

## Guías relacionadas

- [Guía: cambiar el aspecto](../../guias/aspecto.md)
- [Resaltar por valor](../columnas-y-filtros/resaltar-por-valor.md)
- [Cambiar el estado desde la tabla](../listas/estado-desde-la-tabla.md)

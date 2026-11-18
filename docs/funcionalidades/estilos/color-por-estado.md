# Color según el estado

La columna «Estado» de la tabla de citas se pinta como una etiqueta de color: ámbar para pendente, azul para confirmada, verde para realizada y rojo para cancelada.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

`DataTable` deja personalizar una celda con un hueco (`slot`) que se llama `#celda-` más la `clave` de la columna. La columna de estado tiene `clave: "estado"`, así que su hueco es `#celda-estado`. Dentro se pone una etiqueta cuyo color sale de un objeto que relaciona cada estado con sus clases de Tailwind.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | El mapa de colores y el hueco de la celda |

## Paso 1 · El mapa de colores

En `src/components/Citas.vue`, busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega esto **justo encima**:

```js
// Clases de Tailwind de cada estado. Tienen que estar escritas ENTERAS: Tailwind solo incluye
// las clases que encuentra completas en el código, no las que se construyen pegando trozos.
// bg-... = color de fondo; text-... = color del texto; el número (100, 800) es la intensidad.
const clasesEstado = {
  pendente: "bg-amber-100 text-amber-800",
  confirmada: "bg-sky-100 text-sky-800",
  realizada: "bg-emerald-100 text-emerald-800",
  cancelada: "bg-red-100 text-red-800",
};
```

## Paso 2 · La celda

En `src/components/Citas.vue`, busca la línea `<template #acciones="{ fila }">` (está dentro de `<DataTable`) y pega esto **justo encima**:

```vue
<!-- #celda-estado = el hueco de la celda de la columna con clave "estado". `fila` = la cita de esa fila. -->
<template #celda-estado="{ fila }">
  <!-- class = clases fijas (forma de píldora); :class = clases que cambian según los datos.
       clasesEstado[fila.estado] elige las del estado de esta cita -->
  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="clasesEstado[fila.estado]">
    {{ etiquetaEstado(fila.estado) }}
  </span>
</template>
```

Qué hace: `:class` añade las clases del mapa según el estado de cada fila. `etiquetaEstado` ya existe en el fichero y traduce `pendente` a «Pendente».

Si ya hiciste la receta «Estado desde la tabla», esa celda ya existe: no añadas otra, **sustituye** su contenido por el `<span>` de arriba (se pierde el desplegable).

## Qué deberías ver

Cada fila de la tabla muestra su estado como una etiqueta redondeada de color, no como texto plano.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El texto sale pero sin color | Las clases se escribieron partidas o con otro nombre: deben ser las del mapa, enteras |
| Todas las etiquetas del mismo color | `clasesEstado[fila.estado]` no encuentra la clave: el estado debe ser `pendente`, `confirmada`, `realizada` o `cancelada` |
| La celda sigue en texto | El hueco no se llama exactamente `#celda-estado` |

## Otros ajustes de aspecto

| Qué | Dónde |
|---|---|
| Colores globales | `@theme` en `src/style.css` (el acento verde es `--color-accent*`) |
| Estilo de los botones | `variantes` en `src/components/ui/AppButton.vue` |
| Alertas | `src/utils/alertas.js` |
| PDF | `src/utils/pdf.js` |
| Menú (orden, icono, texto) | `src/router/index.js` |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `:class` | Clases que cambian según los datos | `03_lecciones/vue/08_class.md` |
| `:class` con Tailwind | Cambiar las clases según los datos | `03_lecciones/04_tailwind.md §9` |
| Grid y responsive | Rejillas y prefijos `sm:`, `md:`, `lg:` | `03_lecciones/04_tailwind.md §6 y §7` |

## Guías relacionadas

- [Guía: cambiar el aspecto](../../guias/aspecto.md)

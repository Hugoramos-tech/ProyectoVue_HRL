# Contador en el menú

Junto a «Citas» en la barra de navegación, un número con las citas en estado `pendente`.

**Antes de empezar:** arranca el proyecto (`npm start`). Para ver el número necesitas al menos una cita con estado «Pendiente».

## La idea

En este proyecto **las listas no viven en Pinia**: `citas` es un `ref([])` dentro de `Citas.vue`, y la barra de navegación no puede verlo. Así que para el contador se crea un store nuevo, pequeño, con una sola cosa dentro: cuántas citas están pendientes.

```
citasStore.actualizarPendentes()  ──pide getCitas()──▶  cuenta las pendientes
                 │
                 └──▶  NavBar lee citasStore.pendentes  ──▶  pinta la burbuja
```

El store se escribe en el **mismo estilo que los tuyos** (`{ state, actions }`), no con `ref()` dentro de una función.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/store/citasStore.js` | Fichero **nuevo**: el contador compartido |
| `src/components/NavBar.vue` | Cargar el contador y pintar la burbuja |
| `src/components/Citas.vue` | Refrescar el contador al guardar o borrar (opcional) |

## Paso 1 · El store nuevo

Crea el fichero `src/store/citasStore.js` con este contenido:

```js
import { defineStore } from "pinia";
import { getCitas } from "../api/citas.js";

// Store pequeno con un solo dato: cuantas citas estan pendientes.
// Se escribe en estilo de opciones, igual que pacienteStore y doctorStore.
export const useCitasStore = defineStore("citas", {
  // pendentes arranca en 0: todavia no se ha preguntado al servidor.
  state: () => ({
    pendentes: 0,
  }),
  actions: {
    // Pide TODAS las citas y se queda solo con el numero de las pendientes.
    // getCitas() sin filtros devuelve la coleccion completa.
    async actualizarPendentes() {
      try {
        const todas = await getCitas();
        // filter se queda con las pendientes y .length las cuenta.
        this.pendentes = todas.filter((c) => c.estado === "pendente").length;
      } catch {
        // Si el backend no responde, el contador se queda a 0 en lugar de romper el menu.
        this.pendentes = 0;
      }
    },
  },
});
```

> `pendente` sin «i»: es el valor que guarda el backend, el que está en `backend/modelos/Cita.js` como `default`.

## Paso 2 · Leerlo en la barra

En `src/components/NavBar.vue`, busca la línea `import { ref } from "vue"` y **sustitúyela** por:

```js
import { ref, onMounted } from "vue"
import { useCitasStore } from "../store/citasStore.js"
```

Después busca la línea `const isOpen = ref(false)` y pega esto **justo debajo**:

```js
// useCitasStore() devuelve el objeto compartido. Se lee en la plantilla como
// citasStore.pendentes, sin desestructurar, para no perder la reactividad.
const citasStore = useCitasStore()

// onMounted = "cuando el componente aparece en pantalla".
// La barra se monta una sola vez al abrir la aplicacion, asi que el contador
// se pide una vez y despues se refresca desde la pantalla de citas.
onMounted(() => citasStore.actualizarPendentes())
```

## Paso 3 · Pintar la burbuja

En el `<template>`, busca `to="/citas">Citas</RouterLink>` y **sustitúyelo** por:

```vue
to="/citas">Citas</RouterLink>
        <!-- v-if: la burbuja solo existe si hay alguna pendiente. En 0 no se pinta nada. -->
        <span
          v-if="citasStore.pendentes > 0"
          class="ml-1 rounded-full bg-[#ffe66d] px-2 py-0.5 text-xs font-bold text-[#153f2e]"
        >
          {{ citasStore.pendentes }}
        </span>
```

Ese `<span>` queda dentro del mismo `<li>` que el enlace, así que sale pegado a la palabra «Citas».

## Paso 4 · Que el número se actualice (opcional pero recomendable)

Tal como está, el contador se calcula una sola vez, al abrir la aplicación. Para que cambie al crear o borrar una cita, hay que avisar al store desde la pantalla de citas.

En `src/components/Citas.vue`, busca la línea `import { generarPDF } from "../utils/pdf.js"` y pega esto **justo debajo**:

```js
import { useCitasStore } from "../store/citasStore.js"
```

Busca la línea `const doctorStore = useDoctorStore()` y pega esto **justo debajo**:

```js
const citasStore = useCitasStore()
```

Y ahora, dentro de `cargarDatos()`, busca la línea `  } finally {` y pega esto **justo encima**:

```js
    // Cada vez que se recarga la lista se refresca tambien el contador del menu.
    await citasStore.actualizarPendentes()
```

Como `guardarCita`, `eliminarCita` y `cambiarEstado` llaman todas a `cargarDatos()` al acabar, con esto el número se mantiene al día sin tocar nada más.

> Ojo: `} finally {` aparece **dos veces** en `Citas.vue` (en `cargarDatos` y en `guardarCita`). Asegúrate de que estás en la de `cargarDatos`, la que tiene `cargando.value = false` debajo.

## Qué deberías ver

1. Junto a «Citas» en el menú, un círculo amarillo con el número de citas pendientes.
2. Si no hay ninguna pendiente, no sale nada (no sale un «0»).
3. Con el Paso 4 hecho: cambia una cita a «Cancelada» y el número baja sin recargar la página.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| No sale ningún número | No hay citas pendientes, o el backend no responde: mira la consola de F12 |
| `useCitasStore is not a function` | El nombre del `export` del store no coincide con el del `import` |
| El número no cambia nunca | Falta el Paso 4 |
| `onMounted is not defined` | Falta el Paso 2: hay que añadirlo al `import` de vue |
| El número cuenta mal | Compara con `"pendente"`, no con `"Pendiente"`: lo segundo es solo la etiqueta que se enseña |
| La burbuja sale en una línea aparte | El `<span>` tiene que quedar dentro del `<li>`, pegado tras el `</RouterLink>` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Store de Pinia | Un objeto compartido entre pantallas, con estado y acciones |
| `this` dentro de una acción | En un store de opciones, `this` es el propio store |
| `onMounted` | Código que se ejecuta al aparecer el componente en pantalla |
| `filter` + `.length` | Quedarse con unos elementos y contarlos |

## Guías relacionadas

- [Elegir en una página y usarlo en otra](pinia-seleccion.md)
- [Citas de hoy en la portada](citas-de-hoy.md)
- [Cambiar el estado desde la tabla](../listas/estado-desde-la-tabla.md)

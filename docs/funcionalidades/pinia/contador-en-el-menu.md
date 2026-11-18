# Contador en el menú

Junto a «Citas» en la barra de navegación, un número con las citas en estado `pendente`.

**Antes de empezar:** arranca el proyecto (`npm start`). Para ver el número, cambia alguna cita a «Pendente» desde su formulario.

## La idea

El número sale de un `computed` dentro del `citaStore`: cuenta las citas pendientes de la lista. La barra lo lee del store, así que se actualiza solo al crear, editar o borrar una cita.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/store/citaStore.js` | El `computed` con las pendientes |
| `src/components/NavBar.vue` | Cargar las citas y pintar el número |

## Paso 1 · El `computed` en el store

En `src/store/citaStore.js`, hay tres cambios.

Busca la línea `import { ref } from "vue";` y **sustitúyela** por:

```js
import { ref, computed } from "vue";
```

Busca la línea `const idDoctor = ref("");` y pega **justo debajo**:

```js
  // Cuántas citas están pendientes. computed = se recalcula solo cuando cambia la lista de citas.
  // filter se queda con las pendientes y .length las cuenta.
  const pendentes = computed(() => citas.value.filter((c) => c.estado === "pendente").length);
```

Busca la línea `return { citas, idPaciente, idDoctor, cargarCitas, gardarCita, eliminarCitaPorId };` y **sustitúyela** por:

```js
  // Lo que el store devuelve es lo que queda disponible fuera. `pendentes` es nuevo aquí.
  return { citas, pendentes, idPaciente, idDoctor, cargarCitas, gardarCita, eliminarCitaPorId };
```

## Paso 2 · Leerlo en la barra

En `src/components/NavBar.vue`, hay tres cambios en el `<script setup>`.

Busca la línea `import { ref } from "vue";` y **sustitúyela** por:

```js
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCitaStore } from "../store/citaStore.js";
```

Busca la línea `const abierto = ref(false);` y pega **justo debajo**:

```js
// Las citas se cargan al aparecer la barra; `pendentes` se recalcula cuando cambian
const citaStore = useCitaStore();
// storeToRefs saca los datos del store SIN perder la reactividad (si se desestructurara sin él, se copiaría el valor y no se actualizaría)
const { pendentes } = storeToRefs(citaStore);
// onMounted = "cuando el componente aparece": aquí se piden las citas al servidor
onMounted(() => citaStore.cargarCitas());
```

## Paso 3 · Pintar el número

En `src/components/NavBar.vue`, busca la línea `{{ ruta.meta.titulo }}` y pega esto **justo debajo**:

```vue
        <!-- v-if: la burbuja solo existe en la entrada "Citas" y si hay alguna pendiente -->
        <span
          v-if="ruta.path === '/citas' && pendentes > 0"
          class="rounded-full bg-accent px-2 text-xs text-white"
        >
          {{ pendentes }}
        </span>
```

Qué hace: el `v-if` solo pinta el número en el enlace de Citas y solo si hay alguna pendiente.

## Qué deberías ver

1. Junto a «Citas» en el menú, un círculo verde con el número de pendientes.
2. Cambia una cita a «Cancelada» y gárdala: el número baja sin recargar.
3. Crea una pendiente: sube.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| No sale ningún número | No hay citas pendientes (el contador no se muestra en 0), o falta el `onMounted` del Paso 2 |
| `pendentes is not defined` | Falta el `return` del Paso 1: no está `pendentes` en la lista |
| Cuenta de menos | La lista del store está filtrada por paciente o doctor (editaste a alguien): el contador cuenta solo esas citas |

## Para un total siempre exacto

Pide las pendientes aparte al servidor con la receta de [filtro en el backend](../backend/filtro-en-backend.md), con `obtenerCitas({ estado: "pendente" })`, y guarda su `length` en un `ref` que se actualice en `gardarCita` y `eliminarCitaPorId`.

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Store de Pinia | Un objeto compartido entre páginas, con estado y acciones | `03_lecciones/07_pinia.md §4` |
| `computed` | Un dato que se calcula solo a partir de otros y se rehace cuando cambian | `03_lecciones/vue/07_computed.md` |
| `storeToRefs` | Sacar datos de un store sin perder la reactividad | `03_lecciones/07_pinia.md §6` |
| `onMounted` | Código que se ejecuta al aparecer el componente en pantalla | `03_lecciones/01_reactividad.md §6` |

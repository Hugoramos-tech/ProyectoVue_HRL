# Citas de hoy en la portada

La portada muestra las citas de hoy con su hora, el paciente y el doctor, ordenadas por hora. Si no hay ninguna, dice «Hoxe non hai citas».

**Antes de empezar:** arranca el proyecto (`npm start`). Para verlo necesitas una cita con la fecha de hoy.

## La idea

Un `computed` en el `citaStore` se queda con las citas cuya fecha es hoy. La portada lo lee. Los nombres del paciente y el doctor salen de los otros stores, que también hay que cargar.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/store/citaStore.js` | El `computed` `citasHoxe` |
| `src/components/Inicio.vue` | Cargar los datos y pintar la lista |

## Paso 1 · El `computed` en el store

En `src/store/citaStore.js`, hay tres cambios.

Busca la línea `import { ref } from "vue";` y **sustitúyela** por (si ya dice `ref, computed`, déjala):

```js
import { ref, computed } from "vue";
```

Busca la línea `const idDoctor = ref("");` y pega **justo debajo**:

```js
  // Las citas de hoy, ordenadas por hora. toLocaleDateString("sv-SE") da AAAA-MM-DD en hora
  // local (con toISOString saldría la fecha UTC y de madrugada fallaría).
  const citasHoxe = computed(() => {
    const hoxe = new Date().toLocaleDateString("sv-SE");
    return citas.value
      .filter((c) => c.fecha === hoxe)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  });
```

Busca la línea que empieza por `return {` al final del store y **añade `citasHoxe`** a la lista. Si no hiciste el contador, queda así:

```js
  return { citas, citasHoxe, idPaciente, idDoctor, cargarCitas, gardarCita, eliminarCitaPorId };
```

## Paso 2 · La lógica en la portada

En `src/components/Inicio.vue`, hay dos cambios en el `<script setup>`.

Busca la línea `import { Users, Stethoscope, CalendarDays, HeartPulse } from "lucide-vue-next";` y pega **justo debajo**:

```js
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCitaStore } from "../store/citaStore.js";
import { usepacienteStore } from "../store/pacienteStore.js";
import { useDoctorStore } from "../store/doctorStore.js";
```

Busca la línea `const accesos = [` y pega **justo encima**:

```js
const citaStore = useCitaStore();
const pacienteStore = usepacienteStore();
const doctorStore = useDoctorStore();
// storeToRefs: saca `citasHoxe` del store sin perder la reactividad
const { citasHoxe } = storeToRefs(citaStore);

// Se cargan las tres listas a la vez (Promise.all): hacen falta para pintar los nombres
onMounted(() =>
  Promise.all([citaStore.cargarCitas(), pacienteStore.cargarPacientes(), doctorStore.cargarDoctores()])
);
```

## Paso 3 · La lista

En `src/components/Inicio.vue`, busca la línea `  <nav` (la que abre el bloque de accesos; sus atributos `class` y `aria-label="Accesos rápidos"` están en las líneas de debajo). Pega esto **justo encima de esa línea `<nav`**, nunca entre sus atributos:

```vue
  <section class="mb-6">
    <h2 class="mb-2 text-xl font-semibold">Citas de hoxe</h2>
    <!-- v-if / v-else: o el mensaje de "no hay citas" o la lista, nunca los dos -->
    <p v-if="citasHoxe.length === 0" class="text-sm text-fg-soft">Hoxe non hai citas</p>
    <ul v-else class="text-sm">
      <!-- v-for: una línea por cita de hoy. nombrePorDni / nombrePorId convierten el identificador en nombre -->
      <li v-for="c in citasHoxe" :key="c.id">
        {{ c.hora }}: {{ pacienteStore.nombrePorDni(c.pacienteDNI) }} con {{ doctorStore.nombrePorId(c.doctorId) }}
      </li>
    </ul>
  </section>
```

## Qué deberías ver

1. En la portada, una sección «Citas de hoxe».
2. Sin citas hoy: «Hoxe non hai citas».
3. Crea una cita con la fecha de hoy y vuelve a la portada: aparece con su hora y los nombres.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Siempre «Hoxe non hai citas» | La fecha de la cita no es la de hoy, o la lista del store está filtrada por paciente o doctor |
| Salen guiones «—» en vez de nombres | Faltan cargar pacientes o doctores: revisa el `onMounted` del Paso 2 |
| `citasHoxe is not defined` | Falta añadirlo al `return` del store |
| Las horas salen desordenadas | Falta el `.sort(...)` del Paso 1 |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Store de Pinia | Un objeto compartido entre páginas, con estado y acciones | `03_lecciones/07_pinia.md §4` |
| `computed` | Un dato que se calcula solo a partir de otros y se rehace cuando cambian | `03_lecciones/vue/07_computed.md` |
| `storeToRefs` | Sacar datos de un store sin perder la reactividad | `03_lecciones/07_pinia.md §6` |
| `onMounted` | Código que se ejecuta al aparecer el componente en pantalla | `03_lecciones/01_reactividad.md §6` |

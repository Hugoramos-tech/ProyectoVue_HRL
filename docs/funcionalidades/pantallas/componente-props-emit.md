# Componente hijo con props y emit

En la página de servicios, un desplegable de especialidades y debajo las tarjetas de sus doctores. Cada tarjeta es un componente, `TarxetaDoctor`, que recibe el doctor y avisa a la página cuando se pulsa «Pedir cita». Esa pulsación lleva a Citas con el doctor ya elegido.

*Versión extendida, con variantes y más casos: [apuntes a fondo, apartado 9](../../detalle/03-rutas-y-componentes.md).*

**Antes de empezar:** arranca el proyecto (`npm start`) y ten abierta la página **Servizos** (`/servicios`). Necesitas doctores creados.

## La idea

Los datos bajan del padre al hijo por **props**. Los avisos suben del hijo al padre por **emit**. El hijo no modifica lo que le llega: avisa y el padre decide.

`Servizos.vue` (padre) → `:doctor="d"` → `TarxetaDoctor.vue` (hijo) → `emit('pedir-cita')` → `Servizos.vue`

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/TarxetaDoctor.vue` | **Nuevo.** La tarjeta (el hijo) |
| `src/components/Servicios.vue` | El padre: desplegable, tarjetas y navegación |

## Paso 1 · El hijo

Crea `src/components/TarxetaDoctor.vue`:

```vue
<script setup>
import AppButton from "./ui/AppButton.vue";

// Props: los datos que el PADRE le pasa a este componente. El hijo solo los LEE, nunca los modifica.
// `required: true` = si el padre no lo pasa, Vue avisa en la consola.
defineProps({
  doctor: { type: Object, required: true },
});

// Emit: los avisos que el hijo puede enviar al padre ("ha pasado esto, haz tú lo que toque")
const emit = defineEmits(["pedir-cita"]);
</script>

<template>
  <article class="rounded-xl bg-subtle p-4">
    <!-- Dentro del template, las props se usan por su nombre: `doctor` -->
    <h3 class="font-medium">{{ doctor.nomedoc }} {{ doctor.apeldoc }}</h3>
    <p class="text-sm text-fg-soft">{{ doctor.movildoc }} · {{ doctor.maildoc }}</p>
    <!-- Al pulsar, el hijo lanza el aviso "pedir-cita" y le manda el doctor al padre -->
    <AppButton variante="primario" class="mt-3" @click="emit('pedir-cita', doctor)">
      Pedir cita
    </AppButton>
  </article>
</template>
```

## Paso 2 · Los imports del padre

En `src/components/Servicios.vue`, busca la línea `import PageHeader from "../components/ui/PageHeader.vue";` y pega esto **justo debajo**:

```js
// ref = caja vigilada; onMounted = "al aparecer la página"; storeToRefs = datos del store sin perder la reactividad
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { obtenerDoctores } from "../api/doctores.js";
import { useEspecialidadStore } from "../store/especialidadStore.js";
import { useCitaStore } from "../store/citaStore.js";
// Al importar el componente hijo, ya se puede usar como etiqueta: <TarxetaDoctor />
import TarxetaDoctor from "../components/TarxetaDoctor.vue";
```

## Paso 3 · La lógica del padre

En `src/components/Servicios.vue`, busca la línea `</script>` y pega esto **justo encima**:

```js
const router = useRouter();
const citaStore = useCitaStore();
const especialidadStore = useEspecialidadStore();
const { especialidades } = storeToRefs(especialidadStore);

const doctores = ref([]);            // los doctores de la especialidad elegida
const especialidadeElixida = ref(""); // lo que hay elegido en el desplegable

// Las especialidades se cargan al abrir la página
onMounted(() => especialidadStore.cargarEspecialidades());

// Al elegir una especialidad se piden al servidor solo los doctores de esa especialidad
async function verDoctores() {
  doctores.value = especialidadeElixida.value
    ? await obtenerDoctores(especialidadeElixida.value)
    : [];
}

// Llega el aviso de la tarjeta (con el doctor): se deja el doctor elegido en el store y se va a Citas
function pedirCita(doctor) {
  citaStore.idDoctor = doctor.id;
  router.push("/citas"); // navegar desde el código
}
```

## Paso 4 · El desplegable y las tarjetas

En `src/components/Servicios.vue`, busca la línea `</template>` (es la única de ese fichero, la que cierra todo el `<template>`) y pega esto **justo encima**:

```vue
  <section class="mt-10">
    <h2 class="mb-3 text-xl font-semibold">Os nosos doctores</h2>
    <!-- v-model guarda lo elegido; @change llama a verDoctores al cambiar -->
    <select v-model="especialidadeElixida" @change="verDoctores">
      <option value="">Escolle unha especialidade</option>
      <option v-for="e in especialidades" :key="e.id" :value="e.nomeesp">{{ e.nomeesp }}</option>
    </select>

    <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- :doctor="d" (con dos puntos) pasa el OBJETO d como prop. @pedir-cita="pedirCita" escucha el aviso
           del hijo: el nombre tiene que coincidir con el de emit('pedir-cita') -->
      <TarxetaDoctor v-for="d in doctores" :key="d.id" :doctor="d" @pedir-cita="pedirCita" />
    </div>
    <p v-if="especialidadeElixida && doctores.length === 0" class="mt-4 text-sm">
      Non hai doctores nesta especialidade.
    </p>
  </section>
```

Qué hace: `:doctor="d"` (con dos puntos) pasa el **objeto** completo. `@pedir-cita="pedirCita"` escucha el aviso: el nombre tiene que coincidir con el de `emit('pedir-cita')` del hijo.

## Qué deberías ver

1. Debajo de las tarjetas de servicios, un título «Os nosos doctores» y un desplegable.
2. Eliges una especialidad con doctores y salen sus tarjetas con nombre, teléfono y correo.
3. Una especialidad sin doctores muestra «Non hai doctores nesta especialidade.».
4. «Pedir cita» te lleva a Citas con ese doctor ya elegido en el formulario.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El botón de la tarjeta no hace nada | El nombre del evento no coincide: `emit('pedir-cita')` en el hijo y `@pedir-cita` en el padre |
| La tarjeta muestra `doctor` literal o nada | Falta el `:` en `:doctor="d"` |
| El desplegable sale vacío | Las especialidades no cargan: falta el `onMounted` del Paso 3 |
| `Failed to resolve import` | Revisa la ruta del import en el Paso 2 |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Props y emit | Los datos bajan al hijo por props y los avisos suben al padre por emit | `03_lecciones/02_router_comunicacion.md §8` |
| `v-for` con `:key` | Repite un elemento por cada elemento de una lista | `03_lecciones/vue/03_v_for.md` |
| `useRouter().push` | Navegar a otra página desde el código | `03_lecciones/02_router_comunicacion.md §7` |

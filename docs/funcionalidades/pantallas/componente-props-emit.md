# Componente hijo con props y emit

En la página de servicios, un desplegable de especialidades y debajo las tarjetas de sus doctores. Cada tarjeta es un componente nuevo, `TarjetaDoctor`, que **recibe** el doctor y **avisa** a la página cuando se pulsa «Pedir cita». Esa pulsación lleva a Citas con el doctor ya seleccionado.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Servicios** (`/servicios`). Necesitas doctores creados, con su especialidad.

## La idea

Los datos **bajan** del padre al hijo por **props**. Los avisos **suben** del hijo al padre por **emit**. El hijo no modifica lo que le llega: avisa, y el padre decide qué hacer.

```
Servicios.vue (padre)  ──:doctor="d"──▶  TarjetaDoctor.vue (hijo)
       ▲                                        │
       └──────── emit('pedir-cita', doctor) ────┘
```

Es el único sitio de la wiki donde se crea un componente hijo de verdad, así que es la receta típica para una pregunta de «comunicación entre componentes».

> `src/components/PlantillaComponente.vue` ya existe en tu proyecto, pero **no es esto**: es una pantalla CRUD completa de ejemplo, un molde para copiar. No está dada de alta en el router y no recibe props.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/TarjetaDoctor.vue` | Fichero **nuevo**: la tarjeta (el hijo) |
| `src/components/Servicios.vue` | El padre: desplegable, tarjetas y navegación |

## Paso 1 · El hijo

Crea el fichero `src/components/TarjetaDoctor.vue` con este contenido:

```vue
<template>
  <article class="rounded-2xl border border-[#e1e9e7] bg-white p-5 shadow-[0_5px_18px_rgba(20,60,45,0.06)]">
    <!-- Dentro del template las props se usan por su nombre, sin props. delante -->
    <h3 class="mb-1 text-lg font-bold text-[#153f2e]">
      {{ doctor.nomedoc }} {{ doctor.apeldoc }}
    </h3>
    <p class="mb-1 text-sm font-bold text-[#28695e]">
      {{ doctor.espedoc }}
    </p>
    <p class="text-sm text-[#64737a]">
      {{ doctor.movildoc }} · {{ doctor.maildoc || "Sin correo" }}
    </p>

    <!-- Al pulsar, el hijo lanza el aviso "pedir-cita" y le manda el doctor al padre.
         El hijo NO navega ni toca Pinia: eso es cosa del padre. -->
    <button
      class="mt-3 rounded-full bg-[#14543a] px-4 py-2 text-sm font-bold text-white"
      type="button"
      @click="emit('pedir-cita', doctor)"
    >
      Pedir cita
    </button>
  </article>
</template>

<script setup>
// defineProps declara los datos que el PADRE le pasa. El hijo solo los LEE.
// required: true -> si el padre no lo pasa, Vue avisa por la consola.
// No hay que importar defineProps ni defineEmits: en <script setup> ya existen.
defineProps({
  doctor: { type: Object, required: true },
});

// defineEmits declara los avisos que este componente puede enviar hacia arriba.
const emit = defineEmits(["pedir-cita"]);
</script>
```

## Paso 2 · La lógica del padre

En `src/components/Servicios.vue`, busca la línea `const servicios = [` y pega esto **justo encima**:

```js
import { ref } from 'vue'
// useRouter da acceso al router desde el codigo, para navegar sin que el usuario pulse un enlace.
import { useRouter } from 'vue-router'
import { obtenerEspecialidades } from '../api/especialidades.js'
import { getDoctorByEspecialidad } from '../api/doctores.js'
import { useDoctorStore } from '../store/doctorStore.js'
// Al importar el hijo ya se puede usar como etiqueta: <TarjetaDoctor />
import TarjetaDoctor from './TarjetaDoctor.vue'
import { alertaError } from '../utils/alertas.js'

const router = useRouter()
const doctorStore = useDoctorStore()

const especialidades = ref([])
const especialidadElegida = ref('')
const doctores = ref([])
const buscando = ref(false)

// Las especialidades se piden al abrir la pantalla. No hace falta onMounted:
// una llamada suelta en el script setup tambien funciona, solo que sin await.
obtenerEspecialidades()
  .then((lista) => (especialidades.value = lista))
  .catch(() => (especialidades.value = []))

// Al elegir una especialidad se piden al servidor solo los doctores de esa especialidad.
// getDoctorByEspecialidad manda el nombre en la URL: /api/doctores/Cardioloxia
async function verDoctores() {
  if (!especialidadElegida.value) {
    doctores.value = []
    return
  }

  buscando.value = true
  try {
    doctores.value = await getDoctorByEspecialidad(especialidadElegida.value)
  } catch {
    doctores.value = []
    alertaError('No se pudieron cargar los doctores de esa especialidad.')
  } finally {
    buscando.value = false
  }
}

// Aqui llega el aviso del hijo, con el doctor como argumento.
// El padre deja el doctor seleccionado en Pinia y navega a Citas.
function pedirCita(doctor) {
  doctorStore.seleccionarDoctor(doctor)
  router.push('/citas')
}
```

## Paso 3 · El desplegable y las tarjetas

En el `<template>`, busca la línea `</main>` y pega esto **justo encima**:

```vue
    <section aria-label="Nuestros doctores">
      <h2 class="mb-3 text-2xl font-bold text-[#153f2e]">
        Nuestros doctores
      </h2>

      <!-- v-model guarda lo elegido; @change llama a verDoctores al cambiar -->
      <select
        v-model="especialidadElegida"
        class="mb-4 rounded-lg border border-[#cfe0d6] px-3 py-2"
        @change="verDoctores"
      >
        <option value="">
          Elige una especialidad
        </option>
        <option
          v-for="e in especialidades"
          :key="e.id"
          :value="e.nm"
        >
          {{ e.nm }}
        </option>
      </select>

      <p v-if="buscando">
        Buscando doctores...
      </p>

      <div
        v-else-if="doctores.length"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <!-- :doctor="d" (CON dos puntos) pasa el objeto d como prop.
             @pedir-cita="pedirCita" escucha el aviso del hijo: el nombre tiene
             que coincidir exactamente con el de emit('pedir-cita'). -->
        <TarjetaDoctor
          v-for="d in doctores"
          :key="d._id"
          :doctor="d"
          @pedir-cita="pedirCita"
        />
      </div>

      <p v-else-if="especialidadElegida">
        No hay doctores en esa especialidad.
      </p>
    </section>
```

## Los tres errores clásicos

1. **`:doctor="d"` sin los dos puntos.** `doctor="d"` pasa el **texto** `"d"`, no el objeto. Luego `doctor.nomedoc` sale vacío y Vue avisa de que la prop no es un objeto.
2. **El nombre del evento no coincide.** `emit('pedir-cita')` en el hijo y `@pedir-cita` en el padre. Si en el hijo pones `emit('pedirCita')` y en el padre `@pedir-cita`, no pasa nada y no hay ningún error: es el fallo más difícil de encontrar.
3. **Modificar la prop en el hijo.** `doctor.nomedoc = "otro"` no se puede: las props son de solo lectura. Si el hijo necesita cambiar algo, avisa con `emit` y el padre lo cambia.

## Variante · Pasar varias props

```js
defineProps({
  doctor: { type: Object, required: true },
  // default: un valor si el padre no la pasa. Con Boolean conviene default: false.
  destacado: { type: Boolean, default: false },
})
```

Y en el padre: `:destacado="d.espedoc === 'Cardioloxía'"`.

## Variante · Dos avisos distintos

```js
const emit = defineEmits(['pedir-cita', 'ver-ficha'])
```

En el padre: `@pedir-cita="pedirCita" @ver-ficha="verFicha"`.

## Qué deberías ver

1. Debajo de las tarjetas de servicios, un título «Nuestros doctores» y un desplegable con las especialidades.
2. Al elegir una con doctores, salen sus tarjetas con nombre, especialidad, móvil y correo.
3. Una especialidad sin doctores muestra «No hay doctores en esa especialidad.».
4. «Pedir cita» lleva a Citas con ese doctor ya seleccionado: el aviso de «selecciona un doctor» ya no sale y el formulario lo muestra.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| La tarjeta sale vacía o Vue avisa de la prop | Falta el `:` en `:doctor="d"` |
| El botón de la tarjeta no hace nada y no hay error | El nombre del evento no coincide entre `emit(...)` y `@...` |
| `Failed to resolve import` | La ruta del import del Paso 2: desde `components/` el hijo es `./TarjetaDoctor.vue` |
| El desplegable sale vacío | La API de especialidades no responde: mira la consola de F12 |
| Elijo especialidad y no sale nada | Los doctores se filtran por el **nombre** exacto: el `:value` del `<option>` tiene que ser `e.nm` |
| Al pedir cita, Citas dice que falta el paciente | Es correcto: para **crear** una cita hacen falta los dos, paciente y doctor |
| `useRouter is not defined` | Falta su import en el Paso 2 |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `defineProps` | Los datos que el padre pasa al hijo; el hijo solo los lee |
| `defineEmits` | Los avisos que el hijo manda al padre |
| `:prop="valor"` | Con dos puntos se pasa el valor; sin ellos, un texto literal |
| `useRouter().push` | Navegar a otra pantalla desde el código |
| Componente importado | Al importarlo ya se puede usar como etiqueta |

## Guías relacionadas

- [Ruta con parámetro](ruta-con-parametro.md)
- [Elegir en una página y usarlo en otra](../pinia/pinia-seleccion.md)
- [Apuntes a fondo: rutas y componentes](../../detalle/03-rutas-y-componentes.md)

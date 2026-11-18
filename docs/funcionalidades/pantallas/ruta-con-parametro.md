# Ruta con parámetro

Un botón «Citas» en cada fila de pacientes que lleva a `/citas-paciente/<dni>`: una pantalla nueva con el nombre del paciente y la lista de sus citas. Si el DNI no existe, avisa. Tiene un botón para volver.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Necesitas al menos un paciente, y mejor si tiene citas.

## La idea

La parte `:dni` de la ruta es un **parámetro**: puede valer cualquier cosa, y la pantalla lo lee con `route.params.dni`.

**El detalle que cae en los exámenes:** cuando solo cambia el parámetro de la URL, Vue **reutiliza el mismo componente** y **no vuelve a ejecutar `onMounted`**. Por eso los datos se piden desde un `watch` con `{ immediate: true }`, que sirve para las dos cosas: la primera carga y los cambios posteriores.

> En este proyecto el paciente se identifica por su **DNI**, no por el `_id`: así lo hace `getPacienteByDni` y así guardan las citas su referencia (`pacienteDNI`). Por eso el parámetro es el DNI y no hay que escribir ninguna función de API nueva.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/CitasPaciente.vue` | Fichero **nuevo**: la pantalla |
| `src/router/index.js` | La ruta nueva |
| `src/components/XestionPacientes.vue` | El botón «Citas» de cada fila |

`src/api/pacientes.js` y `src/api/citas.js` no se tocan: ya tienen lo necesario.

## Paso 1 · La pantalla

Crea el fichero `src/components/CitasPaciente.vue` con este contenido:

```vue
<template>
  <main class="flex flex-1 flex-col gap-6 rounded-lg bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-8">
    <!-- El titulo cambia segun haya paciente o no: condicion ? si_cierto : si_falso -->
    <h4>
      {{ paciente ? `Citas de ${paciente.nomepac} ${paciente.apelpac}` : "Citas del paciente" }}
    </h4>

    <!-- v-if / v-else-if / v-else: solo se pinta UNA de las opciones -->
    <p v-if="cargando">
      Cargando...
    </p>
    <p v-else-if="noEncontrado">
      No se encontró ningún paciente con el DNI {{ route.params.dni }}.
    </p>
    <p v-else-if="citas.length === 0">
      Este paciente no tiene citas.
    </p>
    <div v-else class="tabla-wrapper">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Motivo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in citas" :key="item._id">
            <td>{{ item.fecha }}</td>
            <td>{{ item.hora }}</td>
            <td>{{ item.motivo }}</td>
            <td>{{ item.estado }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- RouterLink navega sin recargar la pagina -->
    <RouterLink to="/XestionPacientes">
      ← Volver a pacientes
    </RouterLink>
  </main>
</template>

<script setup>
import { ref, watch } from "vue"
// useRoute() es la ruta ACTUAL: de ahi se leen los parametros.
// No confundir con useRouter(), que es el que navega.
import { useRoute } from "vue-router"
import { getPacienteByDni } from "../api/pacientes.js"
import { getCitas } from "../api/citas.js"

const route = useRoute()

const paciente = ref(null)
const citas = ref([])
const noEncontrado = ref(false)
const cargando = ref(false)

// watch vigila route.params.dni y ejecuta la funcion cuando cambia.
// Se vigila con () => route.params.dni, una funcion que devuelve el valor:
// si se pusiera route.params.dni a secas, se vigilaria el texto de ahora y
// nunca volveria a saltar.
// { immediate: true } la ejecuta tambien al entrar. Sin eso, al abrir la
// pantalla no pasaria nada, porque el valor todavia no ha "cambiado".
watch(
  () => route.params.dni,
  async (dni) => {
    noEncontrado.value = false
    paciente.value = null
    citas.value = []

    if (!dni) {
      return
    }

    cargando.value = true
    try {
      // getPacienteByDni rechaza la promesa si el backend responde 404.
      paciente.value = await getPacienteByDni(dni)
      // Las citas guardan el DNI del paciente en pacienteDNI.
      citas.value = await getCitas({ pacienteDNI: dni })
    } catch {
      // DNI inventado (404) o la base de datos caida (503): se avisa en pantalla.
      noEncontrado.value = true
    } finally {
      cargando.value = false
    }
  },
  { immediate: true }
)
</script>
```

## Paso 2 · La ruta

En `src/router/index.js` hay dos cambios.

**2.1** Busca la línea `import NotFound from '../components/NotFound.vue'` y pega esto **justo encima**:

```js
import CitasPaciente from '../components/CitasPaciente.vue'
```

**2.2** Busca la línea `// Comodin al final: recoge las URLs que no coinciden con ninguna ruta anterior.` y pega esto **justo encima**:

```js
    // :dni es un parametro: /citas-paciente/12345678Z tambien encaja con esta ruta,
    // y "12345678Z" llega a la pantalla en route.params.dni.
    // TIENE que ir antes del comodin: el router prueba las rutas en orden y el
    // comodin se queda con todo lo que llegue a el.
    { path: '/citas-paciente/:dni', name: 'CitasPaciente', component: CitasPaciente },
```

Puedes probarlo ya, antes de poner el botón: escribe en el navegador `localhost:5173/citas-paciente/` seguido de un DNI que exista.

## Paso 3 · El botón en la tabla de pacientes

En `src/components/XestionPacientes.vue` hay dos cambios.

**3.1** Busca la línea `const pacienteStore = usepacienteStore();` y pega esto **justo debajo**:

```js
// useRouter() es el router: sirve para ordenarle que navegue (router.push).
// No confundir con useRoute(), que es la ruta actual.
import { useRouter } from "vue-router";
const router = useRouter();
```

**3.2** Busca la línea `{{ pacienteStore.idPaciente === u._id ? "✅" : "👤" }}` (es el emoji del botón de seleccionar). Debajo hay un `</button>` que lo cierra. Pega esto **justo debajo de ese `</button>`**:

```vue
              <!-- Los acentos graves permiten meter el DNI dentro de la ruta -->
              <button
                class="btn-accion"
                type="button"
                title="Citas del paciente"
                aria-label="Citas del paciente"
                @click="router.push(`/citas-paciente/${u.dnipac}`)"
              >
                📅
              </button>
```

## Variante · Carga perezosa del componente

En tu router todas las pantallas se importan arriba, así que entran en el paquete inicial. Una ruta a la que casi nunca se entra puede cargarse solo cuando se usa:

```js
    { path: '/citas-paciente/:dni', name: 'CitasPaciente', component: () => import('../components/CitasPaciente.vue') },
```

Así se puede saltar el Paso 2.1: no hace falta el `import` de arriba. Es más rápido al arrancar, pero mezcla dos estilos en el mismo fichero; para el examen vale cualquiera de los dos, sabiendo explicar la diferencia.

## Variante · Parámetro opcional

Con un `?` detrás, el parámetro puede faltar:

```js
    { path: '/citas-paciente/:dni?', name: 'CitasPaciente', component: CitasPaciente },
```

Entonces `/citas-paciente` sin nada también entra, y `route.params.dni` llega `undefined`. De ahí el `if (!dni) return` del Paso 1.

## Variante · Leerlo con props en vez de `useRoute`

```js
    { path: '/citas-paciente/:dni', name: 'CitasPaciente', component: CitasPaciente, props: true },
```

Con `props: true`, el parámetro llega como una prop normal y en la pantalla se declara `defineProps({ dni: String })`. Queda más limpio y el componente se puede probar sin router.

## Qué deberías ver

1. Un icono 📅 en cada fila de pacientes.
2. Al pulsarlo, la URL pasa a `/citas-paciente/12345678Z` y salen el nombre del paciente y la tabla de sus citas.
3. Cambia el DNI de la URL a mano por uno inventado: «No se encontró ningún paciente con el DNI…».
4. «Volver a pacientes» devuelve a la tabla.
5. Con dos pacientes, cambia el DNI de la URL de uno al otro: los datos cambian. **Eso es lo que demuestra que el `watch` funciona**; con `onMounted` la pantalla se quedaría con los datos del primero.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Sale la pantalla de «página no encontrada» | La ruta quedó **después** del comodín `/:pathMatch(.*)`: tiene que ir antes |
| La pantalla sale vacía al entrar | Falta `{ immediate: true }` en el `watch` |
| Al cambiar el DNI en la URL no se actualiza | Vigilaste `route.params.dni` sin la flecha: tiene que ser `() => route.params.dni` |
| `router.push is not a function` | Importaste `useRoute` en vez de `useRouter` en el Paso 3.1 |
| `Failed to resolve component: CitasPaciente` | Falta el Paso 2.1, el import en el router |
| Siempre «no se encontró» | El DNI de la URL no está en mayúsculas: el backend los guarda así |
| El botón no hace nada | Falta el `const router = useRouter();` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Parámetro en la ruta | `/ruta/:algo`, se lee con `route.params.algo` |
| `useRoute` frente a `useRouter` | La ruta actual frente al objeto que navega |
| `watch` con `immediate` | Reaccionar a los cambios y ejecutarse también al entrar |
| Orden de las rutas | El comodín va siempre el último |
| `router.push` | Navegar desde el código |

## Guías relacionadas

- [Componente hijo con props y emit](componente-props-emit.md)
- [Apuntes a fondo: rutas y componentes](../../detalle/03-rutas-y-componentes.md)

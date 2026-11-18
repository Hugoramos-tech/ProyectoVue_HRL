# Rutas, navegación y componentes

[← Anterior: formularios y campos](02-formularios-y-campos.md) · [Índice](README.md)

Todo lo que pueden pedirte sobre **moverse entre pantallas y partirlas en piezas**: una pantalla nueva, parámetros en la URL, navegar desde el código, el título de la pestaña, proteger rutas, props y emit, un `v-model` propio, slots y el ciclo de vida.

## En esta página

1. [Cómo está montado el router](#1-cómo-está-montado-el-router)
2. [Lo que necesitas saber](#2-lo-que-necesitas-saber)
3. [Una pantalla nueva](#3-una-pantalla-nueva)
4. [Ruta con parámetro](#4-ruta-con-parámetro)
5. [Filtrar por la URL](#5-filtrar-por-la-url)
6. [Navegar desde el código](#6-navegar-desde-el-código)
7. [Título de la pestaña](#7-título-de-la-pestaña)
8. [Proteger rutas con un login sencillo](#8-proteger-rutas-con-un-login-sencillo)
9. [Componente hijo con props y emit](#9-componente-hijo-con-props-y-emit)
10. [Un v-model propio](#10-un-v-model-propio)
11. [Un modal con slots](#11-un-modal-con-slots)
12. [Ciclo de vida: un reloj](#12-ciclo-de-vida-un-reloj)
13. [Pinia: compartir entre pantallas](#13-pinia-compartir-entre-pantallas)
14. [Si te piden esto, mira aquí](#14-si-te-piden-esto-mira-aquí)
15. [Fallos que quitan puntos](#15-fallos-que-quitan-puntos)
16. [Recetas cortas](#16-recetas-cortas)

## 1. Cómo está montado el router

`src/router/index.js` tiene **un array escrito a mano**: un objeto por pantalla, con `path`,
`name` y `component`. Los componentes se importan arriba, todos a la vez.

```js
const routes = [
    { path: '/', name: 'Inicio', component: Inicio },
    { path: '/servicios', name: 'Servicios', component: Servicios },
    { path: '/XestionPacientes', name: 'XestionPacientes', component: XestionPacientes },
    { path: '/XestionDoctores', name: 'XestionDoctores', component: XestionDoctores },
    { path: '/citas', name: 'Citas', component: Citas},
    { path: '/SobreNos', name: 'SobreNos', component: SobreNos },
    { path: '/avisoLegal', name: 'AvisoLegal', component: AvisoLegal},
    { path: '/politica-privacidad', name: 'PoliticaPrivacidad', component: PoliticaPrivacidad },
    // Comodin al final: recoge las URLs que no coinciden con ninguna ruta anterior.
    { path: '/:pathMatch(.*)', name: 'NotFound', component: NotFound }
]
```

Tres cosas que conviene tener claras:

1. **No hay `meta`.** Ninguna ruta lleva título, icono ni marca de menú.
2. **El menú no se genera.** `src/components/NavBar.vue` tiene los enlaces escritos uno a
   uno, con `<RouterLink>`. Añadir una pantalla al menú es añadir un `<li>` a mano.
3. **El comodín va el último.** El router prueba las rutas **en orden** y el comodín se queda
   con todo lo que llegue a él. Una ruta nueva colocada después del comodín no se alcanza
   nunca.

`App.vue` es el esqueleto: `NavBar`, el `<RouterView>` donde se pinta la pantalla actual, y
`FooTer`.

## 2. Lo que necesitas saber

**`createWebHistory`**: URLs limpias (`/citas`, no `/#/citas`). A cambio, el servidor tiene
que devolver `index.html` para cualquier ruta. Con `npm start` lo hace Vite; en producción
hay que configurarlo.

**`<RouterLink to="/citas">`**: un enlace que **no recarga** la página. Un `<a href="/citas">`
sí recargaría: se descarga toda la aplicación de nuevo y se pierde todo lo que haya en Pinia.

**`<RouterView>`**: el hueco donde el router pinta el componente de la ruta actual.

**`useRoute()`** es la ruta **actual**: de ahí se leen `route.params` y `route.query`.
**`useRouter()`** es el objeto que **navega**: `router.push(...)`. Se confunden
constantemente, y el error que da (`router.push is not a function`) no dice cuál es el
problema.

**`route.params`** es la parte `:algo` del `path`. **`route.query`** es lo que va detrás del
`?`. Los dos llegan siempre como **texto**.

**Reutilización de componentes**: si solo cambia el parámetro de la URL, Vue **reutiliza el
mismo componente** y **no vuelve a ejecutar `onMounted`**. Por eso los datos de una ruta con
parámetro se piden desde un `watch`.

**Props**: los datos bajan del padre al hijo. **Emit**: los avisos suben del hijo al padre. El
hijo nunca modifica lo que le llega.

## 3. Una pantalla nueva

Tres cambios, en este orden.

**1. El componente.** Crea `src/components/MiPantalla.vue` con la estructura de las demás:
`<template>` con un `<main>` o `<section>`, y `<script setup>`.

**2. La ruta.** En `src/router/index.js`, el import arriba:

```js
import MiPantalla from '../components/MiPantalla.vue'
```

Y la entrada **antes del comodín**:

```js
    { path: '/mi-pantalla', name: 'MiPantalla', component: MiPantalla },
```

Pruébalo ya escribiendo la URL a mano, antes de poner el enlace: así sabes si el fallo está
en la ruta o en el menú.

**3. El menú.** En `src/components/NavBar.vue`, un `<li>` más, copiando las clases de otro
enlace y cambiando solo el `to` y el texto. Son largas porque están repetidas en cada enlace:
cópialas tal cual.

### Carga perezosa

Si la pantalla casi nunca se usa, se puede cargar solo cuando se entra en ella:

```js
    { path: '/mi-pantalla', name: 'MiPantalla', component: () => import('../components/MiPantalla.vue') },
```

Así no hace falta el import de arriba, y el arranque es más rápido porque ese código no entra
en el paquete inicial. Tu proyecto no lo usa: todas las pantallas se importan de golpe. Para
un examen vale cualquiera de las dos, sabiendo explicar la diferencia.

## 4. Ruta con parámetro

```js
    { path: '/citas-paciente/:dni', name: 'CitasPaciente', component: CitasPaciente },
```

```js
const route = useRoute()

// watch vigila el parametro. () => route.params.dni es una FUNCION que devuelve
// el valor: sin la flecha se vigilaria el texto de ahora y nunca volveria a saltar.
// { immediate: true } la ejecuta tambien al entrar.
watch(
  () => route.params.dni,
  async (dni) => {
    if (!dni) {
      return
    }
    try {
      paciente.value = await getPacienteByDni(dni)
      citas.value = await getCitas({ pacienteDNI: dni })
    } catch {
      noEncontrado.value = true
    }
  },
  { immediate: true }
)
```

**Por qué `watch` y no `onMounted`.** Es la pregunta de esta sección. Si estás en
`/citas-paciente/11111111H` y navegas a `/citas-paciente/22222222J`, el componente es el
mismo: Vue lo reutiliza y `onMounted` **no se vuelve a ejecutar**. La pantalla se quedaría con
los datos del primero, sin dar ningún error. El `watch` sí salta, y con `{ immediate: true }`
sirve también para la primera carga: una sola pieza para los dos casos.

**En este proyecto el parámetro natural es el DNI**, no el `_id`: así identifica al paciente
`getPacienteByDni`, y así lo guardan las citas (`pacienteDNI`). El doctor, en cambio, se
identifica por su `_id`. No mezclarlos es el origen de la mitad de los `404` y los
`CastError` de este proyecto.

### Variantes del parámetro

| Forma | Qué hace |
|---|---|
| `/ruta/:id` | Obligatorio |
| `/ruta/:id?` | Opcional: `/ruta` también entra, y `params.id` llega `undefined` |
| `/ruta/:id(\\d+)` | Solo si son dígitos |
| `props: true` en la ruta | El parámetro llega como una prop normal |

Con `props: true` el componente se declara con `defineProps({ dni: String })` y se puede
probar sin router. Queda más limpio.

Receta completa: [ruta con parámetro](../funcionalidades/pantallas/ruta-con-parametro.md).

## 5. Filtrar por la URL

`route.query` es lo que va detrás del `?`. Sirve para que un filtro se pueda **compartir por
enlace** y sobreviva a recargar la página.

```js
const route = useRoute()
const router = useRouter()

// El filtro sale de la URL. ?? "" porque si no esta, llega undefined.
const filtroEstado = computed({
  get: () => route.query.estado ?? "",
  // Al escribir en el computed se navega: la URL pasa a ser la fuente del filtro.
  // replace en vez de push para no llenar el historial de pasos atras.
  set: (valor) => router.replace({ query: { ...route.query, estado: valor || undefined } }),
})
```

Un `computed` con `get` y `set` se usa con `v-model` igual que un `ref`:
`<select v-model="filtroEstado">`. Así el desplegable escribe en la URL y la URL alimenta el
desplegable, sin ninguna variable intermedia.

El `|| undefined` quita la clave de la URL cuando el filtro está vacío, en vez de dejar un
`?estado=` suelto.

**Cuándo merece la pena:** cuando el filtro se quiere poder compartir («mándame el enlace de
las canceladas») o conservar al recargar. Para un filtro de usar y tirar, un `ref` normal es
más simple.

## 6. Navegar desde el código

```js
const router = useRouter()

router.push('/citas')                                   // por texto
router.push({ name: 'Citas' })                          // por nombre
router.push({ name: 'CitasPaciente', params: { dni } })  // con parámetro
router.push({ name: 'Citas', query: { estado: 'pendente' } })  // con query
router.replace('/citas')                                // sin dejar paso atrás
router.back()                                           // atrás
```

Navegar **por nombre** es más seguro: si cambia el `path`, los `push` siguen funcionando. Con
texto habría que buscarlos todos.

`push` deja un paso en el historial; `replace` lo sustituye. Después de guardar un formulario
suele querer`se` `replace`: si no, el botón «atrás» devuelve al formulario a medio enviar.

En el template, un enlace es `<RouterLink to="...">`, no un `<a href>`.

## 7. Título de la pestaña

Tu router no tiene `meta`, así que hay dos formas.

**La corta**, en `src/router/index.js`, después de crear el router y antes del `export`:

```js
// afterEach se ejecuta despues de cada navegacion y recibe la ruta de destino.
// to.name es el nombre de la ruta, que en este proyecto ya es descriptivo.
router.afterEach((to) => {
  document.title = to.name ? `${to.name} · Clínica` : "Clínica"
})
```

**La completa**, añadiendo `meta` a las rutas, que es el mecanismo que preguntan:

```js
    { path: '/citas', name: 'Citas', component: Citas, meta: { titulo: 'Citas' } },
```

```js
router.afterEach((to) => {
  document.title = to.meta.titulo ? `${to.meta.titulo} · Clínica` : "Clínica"
})
```

`meta` es un sitio libre para colgar lo que quieras de cada ruta: un título, un icono, una
marca de «requiere login». El router no lo usa; lo usas tú.

## 8. Proteger rutas con un login sencillo

Un **guard** es una función que decide si una navegación se permite. Hacen falta tres cosas:
un store que recuerde la sesión, una marca en las rutas protegidas y el guard.

**El store** (`src/store/authStore.js`), con el mismo estilo de opciones que tus otros dos:

```js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    usuario: "",
    logueado: false,
  }),
  actions: {
    entrar(nombre, clave) {
      // Usuario fijo: un login real validaria contra el backend.
      if (nombre === "admin" && clave === "1234") {
        this.usuario = nombre;
        this.logueado = true;
        return true;
      }
      return false;
    },
    salir() {
      this.usuario = "";
      this.logueado = false;
    },
  },
});
```

Fíjate en que es **estilo opciones** (`state` y `actions`), como `pacienteStore.js` y
`doctorStore.js`. Dentro de las acciones el estado se toca con `this`. El otro estilo, el de
función, también existe, pero mezclar los dos en el mismo proyecto queda mal.

**La marca**, en las rutas que la necesiten:

```js
    { path: '/XestionDoctores', name: 'XestionDoctores', component: XestionDoctores, meta: { requiereLogin: true } },
```

**El guard**, en `router/index.js`, después de crear el router:

```js
import { useAuthStore } from "../store/authStore.js";

// beforeEach se ejecuta ANTES de cada navegacion.
// Si devuelve una ruta, redirige alli. Si no devuelve nada, deja pasar.
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiereLogin && !auth.logueado) {
    // Se guarda a donde queria ir, para llevarlo alli despues de entrar.
    return { name: "Login", query: { destino: to.fullPath } };
  }
});
```

La pantalla `Login` es una ruta más, con dos campos y un botón que llama a `auth.entrar(...)`
y, si va bien, hace `router.push(route.query.destino || "/")`.

**Un detalle que falla si no lo sabes:** el guard usa Pinia, así que Pinia tiene que estar
instalada antes de la primera navegación. En tu `main.js` ya lo está, porque `createPinia()`
va antes de `router`. Si estuviera al revés, el guard petaría al arrancar.

**Y lo honesto que hay que decir:** un login así **no es seguro**. El usuario y la clave están
en el código que se descarga el navegador, y la sesión vive solo en memoria. Sirve para
enseñar el mecanismo de los guards. La seguridad real exige validar en el backend y que el
servidor rechace las peticiones sin credenciales: el guard solo esconde pantallas, no protege
datos.

## 9. Componente hijo con props y emit

El único sitio donde crear un componente hijo de verdad en este proyecto: la página de
servicios.

**El hijo** (`src/components/TarjetaDoctor.vue`):

```vue
<script setup>
// defineProps: los datos que el PADRE le pasa. El hijo solo los LEE.
// No hay que importar defineProps ni defineEmits: en <script setup> ya existen.
defineProps({
  doctor: { type: Object, required: true },
});

// defineEmits: los avisos que este componente puede mandar hacia arriba.
const emit = defineEmits(["pedir-cita"]);
</script>

<template>
  <article>
    <h3>{{ doctor.nomedoc }} {{ doctor.apeldoc }}</h3>
    <p>{{ doctor.espedoc }}</p>
    <!-- El hijo NO navega ni toca Pinia: avisa, y el padre decide. -->
    <button type="button" @click="emit('pedir-cita', doctor)">Pedir cita</button>
  </article>
</template>
```

**El padre** (`Servicios.vue`):

```vue
        <TarjetaDoctor
          v-for="d in doctores"
          :key="d._id"
          :doctor="d"
          @pedir-cita="pedirCita"
        />
```

```js
function pedirCita(doctor) {
  // El padre es quien guarda y navega.
  doctorStore.seleccionarDoctor(doctor)
  router.push('/citas')
}
```

**Los tres errores de esta sección:**

1. **`:doctor="d"` sin los dos puntos.** `doctor="d"` pasa el **texto** `"d"`, no el objeto.
2. **El nombre del evento no coincide.** `emit('pedir-cita')` y `@pedir-cita`. Si en el hijo
   pones `pedirCita` y en el padre `@pedir-cita`, **no pasa nada y no hay ningún error**: es
   el fallo más difícil de encontrar de todos.
3. **Modificar la prop en el hijo.** Las props son de solo lectura. Si el hijo necesita
   cambiar algo, avisa con `emit` y el padre lo cambia. Ese es el principio: **los datos bajan,
   los avisos suben.**

> `src/components/PlantillaComponente.vue` ya existe en tu proyecto, pero no es esto: es una
> pantalla CRUD completa de ejemplo, un molde para copiar. No recibe props ni está en el
> router.

Receta completa: [props y emit](../funcionalidades/pantallas/componente-props-emit.md).

## 10. Un v-model propio

Un componente que se comporta como un campo: el padre lo usa con `v-model` y recibe el valor.
Con `defineModel` (Vue 3.4 o posterior; tu proyecto usa Vue 3) es muy corto.

```vue
<script setup>
// defineModel devuelve un ref ligado al v-model del padre:
// escribir aqui cambia la variable del padre.
const texto = defineModel({ type: String, default: "" });
defineProps({ placeholder: { type: String, default: "Buscar..." } });
</script>

<template>
  <input v-model="texto" type="search" :placeholder="placeholder">
</template>
```

```vue
<BuscadorTexto v-model="busqueda" placeholder="Buscar paciente" />
```

**La versión larga**, que es la que hay que saber explicar, porque `defineModel` es solo el
atajo de esto:

```js
// v-model en un componente son dos cosas: una prop llamada modelValue
// y un evento llamado update:modelValue.
const props = defineProps({ modelValue: { type: String, default: "" } })
const emit = defineEmits(["update:modelValue"])
```

```vue
  <input :value="modelValue" @input="emit('update:modelValue', $event.target.value)">
```

`v-model="x"` en una etiqueta es exactamente `:modelValue="x"` más
`@update:modelValue="x = $event"`. Saber eso explica también por qué un `v-model` no funciona
en un componente que no declara esa prop y ese emit.

## 11. Un modal con slots

Un **slot** es un hueco: lo que va dentro lo decide quien usa el componente. Es la otra forma
de pasar cosas a un hijo, además de las props: las props pasan **datos**, los slots pasan
**contenido**.

```vue
<script setup>
const abierto = defineModel({ type: Boolean, default: false });
defineProps({ titulo: { type: String, default: "" } });
</script>

<template>
  <!-- Teleport mueve el modal al final del <body>: asi ningun overflow
       ni z-index de la pantalla lo recorta. -->
  <Teleport to="body">
    <div v-if="abierto" class="fondo-modal" @click.self="abierto = false">
      <div class="caja-modal">
        <h3>{{ titulo }}</h3>
        <!-- El hueco principal: aqui va lo que ponga el padre -->
        <slot />
        <!-- Un hueco con nombre, con contenido por defecto si el padre no lo rellena -->
        <slot name="acciones">
          <button type="button" @click="abierto = false">Cerrar</button>
        </slot>
      </div>
    </div>
  </Teleport>
</template>
```

```vue
  <ModalBase v-model="verFicha" titulo="Ficha del paciente">
    <p>{{ paciente.nomepac }} {{ paciente.apelpac }}</p>
    <template #acciones>
      <button type="button" @click="descargarPdf">Descargar PDF</button>
    </template>
  </ModalBase>
```

`@click.self` solo salta si el clic fue en **ese** elemento y no en un hijo: así cerrar
pulsando el fondo no cierra al pulsar dentro de la caja. Es un detalle de dos caracteres que
distingue un modal usable de uno molesto.

> Para un aviso o una confirmación, en este proyecto **no hace falta un modal**: ya tienes
> SweetAlert2 en `src/utils/alertas.js`. Un modal propio tiene sentido cuando el contenido es
> complejo: un formulario, una ficha, una tabla.

## 12. Ciclo de vida: un reloj

```js
import { ref, onMounted, onUnmounted } from "vue"

const hora = ref("")
let temporizador = null

function actualizar() {
  hora.value = new Date().toLocaleTimeString("es-ES")
}

// onMounted: cuando el componente aparece en la pagina.
onMounted(() => {
  actualizar()
  // setInterval repite cada 1000 ms y devuelve un identificador.
  temporizador = setInterval(actualizar, 1000)
})

// onUnmounted: cuando el componente se va.
// SIN ESTO el intervalo sigue corriendo para siempre, aunque cambies de pantalla:
// cada visita deja uno nuevo, y se van acumulando. Es una fuga de memoria.
onUnmounted(() => clearInterval(temporizador))
```

**La regla:** todo lo que se crea en `onMounted` y sigue vivo por su cuenta
(`setInterval`, `setTimeout`, un `addEventListener`, un `IntersectionObserver`,
una conexión) se tiene que deshacer en `onUnmounted`. Es la pregunta típica de ciclo de vida,
y lo que esperan oír es exactamente eso.

| Gancho | Cuándo |
|---|---|
| `onMounted` | El componente ya está en la página: aquí se piden los datos |
| `onUnmounted` | Se va: aquí se limpia |
| `onUpdated` | Se repintó por un cambio de datos (raro de necesitar) |

En tus tres pantallas de datos, `onMounted` es donde se llama a la API. Y recuerda lo del
apartado [4](#4-ruta-con-parámetro): si solo cambia un parámetro de la URL, `onMounted` **no**
se vuelve a ejecutar.

## 13. Pinia: compartir entre pantallas

Tus dos stores son muy pequeños a propósito:

```js
export const usepacienteStore = defineStore("paciente", {
  state: () => ({
    pacientes: [],
    idPaciente: null,
    dnipac: null,
    nomepac: null,
    apelpac: null,
  }),
  actions: {
    seleccionarPaciente(paciente) { ... },
    limpiarPaciente() { ... },
  },
})
```

**Lo que hacen y lo que no:** guardan **quién está seleccionado**, no las listas. Las listas
se piden al servidor en cada pantalla. Por eso `Citas.vue` sabe de qué paciente y de qué
doctor hablar sin que haya que elegirlos otra vez: los eligió la pantalla de pacientes y la
de doctores.

**Ese es el patrón que demuestra que entiendes Pinia:** un dato que necesitan varias
pantallas no se pasa por la URL ni por props; vive en un store.

**Usarlo en un componente:**

```js
const pacienteStore = usepacienteStore()
// Se lee directamente: pacienteStore.dnipac
// Se escribe con sus acciones: pacienteStore.seleccionarPaciente(paciente)
```

**`storeToRefs` solo hace falta si desestructuras:**

```js
// Esto ROMPE la reactividad: dnipac queda con el valor de ahora y no cambia nunca.
const { dnipac } = pacienteStore

// Esto la conserva.
const { dnipac } = storeToRefs(pacienteStore)
```

Mientras escribas `pacienteStore.dnipac` no necesitas `storeToRefs` para nada. Tus
componentes lo hacen así, y está bien.

## 14. Si te piden esto, mira aquí

| El enunciado dice | Apartado |
|---|---|
| «una pantalla nueva» | [3](#3-una-pantalla-nueva) |
| «al pulsar, que lleve a una página con…» | [4](#4-ruta-con-parámetro) |
| «que el filtro se vea en la URL» | [5](#5-filtrar-por-la-url) |
| «que después de guardar vaya a…» | [6](#6-navegar-desde-el-código) |
| «el título de la pestaña» | [7](#7-título-de-la-pestaña) |
| «que no se pueda entrar sin login» | [8](#8-proteger-rutas-con-un-login-sencillo) |
| «un componente que reciba… y avise» | [9](#9-componente-hijo-con-props-y-emit) |
| «un componente reutilizable con `v-model`» | [10](#10-un-v-model-propio) |
| «un modal», «una ventana» | [11](#11-un-modal-con-slots) |
| «un reloj», «que se actualice cada X» | [12](#12-ciclo-de-vida-un-reloj) |
| «elegir en una pantalla y usarlo en otra» | [13](#13-pinia-compartir-entre-pantallas) |

## 15. Fallos que quitan puntos

1. **La ruta nueva después del comodín.** Sale la pantalla de 404 y la ruta parece correcta.
2. **`useRoute` en vez de `useRouter`** (o al revés). `router.push is not a function`.
3. **`onMounted` en una ruta con parámetro.** Al cambiar el parámetro no se actualiza nada.
4. **`watch(route.params.dni, ...)` sin la flecha.** El `watch` no salta nunca.
5. **Olvidar `{ immediate: true }`.** La pantalla sale vacía al entrar.
6. **`:prop` sin los dos puntos.** Se pasa el texto en vez del valor.
7. **El nombre del `emit` no coincide.** Silencio absoluto, sin error.
8. **Olvidar el import del componente en el router.** `Failed to resolve component`.
9. **No añadir el `<li>` al NavBar.** La ruta funciona pero no hay cómo llegar.
10. **No limpiar en `onUnmounted`.** Intervalos y escuchadores acumulándose.
11. **Desestructurar un store sin `storeToRefs`.** El dato se queda congelado.
12. **Un `<a href>` en lugar de `<RouterLink>`.** Recarga la aplicación y vacía Pinia.
13. **Confundir el DNI del paciente con el `_id` del doctor.** `404` o `CastError`.

## 16. Recetas cortas

- [Componente hijo con props y emit](../funcionalidades/pantallas/componente-props-emit.md)
- [Ruta con parámetro](../funcionalidades/pantallas/ruta-con-parametro.md)
- [Elegir en una página y usarlo en otra](../funcionalidades/pinia/pinia-seleccion.md)
- [Contador en el menú](../funcionalidades/pinia/contador-en-el-menu.md)
- [Citas de hoy en la portada](../funcionalidades/pinia/citas-de-hoy.md)
- [Saludo y reloj](../funcionalidades/pequenas-mejoras/saludo-y-reloj.md)
- [Reprogramar una cita](../funcionalidades/pequenas-mejoras/reprogramar-cita.md)
- [Mapa del proyecto](../proyecto/mapa.md)

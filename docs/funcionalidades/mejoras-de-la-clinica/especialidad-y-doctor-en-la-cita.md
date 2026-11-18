# Elegir la especialidad y después el doctor, en el formulario de citas

Dos desplegables en cascada en el formulario de citas: primero la **especialidad** y después el **doctor**, que solo ofrece los de esa especialidad. Así no hay que buscar un cardiólogo entre todos los doctores.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Necesitas doctores de al menos dos especialidades.

## La idea

Es el mismo patrón que provincia → municipio: el segundo desplegable lee una lista que
**depende** del primero. Se guarda la especialidad elegida, un `computed` filtra los doctores
por ella, y si el doctor que estaba elegido ya no está en la lista, se borra.

> **Esto cambia cómo funciona tu pantalla.** Hoy el desplegable de doctor está `disabled`: el
> doctor se elige en su propia pestaña y llega por Pinia. Esta receta lo **activa**, para que
> se pueda elegir desde aquí. Es un cambio razonable y lo que pediría un enunciado de
> «desplegables dependientes», pero conviene saber que es eso lo que estás haciendo.
>
> El paciente se queda como está: se sigue eligiendo en su pestaña.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | La lógica y los dos desplegables |

## Paso 1 · Los imports

**No hay que tocar nada.** `ref`, `computed` y `watch` ya están importados en este fichero, y
`doctores` ya es un `ref` que se rellena en `cargarDatos()` con `getDoctores()`.

## Paso 2 · La lógica

Busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega esto **justo encima**:

```js
// Especialidad elegida en el desplegable nuevo. "" significa "todas".
const especialidadElegida = ref("")

// Las especialidades que REALMENTE tienen doctores, sin repetir.
// new Set(...) quita los duplicados; [...] lo convierte otra vez en lista.
// sort() las deja en orden alfabetico.
const especialidadesDisponibles = computed(() =>
  [...new Set(doctores.value.map((d) => d.espedoc))].filter(Boolean).sort()
)

// Los doctores que se pueden elegir: los de esa especialidad, o todos si no hay ninguna.
// Se recalcula sola cuando cambia la especialidad o la lista de doctores.
const doctoresDeLaEspecialidad = computed(() =>
  especialidadElegida.value
    ? doctores.value.filter((d) => d.espedoc === especialidadElegida.value)
    : doctores.value
)

// Al cambiar la especialidad, si el doctor elegido no es de la nueva, se quita la seleccion.
// Sin esto, el formulario podria enviar un doctor que ya no aparece en el desplegable:
// es el fallo clasico de los desplegables en cascada.
function cambiarEspecialidad() {
  const sigueValiendo = doctoresDeLaEspecialidad.value.some(
    (d) => String(d._id) === String(doctorStore.idDoctor)
  )

  if (!sigueValiendo) {
    doctorStore.limpiarDoctor()
  }
}

// Cuando se elige un doctor en el desplegable, se guarda en Pinia igual que lo haria
// la pantalla de doctores: asi el resto de la aplicacion lo ve.
function elegirDoctor(id) {
  const doctor = doctores.value.find((d) => String(d._id) === String(id))

  if (doctor) {
    doctorStore.seleccionarDoctor(doctor)
  } else {
    doctorStore.limpiarDoctor()
  }
}
```

`limpiarDoctor()` y `seleccionarDoctor()` son las dos acciones que ya tiene tu
`doctorStore.js`: no hay que escribir nada en el store.

## Paso 3 · El desplegable de especialidad

En el `<template>`, busca la línea `            <label for="doctor-cita">Doctor:</label>` y mira el `<div class="citas-campo">` que la contiene, dos líneas más arriba. Pega esto **justo encima de ese `<div>`**:

```vue
          <div class="citas-campo">
            <label for="especialidad-cita">Especialidad:</label>
            <!-- v-model guarda la eleccion; @change llama a la funcion al cambiar -->
            <select
              id="especialidad-cita"
              v-model="especialidadElegida"
              @change="cambiarEspecialidad"
            >
              <option value="">
                Todas las especialidades
              </option>
              <!-- Una opcion por especialidad. :key es su identificador unico -->
              <option
                v-for="e in especialidadesDisponibles"
                :key="e"
                :value="e"
              >
                {{ e }}
              </option>
            </select>
          </div>
```

## Paso 4 · Activar el desplegable de doctor

Busca el bloque del desplegable de doctor, el que empieza en `              id="doctor-cita"`:

```vue
            <select
              id="doctor-cita"
              :value="doctorStore.idDoctor || ''"
              disabled
            >
              <option
                v-if="!doctorStore.idDoctor"
                value=""
              >
                Selecciona un doctor en su pestaña
              </option>
              <option
                v-else
                :value="doctorStore.idDoctor"
              >
                {{ doctorStore.nomedoc }} {{ doctorStore.apeldoc }} — {{ doctorStore.espedoc }}
              </option>
            </select>
```

**Sustitúyelo entero** por:

```vue
            <!-- Ya no esta disabled: se puede elegir aqui.
                 :value lee el doctor que haya en Pinia, y @change lo guarda alli.
                 Se usa :value + @change en vez de v-model porque el valor no vive
                 en este componente, sino en el store. -->
            <select
              id="doctor-cita"
              :value="doctorStore.idDoctor || ''"
              @change="elegirDoctor($event.target.value)"
            >
              <option value="">
                {{ especialidadElegida ? "Elige un doctor" : "Elige especialidad y doctor" }}
              </option>
              <option
                v-for="d in doctoresDeLaEspecialidad"
                :key="d._id"
                :value="d._id"
              >
                {{ d.nomedoc }} {{ d.apeldoc }} — {{ d.espedoc }}
              </option>
            </select>
```

`$event.target.value` es el valor que acaba de elegirse en el `<select>`: es la forma de
pasárselo a una función desde el template.

## Variante · Con la lista de especialidades del servidor

El Paso 2 saca las especialidades de los doctores que hay. Si quieres **todas** las del
catálogo, aunque no tengan doctores, usa la API que ya existe:

```js
import { obtenerEspecialidades } from "../api/especialidades.js"

const especialidadesDisponibles = ref([])

obtenerEspecialidades()
  .then((lista) => (especialidadesDisponibles.value = lista.map((e) => e.nm)))
  .catch(() => (especialidadesDisponibles.value = []))
```

Entonces habrá especialidades que al elegirlas dejen el desplegable de doctores vacío. Si eso
te parece confuso, quédate con la versión del Paso 2: enseña solo lo que lleva a algo.

## Variante · Sin tocar Pinia, con una variable local

Si prefieres no cambiar cómo funciona el store, guarda el doctor en el propio formulario:

```js
// En lugar de doctorStore.idDoctor
const doctorElegido = ref("")
```

Y en `guardarCita()`, donde dice `doctorId: idDoctor`, pon `doctorId: doctorElegido.value`.
Es más simple, pero entonces la pestaña de citas y la de doctores dejan de estar
sincronizadas: la selección que se hace aquí no se ve en ningún otro sitio.

## Variante · Mostrar cuántos doctores hay

Debajo del `</select>` de la especialidad:

```vue
            <small>{{ doctoresDeLaEspecialidad.length }} doctores disponibles</small>
```

## Qué deberías ver

1. Un desplegable «Especialidad» justo antes de «Doctor».
2. Con «Todas las especialidades», el de doctor ofrece todos.
3. Al elegir una especialidad, el de doctor solo ofrece los de esa.
4. Si tenías elegido un doctor de otra especialidad, la selección se vacía. **Eso es lo que demuestra que la cascada está bien hecha.**
5. Al elegir un doctor aquí, sigue seleccionado si vas a la pestaña de doctores.
6. La cita se guarda con el doctor elegido.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El desplegable de doctor sigue sin dejar elegir | Falta quitar el `disabled` del Paso 4 |
| Las especialidades salen vacías | `doctores` se rellena en `cargarDatos()`: hasta que termine, la lista está vacía |
| El de doctor no se filtra | Sigue leyendo `doctores`: tiene que ser `doctoresDeLaEspecialidad` |
| Al cambiar la especialidad se queda un doctor que no es de ella | Falta el `@change="cambiarEspecialidad"` |
| Elijo un doctor y el formulario sigue sin dejar guardar | `elegirDoctor` tiene que recibir `$event.target.value` |
| `limpiarDoctor is not a function` | Está en `doctorStore.js`; comprueba que escribiste bien el nombre |
| Al editar una cita, la especialidad sale en «Todas» | Es normal: el filtro no se deduce de la cita. Se puede arreglar poniendo `especialidadElegida.value = doctorStore.espedoc` dentro de `editarCita` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Desplegables en cascada | El segundo depende de lo elegido en el primero |
| `new Set` | Quitar duplicados de una lista |
| `:value` + `@change` | Lo que se usa en vez de `v-model` cuando el dato vive fuera |
| `$event.target.value` | El valor recién elegido, desde el template |
| `some` | ¿Hay alguno que cumpla la condición? |
| Limpiar la selección dependiente | El paso que casi todo el mundo olvida |

## Guías relacionadas

- [Provincia y municipio en cascada](../columnas-y-filtros/filtro-municipio-en-cascada.md)
- [Elegir en una página y usarlo en otra](../pinia/pinia-seleccion.md)
- [Horas libres del doctor](horas-libres.md)
- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)

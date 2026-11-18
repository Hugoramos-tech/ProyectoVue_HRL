# Horas libres del doctor al pedir la cita

En el formulario de citas, la hora deja de ser un campo libre y pasa a ser un desplegable de huecos de media hora, de 09:00 a 19:30. Las horas en las que el doctor ya tiene cita ese día salen apagadas y marcadas «(ocupada)».

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Crea una cita para un doctor a las 10:00.

## La idea

Cuando hay un doctor seleccionado y una fecha puesta, se piden al servidor las citas de ese doctor. Las que son de esa fecha y no están canceladas son horas ocupadas. El desplegable genera todos los huecos y apaga los ocupados.

La cita que se está editando no cuenta como ocupada, para poder dejarle su propia hora.

> En esta pantalla el doctor **no se elige en el formulario**: viene ya seleccionado desde la pestaña de doctores, y está en `doctorStore.idDoctor`. Por eso el `watch` vigila el store, no un campo del formulario.

> Tu backend **no comprueba** los solapes, así que esto no es solo comodidad: es la única cosa que impide dos citas a la misma hora. Lo mismo que explica [cita duplicada antes de enviar](../pequenas-mejoras/cita-duplicada-antes-de-enviar.md).

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | Los huecos, las horas ocupadas y el desplegable |

## Paso 1 · Los imports

**No hay que tocar nada.** `ref`, `computed`, `watch` y `getCitas` ya están importados en este fichero.

## Paso 2 · La lógica

Busca la línea `// Al abrir la pantalla basta con que haya un paciente o un doctor seleccionado.` y pega esto **justo encima**:

```js
// Todos los huecos de media hora: 09:00, 09:30 ... 19:30. Son 22 en total.
// Array.from({ length: 22 }, (_, i) => ...) crea una lista de 22 elementos;
// i es la posicion, de 0 a 21. El _ es el primer parametro, que no se usa.
const HORAS = Array.from({ length: 22 }, (_, i) => {
  // Math.floor(i / 2) da 0,0,1,1,2,2... asi que la hora sube cada dos huecos.
  // padStart(2, "0") escribe 9 como "09".
  const hora = String(9 + Math.floor(i / 2)).padStart(2, "0")
  // i % 2 es 1 en las posiciones impares: esas son las "y media".
  return `${hora}:${i % 2 ? "30" : "00"}`
})

// Las citas del doctor seleccionado. Se piden aparte porque la lista de la tabla
// puede estar filtrada por paciente y no traeria todas las del doctor.
const citasDoctor = ref([])

async function cargarOcupadas() {
  const idDoctor = doctorStore.idDoctor
  // Sin doctor seleccionado no hay nada que pedir.
  citasDoctor.value = idDoctor
    ? await getCitas({ doctorId: idDoctor }).catch(() => [])
    : []
}

// Las horas de ESE dia en las que el doctor ya tiene cita.
// Las canceladas no ocupan hueco, y la cita que se esta editando tampoco,
// para que pueda conservar su propia hora.
const horasOcupadas = computed(() =>
  citasDoctor.value
    .filter(
      (item) =>
        item.fecha === cita.fecha &&
        item.estado !== "cancelada" &&
        String(item._id) !== String(cita._id)
    )
    .map((item) => item.hora)
)

// watch ejecuta una funcion cuando cambia algo. Aqui: al cambiar el doctor
// seleccionado o la fecha del formulario, se vuelven a pedir las ocupadas.
// () => valor es "una funcion que devuelve el valor a vigilar": hace falta
// porque cita.fecha es una propiedad de un objeto reactive, no un ref.
watch([() => doctorStore.idDoctor, () => cita.fecha], cargarOcupadas, { immediate: true })

// Y tambien cuando cambia la lista de la tabla, es decir despues de guardar o borrar.
watch(citas, cargarOcupadas)
```

`{ immediate: true }` hace que se ejecute una vez al abrir la pantalla, sin esperar a que algo cambie. Sin eso, al entrar con un doctor ya seleccionado no saldría ninguna hora ocupada hasta tocar la fecha.

## Paso 3 · El desplegable

En el `<template>`, busca la línea `id="hora-cita"` y mira el bloque que la contiene:

```vue
            <input
              id="hora-cita"
              v-model="cita.hora"
              type="time"
              required
            >
```

**Sustituye esas cinco líneas** por:

```vue
            <select
              id="hora-cita"
              v-model="cita.hora"
              required
            >
              <option
                value=""
                disabled
              >
                Selecciona hora
              </option>
              <!-- Una opcion por hueco. :disabled la apaga si esa hora esta ocupada -->
              <option
                v-for="h in HORAS"
                :key="h"
                :value="h"
                :disabled="horasOcupadas.includes(h)"
              >
                {{ h }}{{ horasOcupadas.includes(h) ? " (ocupada)" : "" }}
              </option>
            </select>
```

## Variante · Horario distinto

Para huecos de 15 minutos de 08:00 a 20:00 (48 huecos):

```js
const HORAS = Array.from({ length: 48 }, (_, i) => {
  const hora = String(8 + Math.floor(i / 4)).padStart(2, "0")
  const minuto = String((i % 4) * 15).padStart(2, "0")
  return `${hora}:${minuto}`
})
```

## Variante · Avisar de cuántos huecos quedan

En el Paso 2 añade:

```js
const huecosLibres = computed(() => HORAS.length - horasOcupadas.value.length)
```

Y en el `<template>`, debajo del `</select>`:

```vue
            <small>{{ huecosLibres }} huecos libres ese día</small>
```

## Qué deberías ver

1. En «Hora», un desplegable de 09:00 a 19:30 en vez del campo de reloj.
2. Con el doctor que tiene cita a las 10:00 y esa misma fecha: «10:00 (ocupada)» sale gris y no se puede elegir.
3. Con otra fecha, o con otro doctor, esa hora vuelve a estar libre.
4. Al editar esa cita, su propia hora sí se puede elegir.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Ninguna hora sale ocupada | Falta el `{ immediate: true }`, o la fecha no está puesta todavía |
| Ninguna hora sale ocupada y la fecha está puesta | El filtro es `doctorId`, no `doctor` |
| Al editar, la hora sale en blanco | Esa cita tiene una hora que no es múltiplo de media hora, por ejemplo 10:15: no está en `HORAS` |
| Al editar, su propia hora sale ocupada | Falta la comparación `String(item._id) !== String(cita._id)` |
| Las ocupadas no se actualizan al guardar | Falta el `watch(citas, cargarOcupadas)` |
| `HORAS is not defined` | El Paso 2 quedó dentro de otra función |
| El `watch` no salta al cambiar la fecha | Hay que vigilarla con `() => cita.fecha`, no con `cita.fecha` a secas |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `Array.from({ length: n }, fn)` | Generar una lista de n elementos calculados |
| `watch` con varias fuentes | Reaccionar a que cambie cualquiera de ellas |
| `{ immediate: true }` | Ejecutar el `watch` también al arrancar |
| `() => valor` en un `watch` | Vigilar una propiedad de un objeto `reactive` |
| `:disabled` en un `<option>` | Dejar la opción a la vista pero sin poder elegirla |

## Guías relacionadas

- [Cita duplicada antes de enviar](../pequenas-mejoras/cita-duplicada-antes-de-enviar.md)
- [Límite de citas por día](../backend/limite-por-dia.md)
- [Reprogramar una cita](../pequenas-mejoras/reprogramar-cita.md)

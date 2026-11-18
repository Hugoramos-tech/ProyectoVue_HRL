# Citas de hoy en la portada

La portada muestra las citas de hoy con su hora, el paciente y el doctor, ordenadas por hora. Si no hay ninguna, dice «Hoy no hay citas».

**Antes de empezar:** arranca el proyecto (`npm start`). Para verlo necesitas una cita con la fecha de hoy.

## La idea

En este proyecto las listas **no están en Pinia**: cada pantalla pide sus datos a la API y los guarda en un `ref([])` propio. La portada hará lo mismo: pide las tres listas al montarse y un `computed` se queda con las citas de hoy.

```
onMounted ──getCitas() + getPacientes() + getDoctores()──▶  tres ref([])
                                                               │
                                              computed citasDeHoy (filtra por fecha)
                                                               │
                                                        lista en la portada
```

Hacen falta las tres listas porque la cita solo guarda el **DNI** del paciente y el **_id** del doctor: los nombres hay que buscarlos.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Inicio.vue` | Todo: los imports, la carga, el `computed` y la lista |

## Paso 1 · La lógica

En `src/components/Inicio.vue`, busca la línea `const clinicVideoUrl = '/assets/videos/clinica.mp4'` y pega esto **justo debajo**:

```js
import { computed, onMounted, ref } from "vue"
import { getCitas } from "../api/citas.js"
import { getPacientes } from "../api/pacientes.js"
import { getDoctores } from "../api/doctores.js"

// Las tres listas que hacen falta para pintar una linea completa.
const citas = ref([])
const pacientes = ref([])
const doctores = ref([])

// Fecha de hoy como texto "aaaa-mm-dd", el mismo formato en que el backend
// guarda cita.fecha. getMonth() cuenta desde 0, por eso el +1; padStart pone el 0 delante.
const hoy = new Date()
const hoyTexto = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`

// Las citas de hoy, ordenadas por hora.
// [...] copia la lista antes de ordenar, porque sort() modifica el array que recibe.
const citasDeHoy = computed(() =>
  [...citas.value]
    .filter((c) => c.fecha === hoyTexto)
    .sort((a, b) => String(a.hora).localeCompare(String(b.hora)))
)

// La cita guarda el DNI del paciente: su nombre se busca en la lista de pacientes.
function nombrePacientePortada(dni) {
  const buscado = String(dni ?? "").trim().toUpperCase()
  const paciente = pacientes.value.find(
    (p) => String(p.dnipac ?? "").trim().toUpperCase() === buscado
  )
  return paciente ? `${paciente.nomepac} ${paciente.apelpac}` : "Paciente no disponible"
}

// doctorId puede llegar como id suelto o como objeto poblado por Mongoose:
// String(relacion?._id ?? relacion) deja las dos formas como texto.
function nombreDoctorPortada(doctorId) {
  const id = String(doctorId?._id ?? doctorId ?? "")
  const doctor = doctores.value.find((d) => String(d._id) === id)
  return doctor ? `${doctor.nomedoc} ${doctor.apeldoc}` : "Doctor no disponible"
}

// Promise.allSettled lanza las tres peticiones a la vez y NO se rompe si falla una:
// cada resultado trae su propio status. Asi la portada sigue cargando aunque
// MongoDB este caido (el video y el texto no dependen de la base de datos).
onMounted(async () => {
  const [resCitas, resPacientes, resDoctores] = await Promise.allSettled([
    getCitas(),
    getPacientes(),
    getDoctores(),
  ])

  if (resCitas.status === "fulfilled") citas.value = resCitas.value
  if (resPacientes.status === "fulfilled") pacientes.value = resPacientes.value
  if (resDoctores.status === "fulfilled") doctores.value = resDoctores.value
})
```

> `getCitas()` sin argumentos devuelve **todas** las citas. El backend ya las ordena por fecha y hora, pero aquí se vuelve a ordenar porque después de filtrar solo importa la hora.

> Las funciones se llaman `nombrePacientePortada` y `nombreDoctorPortada`, con ese «Portada» al final, para no confundirlas con las de `Citas.vue`, que se llaman `nombrePaciente` y `nombreDoctor` y hacen lo mismo en otra pantalla.

## Paso 2 · La lista en la portada

En el `<template>`, busca la línea `</main>` y pega esto **justo encima**:

```vue
    <section class="rounded-2xl border border-[#cfe0d6] bg-white p-5">
      <h2 class="mb-3 text-xl font-bold text-[#153f2e]">
        Citas de hoxe
      </h2>
      <!-- v-if / v-else: o el mensaje de "no hay" o la lista, nunca los dos -->
      <p
        v-if="citasDeHoy.length === 0"
        class="text-sm text-[#64737a]"
      >
        Hoy no hay citas
      </p>
      <ul
        v-else
        class="flex flex-col gap-2 text-sm"
      >
        <!-- Una linea por cita de hoy. :key usa el _id, que es unico. -->
        <li
          v-for="c in citasDeHoy"
          :key="c._id"
          class="flex flex-wrap gap-2 border-b border-[#e8f2ec] pb-2 last:border-0"
        >
          <strong class="text-[#14543a]">{{ c.hora }}</strong>
          <span>{{ nombrePacientePortada(c.pacienteDNI) }}</span>
          <span class="text-[#64737a]">con {{ nombreDoctorPortada(c.doctorId) }}</span>
        </li>
      </ul>
    </section>
```

> Si ya hiciste la receta de [elegir en una página y usarlo en otra](pinia-seleccion.md), ahí pegaste otro bloque justo encima de `</main>`. No importa: pon este debajo del otro, los dos caben.

## Variante · Solo las que quedan por venir

Si quieres que desaparezcan las que ya se atendieron, cambia el `filter` del `computed` por:

```js
    .filter((c) => c.fecha === hoyTexto && c.estado !== "realizada" && c.estado !== "cancelada")
```

## Variante · Las próximas, no solo las de hoy

Cambiando el `computed` tienes «las cinco próximas citas»:

```js
const citasDeHoy = computed(() =>
  [...citas.value]
    // >= en lugar de ===: hoy y todo lo que venga despues
    .filter((c) => c.fecha >= hoyTexto)
    .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`))
    // slice(0, 5) corta las cinco primeras
    .slice(0, 5)
)
```

Las fechas son textos `aaaa-mm-dd`, así que `>=` y `localeCompare` las comparan en orden cronológico sin convertirlas a `Date`.

## Qué deberías ver

1. En la portada, debajo de la imagen grande, una sección «Citas de hoxe».
2. Sin citas hoy: «Hoy no hay citas».
3. Crea una cita con la fecha de hoy y vuelve a la portada: aparece con su hora y los dos nombres.
4. Si hay varias, salen ordenadas por hora.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Siempre «Hoy no hay citas» | `hoyTexto` no coincide con el formato de `c.fecha`: compáralos con un `console.log` |
| Sale «Paciente no disponible» | La lista de pacientes no cargó, o el DNI de la cita ya no existe en pacientes |
| Sale «Doctor no disponible» | Falta normalizar `doctorId`: puede llegar como objeto, de ahí el `?._id ??` |
| `citasDeHoy is not defined` | El Paso 1 quedó fuera del `<script setup>` |
| Error 503 en la consola | MongoDB no está arrancado. La portada se queda sin citas, pero no se rompe |
| Las horas salen desordenadas | Falta el `.sort(...)` |
| `nombrePaciente is not defined` | En esta pantalla las funciones llevan «Portada» al final |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `computed` | Un dato que se calcula solo y se rehace cuando cambia lo que lee |
| `onMounted` | Código que se ejecuta al aparecer el componente en pantalla |
| `Promise.allSettled` | Lanzar varias peticiones a la vez sin que una que falla tumbe al resto |
| Fechas como texto | `aaaa-mm-dd` se compara con `<`, `>` y `===` sin convertir a `Date` |

## Guías relacionadas

- [Elegir en una página y usarlo en otra](pinia-seleccion.md)
- [Contador en el menú](contador-en-el-menu.md)
- [La próxima cita del paciente](../mejoras-de-la-clinica/proxima-cita-del-paciente.md)

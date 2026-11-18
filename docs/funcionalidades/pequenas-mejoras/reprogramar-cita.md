# Reprogramar una cita

Un botón «Reprogramar» en cada cita pendiente o confirmada. Abre una ventana con dos campos, fecha y hora, y cambia solo esos dos datos.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

SweetAlert2 permite meter HTML dentro de la ventana con la opción `html`, y recoger lo que el usuario escribió con `preConfirm`. Después se guarda con `updateCita(id, { fecha, hora })`, que es un `PUT` parcial: el backend solo toca los campos que recibe.

> **Importante:** tu backend **no comprueba** si el doctor ya tiene una cita a esa hora. `validarRelaciones` solo mira que el paciente y el doctor existan. Así que reprogramar a una hora ocupada **funcionará sin avisar**. Si quieres que lo impida, hay dos caminos: avisar desde la web ([cita duplicada antes de enviar](cita-duplicada-antes-de-enviar.md)) o impedirlo en la base de datos ([índice único](../backend/indice-unico.md)). Más abajo está la comprobación integrada en esta misma receta.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | El import de SweetAlert2, la función y el botón |

## Paso 1 · Importar SweetAlert2

Esta pantalla solo usa las alertas ya preparadas de `utils/alertas.js`, así que no tiene SweetAlert2 directamente. Para una ventana con campos propios hace falta.

Busca la línea `import { generarPDF } from "../utils/pdf.js"` y pega esto **justo debajo**:

```js
// SweetAlert2 directamente: se necesita una ventana con campos propios,
// que las funciones de utils/alertas.js no cubren.
import Swal from "sweetalert2"
```

## Paso 2 · La función

Busca la línea `async function guardarCita() {` y pega esto **justo encima**:

```js
// Pide una fecha y una hora nuevas y las guarda.
async function reprogramarCita(item) {
  const { isConfirmed, value } = await Swal.fire({
    title: "Reprogramar la cita",
    // html mete dos campos dentro de la ventana, ya rellenos con los datos actuales.
    // swal2-input es la clase de SweetAlert2 para que se vean como sus campos.
    html: `
      <input id="nueva-fecha" type="date" class="swal2-input" value="${item.fecha}">
      <input id="nueva-hora" type="time" class="swal2-input" value="${item.hora}">
    `,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Volver",
    // preConfirm se ejecuta al pulsar Guardar: lee los campos, valida y devuelve
    // lo que llegara como `value`. Si devuelve false, la ventana no se cierra.
    preConfirm: () => {
      const fecha = document.getElementById("nueva-fecha").value
      const hora = document.getElementById("nueva-hora").value
      if (!fecha || !hora) {
        Swal.showValidationMessage("Elige una fecha y una hora")
        return false
      }
      return { fecha, hora }
    },
  })

  // isConfirmed es false si pulso Volver o cerro con Escape.
  if (!isConfirmed) {
    return
  }

  try {
    // PUT parcial: solo viajan fecha y hora. El resto de la cita queda igual.
    await updateCita(item._id, value)
    await alertaExito("Cita reprogramada.")
    await cargarDatos()
  } catch (error) {
    alertaError(mensajeError(error, "No se pudo reprogramar la cita."))
  }
}
```

> `updateCita`, `cargarDatos`, `alertaExito`, `alertaError` y `mensajeError` ya existen en este fichero.

## Paso 3 · El botón

En el `<template>`, busca la línea `<td class="citas-celda-acciones">` y pega esto **justo debajo**:

```vue
                <!-- Solo tiene sentido reprogramar una cita que sigue viva -->
                <button
                  v-if="item.estado === 'pendente' || item.estado === 'confirmada'"
                  class="citas-boton-accion"
                  type="button"
                  title="Reprogramar"
                  aria-label="Reprogramar"
                  @click="reprogramarCita(item)"
                >
                  🕒
                </button>
```

## Variante · Comprobar que la hora está libre

Para que no se pueda reprogramar encima de otra cita, dentro de `reprogramarCita`, justo después del `if (!isConfirmed) { return }`, pega:

```js
  // El backend no comprueba solapes: hay que hacerlo aqui.
  // getCitas({ doctorId }) devuelve las citas de ese doctor.
  const idDoctor = String(item.doctorId?._id ?? item.doctorId ?? "")
  const delDoctor = await getCitas({ doctorId: idDoctor }).catch(() => [])
  const choca = delDoctor.find(
    (otra) =>
      otra.fecha === value.fecha &&
      otra.hora === value.hora &&
      otra.estado !== "cancelada" &&
      // La propia cita no cuenta como choque consigo misma
      String(otra._id) !== String(item._id)
  )

  if (choca) {
    alertaError(
      `El doctor ya tiene una cita el ${value.fecha} a las ${value.hora}.`,
      "Hora ocupada"
    )
    return
  }
```

`getCitas` ya está importado en este fichero.

## Variante · No permitir fechas pasadas

En el `html` de la ventana, añade un `min` al campo de fecha:

```js
      <input id="nueva-fecha" type="date" class="swal2-input" min="${new Date().toISOString().slice(0, 10)}" value="${item.fecha}">
```

`toISOString().slice(0, 10)` da la fecha de hoy como `aaaa-mm-dd`. Ojo: `toISOString` usa la hora UTC, así que de madrugada puede dar el día anterior. Para ser exacto, usa el mismo `hoyTexto` que montan otras recetas con `getFullYear`, `getMonth` y `getDate`.

## Qué deberías ver

1. Un botón 🕒 en las citas pendientes y confirmadas, y no en las canceladas ni realizadas.
2. Al pulsarlo, una ventana con la fecha y la hora actuales de esa cita ya puestas.
3. Al dejar un campo vacío y aceptar, sale «Elige una fecha y una hora» en rojo y la ventana no se cierra.
4. Al guardar, la cita cambia en la tabla y sale «Cita reprogramada.».
5. Con la variante de comprobación: a una hora ocupada sale la alerta y no se guarda nada.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `Swal is not defined` | Falta el Paso 1 |
| Los campos salen vacíos | Falta el `value="${item.fecha}"` dentro del HTML |
| Al aceptar no pasa nada | `preConfirm` no devuelve el objeto, o los `id` no coinciden con los `getElementById` |
| `Cannot read properties of null` | Un `id` del HTML está mal escrito: `getElementById` devolvió `null` |
| El botón sale en todas las citas | Falta el `v-if` del estado |
| Se guarda encima de otra cita | Es lo esperado sin la variante de comprobación: el backend no lo impide |
| La tabla no cambia | Falta el `await cargarDatos()` del final |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `Swal.fire` con `html` | Una ventana con varios campos propios |
| `preConfirm` | Leer y validar lo escrito antes de cerrar |
| `showValidationMessage` | Mensaje de error dentro de la ventana |
| `PUT` parcial | Enviar solo los campos que cambian |
| `?._id ?? ` | Normalizar una referencia que puede venir como objeto |

## Guías relacionadas

- [Cita duplicada antes de enviar](cita-duplicada-antes-de-enviar.md)
- [Cancelar una cita con motivo](../mejoras-de-la-clinica/cancelar-con-motivo.md)
- [Alertas extra](../alertas-y-pdf/alertas-extra.md)

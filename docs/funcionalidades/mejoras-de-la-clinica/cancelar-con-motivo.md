# Cancelar una cita pidiendo el motivo

Un botón «Cancelar» en cada fila de la tabla de citas. Al pulsarlo se abre una ventana que pide el motivo (obligatorio), la cita pasa a «cancelada» y el motivo se **añade** a sus observaciones sin borrar lo que ya hubiera.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

SweetAlert2 puede pedir un texto: con `input: "text"` la ventana trae un campo, y `inputValidator` impide aceptar si está vacío. Después se guarda la cita con `updateCita` y solo los dos campos que cambian, `estado` y `observacions`. El backend hace un `findByIdAndUpdate`, así que lo que no se manda se queda como estaba.

> Hay otra receta parecida, [alertas extra](../alertas-y-pdf/alertas-extra.md), que mete la ventana en una función reutilizable (`pedirTexto`) dentro de `utils/alertas.js`. Esta usa SweetAlert2 directamente en la pantalla y además conserva las observaciones anteriores. Haz una o la otra, no las dos.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | El import, la función y el botón |

## Paso 1 · Importar SweetAlert2

Esta pantalla solo usa las alertas ya preparadas de `utils/alertas.js`. Para una ventana con un campo propio hace falta la librería directamente.

Busca la línea `import { generarPDF } from "../utils/pdf.js"` y pega esto **justo debajo**:

```js
// SweetAlert2 directamente: aqui hace falta una ventana con un campo de texto,
// y las cuatro funciones de utils/alertas.js no lo cubren.
import Swal from "sweetalert2"
```

## Paso 2 · La función

Busca la línea `async function guardarCita() {` y pega esto **justo encima**:

```js
// Pide el motivo y, si se confirma, cancela la cita y lo apunta en las observaciones.
async function cancelarCita(item) {
  // Swal.fire devuelve una promesa; await espera a que el usuario pulse algo.
  // isConfirmed = true si pulso el boton de confirmar; value = lo que escribio.
  const { isConfirmed, value } = await Swal.fire({
    title: "Cancelar la cita",
    input: "text",
    inputLabel: "Motivo de la cancelación",
    // Se ejecuta al aceptar: si devuelve un texto, lo ensena como error y NO deja
    // cerrar la ventana. Devolviendo undefined, deja continuar.
    inputValidator: (texto) => (!String(texto ?? "").trim() ? "Escribe un motivo" : undefined),
    showCancelButton: true,
    confirmButtonText: "Cancelar la cita",
    cancelButtonText: "Volver",
  })

  // false si pulso Volver o cerro con Escape: no se hace nada.
  if (!isConfirmed) {
    return
  }

  try {
    // Se anade el motivo a lo que ya hubiera. ?? "" evita escribir "undefined"
    // cuando la cita no tenia observaciones. El trim final quita el espacio sobrante.
    const observacions = `${item.observacions ?? ""} Cancelada: ${value.trim()}`.trim()

    // PUT parcial: solo viajan estos dos campos; fecha, hora y motivo quedan igual.
    await updateCita(item._id, { estado: "cancelada", observacions })
    await alertaExito("Cita cancelada.")
    await cargarDatos()
  } catch (error) {
    alertaError(mensajeError(error, "No se pudo cancelar la cita."))
  }
}
```

> `updateCita`, `cargarDatos`, `alertaExito`, `alertaError` y `mensajeError` ya existen en este fichero.

## Paso 3 · El botón

En el `<template>`, busca la línea `<td class="citas-celda-acciones">` y pega esto **justo debajo**:

```vue
                <!-- v-if: el boton solo existe mientras la cita no este ya cancelada -->
                <button
                  v-if="item.estado !== 'cancelada'"
                  class="citas-boton-accion"
                  type="button"
                  title="Cancelar cita"
                  aria-label="Cancelar cita"
                  @click="cancelarCita(item)"
                >
                  🚫
                </button>
```

## Variante · Motivos predefinidos en un desplegable

En vez de texto libre, una lista cerrada. Cambia `input: "text"` e `inputLabel` por:

```js
    input: "select",
    // inputOptions es un objeto {valor: texto}: la clave es lo que llega en value.
    inputOptions: {
      paciente: "Lo pidió el paciente",
      doctor: "No disponibilidad del doctor",
      duplicada: "Cita duplicada",
      otro: "Otro motivo",
    },
    inputPlaceholder: "Elige un motivo",
```

El `inputValidator` se queda igual: también vale para el `select`, porque si no se elige nada llega cadena vacía.

## Variante · Guardar la fecha de la cancelación

```js
    const hoy = new Date().toLocaleDateString("es-ES")
    const observacions = `${item.observacions ?? ""} Cancelada el ${hoy}: ${value.trim()}`.trim()
```

## Qué deberías ver

1. Un botón 🚫 en cada fila, y no en las que ya están canceladas.
2. Al pulsarlo, una ventana con un campo para el motivo.
3. Con el campo vacío, no deja aceptar y avisa «Escribe un motivo».
4. Al aceptar, la cita pasa a «Cancelada» y el motivo aparece en la columna Observaciones.
5. Si la cita ya tenía observaciones, el motivo se añade detrás, no las sustituye.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `Swal is not defined` | Falta el Paso 1 |
| La ventana no trae campo | `input: "text"` mal escrito |
| Deja aceptar con el campo vacío | El `inputValidator` tiene que devolver un **texto** para bloquear |
| En observaciones sale «undefined Cancelada: …» | Falta el `?? ""` |
| Se borran las observaciones anteriores | Mandaste solo `value.trim()` en vez de concatenar |
| El botón sale en las canceladas | Falta el `v-if` |
| `cancelarCita is not defined` | El Paso 2 quedó dentro de otra función |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `Swal.fire` con `input` | Una ventana que pide un dato |
| `inputValidator` | Impedir aceptar con el campo vacío |
| `PUT` parcial | Enviar solo los campos que cambian |
| Plantillas con acentos graves | Meter datos dentro de un texto con `${...}` |

## Guías relacionadas

- [Alertas extra](../alertas-y-pdf/alertas-extra.md)
- [Cambiar el estado desde la tabla](../listas/estado-desde-la-tabla.md)
- [Reprogramar una cita](../pequenas-mejoras/reprogramar-cita.md)

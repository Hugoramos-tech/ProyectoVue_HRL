# Alertas extra: temporizador, pedir un texto y toast

Tres alertas nuevas con SweetAlert2, y un ejemplo de uso completo: un botón «Cancelar» en cada cita que pide el motivo con una ventana, guarda la cita como cancelada con ese motivo en observaciones y avisa con un toast.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

Todas las alertas de la aplicación viven en `src/utils/alertas.js` y devuelven una **promesa**: con `await` esperas a que el usuario cierre la ventana y, en las que preguntan algo, sabes qué respondió. Las nuevas se añaden ahí, no dentro de las pantallas.

> En este fichero la librería se importa como **`Swal`**: `import Swal from 'sweetalert2'`. Todas las funciones hacen `Swal.fire({...})`. No hay ningún `mixin` ni ninguna variable llamada `Alerta`, así que si escribes `Alerta.fire` dará `Alerta is not defined`.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/utils/alertas.js` | Las tres alertas nuevas |
| `src/components/Citas.vue` | Un botón que las usa |

## Paso 1 · Las tres alertas

Abre `src/utils/alertas.js` y pega esto **al final del fichero**:

```js
// Aviso pequeno en una esquina que se cierra solo a los 2 segundos.
// Se usa para confirmaciones que no merecen parar al usuario con un dialogo.
export const toast = (mensaje, icono = 'success') => {
    return Swal.fire({
        toast: true,                  // formato "toast": pequeno y en una esquina
        position: 'top-end',          // arriba a la derecha
        icon: icono,                  // 'success', 'error', 'info'...
        title: mensaje,
        showConfirmButton: false,     // sin boton: se cierra solo
        timer: 2000,                  // milisegundos
        timerProgressBar: true        // barra que va menguando
    })
}

// Alerta que se cierra sola a los ms milisegundos, sin boton.
export const alertaTemporal = (mensaje, ms = 2000) => {
    return Swal.fire({
        icon: 'info',
        text: mensaje,
        timer: ms,
        timerProgressBar: true,
        showConfirmButton: false
    })
}

// Pide un texto. Devuelve lo escrito, o undefined si el usuario cancela.
// async/await: la funcion espera a que el usuario conteste antes de devolver nada.
export const pedirTexto = async (titulo) => {
    // Se desestructura value: es lo que escribio el usuario.
    const { value } = await Swal.fire({
        title: titulo,
        input: 'text',               // la ventana trae un campo de texto
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        // Si devuelve un texto, lo ensena como error y NO deja aceptar.
        // Con undefined, deja continuar.
        inputValidator: (v) => (!v ? 'Escribe algo' : undefined)
    })
    return value
}
```

Qué hace: `inputValidator` impide aceptar la ventana con el campo vacío. Si el usuario pulsa Cancelar o cierra con Escape, `value` llega como `undefined`.

## Paso 2 · Importarlas en la pantalla de citas

En `src/components/Citas.vue`, busca la línea `  alertaExito` (la del bloque de imports, la última de la lista, sin coma al final) y **sustitúyela** por:

```js
  alertaExito,
  toast,
  pedirTexto
```

El bloque queda así:

```js
import {
  alertaConfirmacion,
  alertaError,
  alertaExito,
  toast,
  pedirTexto
} from "../utils/alertas.js"
```

> Si ya hiciste la receta de [cambiar el estado desde la tabla](../listas/estado-desde-la-tabla.md), ese bloque ya terminará en `toast` y la línea de `alertaExito` ya llevará coma. En ese caso no sustituyas nada: solo añade una coma detrás de toast y `pedirTexto` en la línea siguiente, hasta que el bloque quede como el de abajo.

## Paso 3 · La función

Busca la línea `async function guardarCita() {` y pega esto **justo encima**:

```js
// Pide el motivo con una ventana y guarda la cita como cancelada con ese texto.
async function cancelarConMotivo(item) {
  const motivo = await pedirTexto("Motivo de la cancelación")
  // undefined = el usuario cerro la ventana o pulso Cancelar: no se hace nada.
  if (!motivo) {
    return
  }

  try {
    // PUT parcial: el backend solo toca los campos que recibe, asi que no hay
    // que reenviar fecha, hora ni paciente.
    await updateCita(item._id, { estado: "cancelada", observacions: motivo })
    toast("Cita cancelada")
    await cargarDatos()
  } catch (error) {
    alertaError(mensajeError(error, "No se pudo cancelar la cita."))
  }
}
```

> `updateCita`, `cargarDatos` y `mensajeError` ya existen en este fichero: no hay que importar nada más.

## Paso 4 · El botón

En el `<template>`, busca la línea `<td class="citas-celda-acciones">` y pega esto **justo debajo**:

```vue
                <!-- :disabled apaga el boton en las citas ya canceladas -->
                <button
                  class="citas-boton-accion"
                  type="button"
                  title="Cancelar con motivo"
                  aria-label="Cancelar con motivo"
                  :disabled="item.estado === 'cancelada'"
                  @click="cancelarConMotivo(item)"
                >
                  🚫
                </button>
```

El botón queda a la izquierda de ✏️ y 🗑️, dentro de la misma celda de acciones.

## Probar `alertaTemporal`

No la usa ninguna pantalla todavía. Para verla, añádela en cualquier función, por ejemplo como primera línea de `exportarCitas()`:

```js
  alertaTemporal("Generando el informe...")
```

Fíjate en que **no** lleva `await`: así el PDF se genera mientras la ventana está abierta, y la ventana se cierra sola.

## Qué deberías ver

1. Un icono 🚫 en cada fila de citas, apagado en las que ya están canceladas.
2. Al pulsarlo, una ventana pide el motivo y no deja aceptar vacío: sale «Escribe algo».
3. Al aceptar, la cita pasa a «Cancelada», con ese texto en la columna Observaciones, y sale un toast arriba a la derecha que se va solo.
4. Si cierras la ventana sin escribir, no pasa nada.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `pedirTexto is not a function` | Falta el Paso 2, o en el Paso 1 se olvidó el `export` |
| `Alerta is not defined` | En este fichero la librería es `Swal`, no `Alerta` |
| La ventana no trae campo de texto | `input: 'text'` mal escrito |
| El toast no sale | Falta `toast` en el import del Paso 2 |
| Se cancela aunque cierres la ventana | Falta el `if (!motivo) { return }` |
| `Unexpected token` en el import | Quedó una coma de más o de menos en el bloque de imports |
| El motivo no se ve en la tabla | La columna es `observacions`, sin la «e»: así se llama en el modelo |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `Swal.fire` | Abrir una alerta de SweetAlert2 |
| `input` en una alerta | Pedir un dato al usuario dentro de la ventana |
| `inputValidator` | Impedir aceptar con el campo vacío |
| Toast con `timer` | Aviso pequeño que se cierra solo |
| `PUT` parcial | Enviar solo los campos que cambian |

## Guías relacionadas

- [Cancelar una cita con motivo](../mejoras-de-la-clinica/cancelar-con-motivo.md)
- [Cambiar el estado desde la tabla](../listas/estado-desde-la-tabla.md)
- [Aviso al borrar un paciente con citas](aviso-al-borrar.md)

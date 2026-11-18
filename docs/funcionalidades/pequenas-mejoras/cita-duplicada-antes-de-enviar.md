# Avisar de una cita duplicada antes de enviar el formulario

Antes de guardar una cita, la web mira si el doctor ya tiene otra a esa fecha y hora. Si la tiene, sale una alerta y no se envía nada.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Crea antes una cita para algún doctor, para tener con qué chocar.

## La idea

Se piden al servidor las citas de ese doctor con `getCitas({ doctorId })` y se busca una con la misma fecha y hora que no esté cancelada. Si se está editando, la propia cita se deja fuera, que si no se avisaría a sí misma.

**Ojo con una cosa:** tu backend **no** comprueba los solapes. `validarRelaciones` solo mira que el paciente y el doctor existan, no si la hora está libre. Así que esta comprobación no es un atajo para ahorrarse el viaje al servidor: **es la única que hay**. Si quieres que el servidor también lo impida, está la receta de [índice único](../backend/indice-unico.md).

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | La comprobación dentro de `guardarCita` |

## Paso 1 · Los imports

**No hay que tocar nada.** `getCitas` ya está importado arriba del fichero:

```js
import { deleteCita, getCitas, saveCita, updateCita } from "../api/citas.js"
```

## Paso 2 · La comprobación

Busca la línea `    const estabaEditando = editando.value` y pega esto **justo encima**:

```js
    // Antes de enviar: el doctor ya tiene otra cita a esa fecha y hora?
    // Se piden al servidor las citas de ese doctor. await espera la respuesta.
    const delDoctor = await getCitas({ doctorId: datosCita.doctorId })

    // find devuelve la primera cita que coincide, o undefined si no hay ninguna.
    // Se ignoran las canceladas, porque su hueco vuelve a estar libre, y la propia
    // cita que se esta editando, que si no se avisaria a si misma.
    const choca = delDoctor.find(
      (item) =>
        item.fecha === datosCita.fecha &&
        item.hora === datosCita.hora &&
        item.estado !== "cancelada" &&
        String(item._id) !== String(cita._id)
    )

    if (choca) {
      alertaError(
        `El doctor ya tiene una cita a las ${datosCita.hora} ese día.`,
        "Cita duplicada"
      )
      return  // sale de la funcion SIN enviar nada al servidor
    }
```

### Un detalle que se olvida siempre

Ese `return` deja `guardando.value` en `true`, porque el `finally` sí se ejecuta... **pero el `return` está dentro del `try`**, así que el `finally` que hay al final de `guardarCita` corre igual y lo vuelve a poner en `false`. Por eso el botón no se queda bloqueado. Si lo pegases **antes** del `try`, sí se quedaría: ahí habría que escribir `guardando.value = false` a mano antes del `return`.

Compruébalo: después del aviso, el botón «Guardar» tiene que seguir pulsable.

## Variante · Comprobar también el paciente

Un paciente tampoco puede estar en dos sitios a la vez. Añade esto justo debajo del bloque anterior:

```js
    // Lo mismo, pero mirando las citas del paciente.
    const delPaciente = await getCitas({ pacienteDNI: datosCita.pacienteDNI })
    const chocaPaciente = delPaciente.find(
      (item) =>
        item.fecha === datosCita.fecha &&
        item.hora === datosCita.hora &&
        item.estado !== "cancelada" &&
        String(item._id) !== String(cita._id)
    )

    if (chocaPaciente) {
      alertaError(
        `El paciente ya tiene otra cita a las ${datosCita.hora} ese día.`,
        "Cita duplicada"
      )
      return
    }
```

## Variante · Margen de media hora

Si las consultas duran 30 minutos, dos citas a las 10:00 y a las 10:15 también chocan. Comparar textos `hh:mm` no basta: hay que pasarlos a minutos.

```js
    // "10:15" -> 615 minutos. split(":") parte el texto y map(Number) lo pasa a numero.
    function enMinutos(hhmm) {
      const [h, m] = String(hhmm).split(":").map(Number)
      return h * 60 + m
    }

    const minutosNueva = enMinutos(datosCita.hora)
    const choca = delDoctor.find(
      (item) =>
        item.fecha === datosCita.fecha &&
        item.estado !== "cancelada" &&
        String(item._id) !== String(cita._id) &&
        // Math.abs = valor absoluto: da igual cual va antes
        Math.abs(enMinutos(item.hora) - minutosNueva) < 30
    )
```

## Qué deberías ver

1. Con un doctor y una hora ya ocupados, al pulsar «Guardar» sale la alerta «El doctor ya tiene una cita a las 10:00 ese día.» y no se guarda nada.
2. El botón «Guardar» sigue funcionando después del aviso.
3. Con otra hora, se guarda con normalidad.
4. Editar una cita sin cambiarle la hora **no** da la alerta.
5. Si la cita que choca está cancelada, tampoco avisa.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| La alerta sale al editar la propia cita sin tocar la hora | Falta la comparación `String(item._id) !== String(cita._id)` |
| No hace nada nunca | El filtro es `doctorId`, no `doctor`: es el nombre que espera el backend |
| Avisa de citas canceladas | Falta `item.estado !== "cancelada"` |
| El botón se queda bloqueado tras el aviso | Pegaste el bloque **antes** del `try`: muévelo dentro, o pon `guardando.value = false` antes del `return` |
| `datosCita is not defined` | El bloque quedó encima de donde se construye `datosCita` |
| Avisa siempre, incluso con horas distintas | Estás comparando `datosCita.fecha` con `item.hora` o similar: revisa los campos |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `async` / `await` | Esperar la respuesta del servidor antes de seguir |
| `find` | La primera coincidencia, o `undefined` |
| `return` dentro de un `try` | Sale de la función, pero el `finally` se ejecuta igual |
| Validar en el cliente | Avisar antes de enviar; no sustituye a validar en el servidor |

## Guías relacionadas

- [Horas libres](../mejoras-de-la-clinica/horas-libres.md)
- [Índice único en el backend](../backend/indice-unico.md)
- [Reprogramar una cita](reprogramar-cita.md)

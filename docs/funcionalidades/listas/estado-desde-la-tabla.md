# Cambiar el estado desde la tabla

La columna «Estado» de citas pasa a ser un desplegable. Al cambiarlo se guarda en el momento y sale un aviso pequeño en la esquina (un *toast*).

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

Hoy la celda solo pinta texto: `{{ etiquetaEstado(item.estado) }}`. Se cambia por un `<select>` que, al elegir otra opción, llama a una función que manda el cambio al servidor con `updateCita` y recarga la lista.

El `PUT` del backend solo toca los campos que recibe, así que **basta con enviar el estado**: no hay que reenviar fecha, hora ni motivo.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/utils/alertas.js` | Una alerta nueva, el toast |
| `src/components/Citas.vue` | El desplegable en la tabla y la función que guarda |

## Paso 1 · El toast

Abre `src/utils/alertas.js` y pega esto **al final del fichero**:

```js
// Aviso pequeno en una esquina que se cierra solo a los 2 segundos.
// Se usa para confirmaciones que no merecen parar al usuario con un dialogo.
export const toast = (mensaje, icono = 'success') => {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon: icono,
        title: mensaje,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    })
}
```

> Ojo: en este fichero la librería se importa como `Swal`, no como `Alerta`. Si pones `Alerta.fire` dará `Alerta is not defined`.

## Paso 2 · Importarlo en la pantalla

En `src/components/Citas.vue`, busca la línea `  alertaExito` (la del bloque de imports, al final de la lista, sin coma) y **sustitúyela** por:

```js
  alertaExito,
  toast
```

El bloque queda así:

```js
import {
  alertaConfirmacion,
  alertaError,
  alertaExito,
  toast
} from "../utils/alertas.js"
```

## Paso 3 · La función que guarda

Busca la línea `async function guardarCita() {` y pega esto **justo encima**:

```js
// Cambia solo el estado de una cita. El PUT del backend mezcla lo que le llega con
// lo que la cita ya tenia, asi que no hace falta enviar los demas campos.
async function cambiarEstado(item, estado) {
  try {
    await updateCita(item._id, { estado })
    toast("Estado actualizado")
    await cargarDatos()
  } catch (error) {
    alertaError(mensajeError(error, "No se pudo cambiar el estado."))
    // Si falla, se recarga la lista para que el desplegable vuelva al valor real
    await cargarDatos()
  }
}
```

> `updateCita`, `cargarDatos` y `mensajeError` ya existen en este fichero: no hay que importar nada más.

## Paso 4 · El desplegable en la columna

Busca la línea `<td>{{ etiquetaEstado(item.estado) }}</td>` y **sustitúyela** por:

```vue
              <td>
                <!-- :value (una sola direccion) muestra el estado actual.
                     @change avisa al elegir otro; $event.target.value es la opcion elegida.
                     Aqui NO se usa v-model: el valor real lo manda el servidor, no el select. -->
                <select
                  :value="item.estado"
                  :disabled="cargando"
                  @change="cambiarEstado(item, $event.target.value)"
                >
                  <option value="pendente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="realizada">Realizada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </td>
```

Qué hace: `:value` en vez de `v-model` a propósito. Con `v-model` el desplegable se cambiaría solo aunque el guardado fallara; con `:value` la fuente de la verdad sigue siendo la lista que viene del servidor.

## Variante · Pedir confirmación al cancelar

Cancelar una cita no es lo mismo que confirmarla. Si quieres un aviso solo en ese caso, dentro de `cambiarEstado` pega esto **como primera línea** de la función:

```js
  if (estado === "cancelada") {
    const confirmacion = await alertaConfirmacion(
      `¿Cancelar la cita del ${item.fecha} a las ${item.hora}?`,
      "Cancelar cita"
    )
    // Sin confirmar se recarga, para que el desplegable vuelva a su valor anterior
    if (!confirmacion.isConfirmed) {
      await cargarDatos()
      return
    }
  }
```

## Qué deberías ver

1. En la columna Estado de cada fila hay un desplegable en vez de texto.
2. Al cambiarlo sale un aviso verde arriba a la derecha que desaparece solo.
3. Recarga la página con F5: el cambio sigue ahí.
4. Mientras carga, el desplegable está desactivado.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `toast is not a function` | Falta el Paso 2, o el Paso 1 se pegó dentro de otra función |
| `Alerta is not defined` | En `alertas.js` la librería es `Swal`, no `Alerta` |
| La celda sigue mostrando texto | Falta el Paso 4 |
| Al recargar vuelve el valor antiguo | El `PUT` falló: mira la pestaña Red de F12 y el mensaje de la alerta |
| El desplegable se queda en la opción nueva aunque falle | Usaste `v-model` en vez de `:value` |
| `cambiarEstado is not defined` | El Paso 3 quedó dentro de otra función |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `:value` frente a `v-model` | `:value` solo pinta; `v-model` también escribe en el dato |
| `$event.target.value` | El valor del control que acaba de disparar el evento |
| Toast con `timer` | Aviso pequeño que se cierra solo |
| `PUT` parcial | Enviar solo los campos que cambian |

## Guías relacionadas

- [Color según el estado](../estilos/color-por-estado.md)
- [Cancelar una cita con motivo](../mejoras-de-la-clinica/cancelar-con-motivo.md)
- [Alertas extra](../alertas-y-pdf/alertas-extra.md)

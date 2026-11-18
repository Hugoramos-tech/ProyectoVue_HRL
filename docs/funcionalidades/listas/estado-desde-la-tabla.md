# Cambiar el estado desde la tabla

La columna «Estado» de citas pasa a ser un desplegable. Al cambiarlo se guarda en el momento y sale un aviso pequeño (toast).

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/utils/alertas.js` | Una alerta nueva, el toast |
| `src/components/Citas.vue` | El desplegable en la tabla y la función que guarda |

## Paso 1 · El toast

Abre `src/utils/alertas.js` y pega esto **al final del fichero**:

```js
// Aviso pequeño en una esquina que se cierra solo a los 2 segundos
export const toast = (mensaje, icono = 'success') => {
    return Alerta.fire({
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

## Paso 2 · Importarlo

En `src/components/Citas.vue`, busca la línea `import { alertaExito, alertaError, alertaConfirmacion } from "../utils/alertas.js";` y **sustitúyela** por:

```js
import { alertaExito, alertaError, alertaConfirmacion, toast } from "../utils/alertas.js";
```

## Paso 3 · La función que guarda

En `src/components/Citas.vue`, busca la línea `async function gardarCita() {` y pega esto **justo encima**:

```js
// Cambia solo el estado de una cita. El servidor mezcla lo que le llega con lo que la cita
// ya tenía, así que no hace falta enviar los demás campos (PUT parcial).
async function cambiarEstado(cita, estado) {
  try {
    // gardarCita(id, datos): actualiza la cita y recarga la tabla
    await citaStore.gardarCita(cita.id, { estado });
    toast("Estado actualizado"); // el aviso pequeño de la esquina
  } catch (e) {
    alertaError(mensajeError(e, "Non se puido cambiar o estado."));
    // Si falla, se recarga la lista para que el desplegable vuelva al valor real
    await citaStore.cargarCitas();
  }
}
```

## Paso 4 · El desplegable en la columna

En `src/components/Citas.vue`, busca la línea `<template #acciones="{ fila }">` (está dentro de `<DataTable`) y pega esto **justo encima**:

```vue
<!-- #celda-estado = el hueco de la celda de la columna con clave "estado" (la tabla lo ofrece sola) -->
<template #celda-estado="{ fila }">
  <!-- :value (una dirección) muestra el estado actual; @change avisa al elegir otro.
       $event.target.value = el valor de la opción que se acaba de elegir -->
  <select :value="fila.estado" @change="cambiarEstado(fila, $event.target.value)">
    <option v-for="e in estados" :key="e.valor" :value="e.valor">{{ e.texto }}</option>
  </select>
</template>
```

Qué hace: `DataTable` deja personalizar una celda con el hueco `#celda-` más la `clave` de la columna. La columna de estado tiene `clave: "estado"`, así que el hueco se llama `#celda-estado`.

## Qué deberías ver

1. En la columna Estado de cada fila hay un desplegable en vez de texto.
2. Al cambiarlo sale un aviso verde arriba a la derecha que desaparece solo.
3. Recarga la página con F5: el cambio sigue ahí.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| La celda sigue mostrando texto | El hueco se llama distinto: debe ser exactamente `#celda-estado` |
| `toast is not a function` | Falta el Paso 2 |
| Sale un error al cambiar | El doctor ya tiene una cita en esa hora o hay otro conflicto: el mensaje lo dice |
| Al recargar vuelve el valor antiguo | El `PUT` falló: mira la pestaña Red de F12 |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| axios | Llamar a la API desde Vue | `03_lecciones/03_crud_api_rest.md §5` |
| Toast y `timer` | Aviso pequeño que se cierra solo | `03_lecciones/05_sweetalert.md §6 y §7` |
| `v-model` | Ata un campo del formulario a un dato en los dos sentidos | `03_lecciones/vue/02_v_model.md` |

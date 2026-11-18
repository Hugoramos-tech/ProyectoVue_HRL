# Alertas extra: temporizador, pedir un texto y toast

Tres alertas nuevas con SweetAlert2, y un ejemplo de uso completo: un botón «Cancelar» en cada cita que pide el motivo con una ventana, guarda la cita como cancelada con ese motivo en observaciones y avisa con un toast.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

Todas las alertas viven en `src/utils/alertas.js` y devuelven una **promesa**: con `await` esperas a que el usuario cierre la alerta y, en las que preguntan algo, sabes qué respondió. Las alertas nuevas se añaden ahí, no en las vistas.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/utils/alertas.js` | Las tres alertas nuevas |
| `src/components/Citas.vue` | Un botón que las usa |

## Paso 1 · Las tres alertas

Abre `src/utils/alertas.js` y pega esto **al final del fichero** (si ya añadiste `toast` en la receta «Estado desde la tabla», no lo repitas):

```js
// Aviso pequeño en una esquina que se cierra solo a los 2 segundos.
// Alerta es la configuración base de SweetAlert2 que ya existe en este fichero; .fire(...) abre la ventana.
export const toast = (mensaje, icono = 'success') => {
    return Alerta.fire({
        toast: true,                  // formato "toast": pequeño y en una esquina
        position: 'top-end',          // arriba a la derecha
        icon: icono,                  // 'success', 'error', 'info'...
        title: mensaje,
        showConfirmButton: false,     // sin botón: se cierra solo
        timer: 2000,                  // milisegundos
        timerProgressBar: true        // barra que va menguando
    })
}

// Alerta que se cierra sola a los `ms` milisegundos, sin botón
export const alertaTemporal = (mensaje, ms = 2000) => {
    return Alerta.fire({
        icon: 'info',
        text: mensaje,
        timer: ms,
        timerProgressBar: true,
        showConfirmButton: false
    })
}

// Pide un texto. Devuelve lo escrito, o undefined si el usuario cancela.
// async/await: la función espera a que el usuario conteste antes de devolver nada.
export const pedirTexto = async (titulo) => {
    // Se desestructura `value`: es lo que escribió el usuario
    const { value } = await Alerta.fire({
        title: titulo,
        input: 'text',               // la ventana trae un campo de texto
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        // Si devuelve un texto, lo enseña como error y NO deja aceptar; con undefined, deja
        inputValidator: (v) => (!v ? 'Escribe algo' : undefined)
    })
    return value
}
```

Qué hace: `inputValidator` impide aceptar la ventana con el campo vacío. `Alerta` es el `mixin` del principio del fichero, que ya trae los colores de la web.

## Paso 2 · Importar lo necesario

En `src/components/Citas.vue`, hay dos cambios.

Busca la línea que empieza por `import { alertaExito` y **sustitúyela** por:

```js
import { alertaExito, alertaError, alertaConfirmacion, toast, pedirTexto } from "../utils/alertas.js";
```

Busca la línea `import { CalendarDays, ClipboardList, Save, Eraser, FileDown } from "lucide-vue-next";` y **sustitúyela** por:

```js
import { CalendarDays, ClipboardList, Save, Eraser, FileDown, Ban } from "lucide-vue-next";
```

## Paso 3 · La función

En `src/components/Citas.vue`, busca la línea `async function gardarCita() {` y pega esto **justo encima**:

```js
// Pide el motivo con una ventana y guarda la cita como cancelada
async function cancelarConMotivo(cita) {
  const motivo = await pedirTexto("Motivo da cancelación");
  if (!motivo) return; // el usuario cerró la ventana: no se hace nada
  try {
    // PUT parcial: solo cambian estos dos campos. gardarCita recarga la tabla después.
    await citaStore.gardarCita(cita.id, { estado: "cancelada", observacions: motivo });
    toast("Cita cancelada");
  } catch (e) {
    alertaError(mensajeError(e, "Non se puido cancelar a cita."));
  }
}
```

## Paso 4 · El botón

En `src/components/Citas.vue`, busca la línea `title="Informe da cita"`. Tres líneas por encima empieza su `<AppButton`. Pega este botón **justo encima de ese `<AppButton`** (dentro de `<RowActions`):

```vue
          <AppButton
            variante="fantasma"
            icono
            title="Cancelar con motivo"
            aria-label="Cancelar con motivo"
            @click="cancelarConMotivo(fila)"
          >
            <Ban :size="16" />
          </AppButton>
```

## Qué deberías ver

1. Un icono de prohibido en cada fila de citas.
2. Al pulsarlo, una ventana pide el motivo; no deja aceptar vacío.
3. Al aceptar, la cita pasa a «Cancelada», con ese texto en observaciones, y sale un toast arriba a la derecha que se va solo.
4. Si cierras la ventana sin escribir, no pasa nada.

Para probar `alertaTemporal`, en cualquier función: `alertaTemporal("Guardando...")`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `pedirTexto is not a function` | Falta el Paso 2, o no la exportaste en el Paso 1 |
| La ventana no pide nada | `input: 'text'` mal escrito |
| El toast no sale | Falta importar `toast` |
| Se cancela aunque cierras la ventana | Falta el `if (!motivo) return;` |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `Swal.fire` y `isConfirmed` | Abrir una alerta y saber qué botón pulsó el usuario | `03_lecciones/05_sweetalert.md §2 a §4` |
| `mixin` | Opciones por defecto para todas las alertas | `03_lecciones/05_sweetalert.md §5` |
| Toast y `timer` | Aviso pequeño que se cierra solo | `03_lecciones/05_sweetalert.md §6 y §7` |
| `input` en una alerta | Pedir un dato al usuario | `03_lecciones/05_sweetalert.md §8` |

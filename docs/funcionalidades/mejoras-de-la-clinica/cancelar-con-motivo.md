# Cancelar una cita pidiendo el motivo

Un botón «Cancelar» en cada fila de la tabla de citas. Al pulsarlo se abre una ventana que pide el motivo (obligatorio), la cita pasa a «cancelada» y el motivo se añade a sus observaciones.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

SweetAlert2 puede pedir un texto: con `input: "text"` la ventana trae un campo, y `inputValidator` impide aceptar si está vacío. Después se guarda la cita con solo los dos campos que cambian: `estado` y `observacions`. El servidor actualiza esos y deja el resto igual.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | El import, la función y el botón |

## Paso 1 · Los imports

En `src/components/Citas.vue`, hay dos líneas que cambiar.

Busca la línea `import { CalendarDays, ClipboardList, Save, Eraser, FileDown } from "lucide-vue-next";` y **sustitúyela** por:

```js
// Ban = el icono de "prohibido" que llevará el botón (lucide-vue-next: cada icono es un componente)
import { CalendarDays, ClipboardList, Save, Eraser, FileDown, Ban } from "lucide-vue-next";
```

Busca la línea `import { datosParaPdf } from "../utils/tabla.js";` y pega esto **justo debajo**:

```js
// SweetAlert2 directamente: aquí hace falta una ventana con un campo de texto, que los avisos del proyecto no tienen
import Swal from "sweetalert2";
```

## Paso 2 · La función

Busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega esto **justo encima**:

```js
// Pide el motivo y, si se confirma, cancela la cita y lo apunta en las observaciones
async function cancelarCita(cita) {
  // Swal.fire abre la ventana y devuelve una promesa; await espera a que el usuario pulse algo.
  // isConfirmed = true si pulsó "Cancelar a cita"; value = el texto que escribió.
  const { isConfirmed, value } = await Swal.fire({
    title: "Cancelar a cita",
    input: "text", // la ventana trae un campo de texto
    inputLabel: "Motivo da cancelación",
    // Se ejecuta al aceptar: si devuelve un texto, lo enseña como error y NO deja cerrar; con undefined, sigue
    inputValidator: (texto) => (!texto.trim() ? "Escribe un motivo" : undefined),
    showCancelButton: true,
    confirmButtonText: "Cancelar a cita",
    cancelButtonText: "Volver",
  });
  if (!isConfirmed) return; // pulsó "Volver": no se hace nada
  try {
    // Se añade el motivo a lo que ya hubiera en las observaciones (?? "" = si no había nada, texto vacío)
    const observacions = `${cita.observacions ?? ""} Cancelada: ${value.trim()}`.trim();
    // PUT parcial: solo se mandan los dos campos que cambian. gardarCita recarga la tabla después.
    await citaStore.gardarCita(cita.id, { estado: "cancelada", observacions });
    alertaExito("Cita cancelada.");
  } catch (e) {
    alertaError(mensajeError(e, "Non se puido cancelar a cita."));
  }
}
```

Qué hace: `value` es lo que escribió el usuario. `isConfirmed` es `false` si pulsó «Volver». `gardarCita(id, datos)` hace un `PUT` y recarga la tabla.

## Paso 3 · El botón

Busca la línea `</RowActions>` y pega esto **justo encima**:

```vue
          <!-- v-if: el botón solo existe mientras la cita no esté ya cancelada -->
          <AppButton
            v-if="fila.estado !== 'cancelada'"
            variante="fantasma"
            icono
            title="Cancelar cita"
            aria-label="Cancelar cita"
            @click="cancelarCita(fila)"
          >
            <Ban :size="16" />
          </AppButton>
```

## Qué deberías ver

1. Un botón con un círculo tachado en cada fila (menos en las ya canceladas).
2. Al pulsarlo, una ventana con un campo para el motivo.
3. Con el campo vacío, no deja aceptar y avisa «Escribe un motivo».
4. Al aceptar, la cita pasa a «Cancelada», sale un aviso verde y el motivo aparece en las observaciones al editarla.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `Swal is not defined` | Falta el `import Swal from "sweetalert2";` |
| `Ban is not defined` | No se cambió el import de `lucide-vue-next` |
| El botón no aparece | `</RowActions>` buscado en otro fichero, o el botón quedó fuera de `<RowActions>` |
| Error 400 al guardar | Se envió algún campo con formato incorrecto; se envían solo `estado` y `observacions` |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| SweetAlert2 con `input` | Una ventana que pide un texto | `03_lecciones/05_sweetalert.md` |
| `async` / `await` | Esperar la respuesta del usuario | `03_lecciones/03_crud_api_rest.md §5` |
| Slot por defecto de `RowActions` | Botones extra en la fila | `03_lecciones/02_router_comunicacion.md` |

## Guías relacionadas

- [Alertas extra](../alertas-y-pdf/alertas-extra.md)
- [Estado desde la tabla](../listas/estado-desde-la-tabla.md)

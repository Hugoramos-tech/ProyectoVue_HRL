# Reprogramar una cita

Un botón «Reprogramar» en cada cita pendiente o confirmada. Abre una ventana con dos campos (fecha y hora) y cambia solo esos dos datos. Si el doctor está ocupado, el servidor responde `409` y se muestra el aviso.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

SweetAlert2 permite poner HTML dentro de la ventana (`html`) y recoger lo escrito en `preConfirm`. Después se guarda con `gardarCita(id, { fecha, hora })`, que hace un `PUT` parcial.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | Imports, la función y el botón |

## Paso 1 · Los imports

En `src/components/Citas.vue`, hay dos líneas.

Busca `import { CalendarDays, ClipboardList, Save, Eraser, FileDown } from "lucide-vue-next";` y **sustitúyela** por:

```js
// CalendarClock = el icono (un calendario con reloj) del botón nuevo
import { CalendarDays, ClipboardList, Save, Eraser, FileDown, CalendarClock } from "lucide-vue-next";
```

Busca la línea `import { datosParaPdf } from "../utils/tabla.js";` y pega esto **justo debajo**:

```js
// SweetAlert2 directamente: se necesita una ventana con campos propios
import Swal from "sweetalert2";
```

(Si ya lo pegaste en otra receta, salta esta segunda línea.)

## Paso 2 · La función

Busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega esto **justo encima**:

```js
// Pide una fecha y una hora nuevas y las guarda. El servidor comprueba que el doctor esté libre.
async function reprogramarCita(cita) {
  const { isConfirmed, value } = await Swal.fire({
    title: "Reprogramar a cita",
    // html mete dos campos dentro de la ventana, ya rellenos con los datos actuales de la cita
    html: `
      <input id="nova-data" type="date" class="swal2-input" value="${cita.fecha}">
      <input id="nova-hora" type="time" class="swal2-input" value="${cita.hora}">
    `,
    showCancelButton: true,
    confirmButtonText: "Gardar",
    cancelButtonText: "Volver",
    // preConfirm se ejecuta al pulsar "Gardar": lee los campos, valida y devuelve lo que llegará como `value`
    preConfirm: () => {
      const fecha = document.getElementById("nova-data").value;
      const hora = document.getElementById("nova-hora").value;
      if (!fecha || !hora) {
        Swal.showValidationMessage("Elixe unha data e unha hora"); // mensaje rojo; la ventana no se cierra
        return false;
      }
      return { fecha, hora };
    },
  });
  if (!isConfirmed) return; // pulsó "Volver"
  try {
    // PUT parcial: solo cambian estos dos campos. Si el doctor está ocupado, el servidor da 409 y se muestra
    await citaStore.gardarCita(cita.id, value);
    alertaExito("Cita reprogramada.");
  } catch (e) {
    alertaError(mensajeError(e, "Non se puido reprogramar a cita."));
  }
}
```

Qué hace: `html` mete los dos campos dentro de la ventana. `preConfirm` se ejecuta al pulsar «Gardar»: lee los campos, valida y devuelve el objeto, que llega como `value`.

## Paso 3 · El botón

Busca la línea `</RowActions>` y pega esto **justo encima**:

```vue
          <!-- Solo se puede reprogramar una cita que aún está viva (pendiente o confirmada) -->
          <AppButton
            v-if="fila.estado === 'pendente' || fila.estado === 'confirmada'"
            variante="fantasma"
            icono
            title="Reprogramar"
            aria-label="Reprogramar"
            @click="reprogramarCita(fila)"
          >
            <CalendarClock :size="16" />
          </AppButton>
```

## Qué deberías ver

1. Un botón con un reloj en las citas pendientes y confirmadas.
2. Al pulsarlo, una ventana con la fecha y hora actuales de la cita.
3. Con una fecha y hora libres, la cita cambia y sale «Cita reprogramada.».
4. Con una hora que el doctor ya tiene ocupada, sale la alerta roja con el mensaje del servidor.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `CalendarClock is not defined` | No se cambió el import de `lucide-vue-next` |
| Los campos salen vacíos | Falta el `value="${...}"` dentro del HTML |
| Al aceptar no pasa nada | `preConfirm` no devuelve el objeto, o `id="nova-data"` no coincide con `getElementById` |
| El botón no aparece | Se pegó fuera de `<RowActions>` |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| SweetAlert2 con `html` y `preConfirm` | Una ventana con varios campos | `03_lecciones/05_sweetalert.md` |
| `PUT` parcial | Enviar solo los campos que cambian | `03_lecciones/03_crud_api_rest.md §3` |

## Guías relacionadas

- [Cancelar con motivo](../mejoras-de-la-clinica/cancelar-con-motivo.md)
- [Alertas extra](../alertas-y-pdf/alertas-extra.md)

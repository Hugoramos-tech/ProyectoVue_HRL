# Aviso al borrar un paciente con citas

Al eliminar un paciente, la confirmación dice cuántas citas tiene. El número sale de la API, no de una lista que estuviera cargada en otra página.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Necesitas un paciente con citas y otro sin ellas.

> **Ojo:** hoy el servidor **no deja** borrar un paciente con citas: responde `409`. Esta receta avisa antes; después saldrá ese error. Si el enunciado pide poder borrarlo «igualmente», hay que cambiar también el backend: receta [borrado en cascada](../backend/borrado-en-cascada.md).

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | La confirmación, con el número de citas |

## Paso 1 · Importar la API de citas

En `src/components/XestionPacientes.vue`, busca la línea `import { mensajeError } from "../utils/errores.js";` y pega **justo debajo**:

```js
import { obtenerCitas } from "../api/citas.js";
```

## Paso 2 · Pedir las citas antes de confirmar

En `src/components/XestionPacientes.vue`, busca la línea `const { isConfirmed } = await alertaConfirmacion(`. Dentro de la función `eliminarPacientePorId` hay estas tres líneas; **sustitúyelas** por el bloque de debajo:

```js
  const { isConfirmed } = await alertaConfirmacion(
    `Vas eliminar a ${paciente.nomepac} ${paciente.apelpac}.`,
  );
```

```js
  // Las citas guardan el DNI del paciente: se piden al servidor las que tiene.
  // `.catch(() => [])`: si la API falla, se sigue con "ninguna cita" en vez de dejar el borrado a medias.
  const citasPaciente = await obtenerCitas({ paciente: paciente.dnipac }).catch(() => []);
  // condición ? si_cierto : si_falso -> el texto del aviso depende de cuántas citas tenga
  const aviso = citasPaciente.length > 0
    ? `Este paciente ten ${citasPaciente.length} citas. Eliminar igualmente?`
    : `Vas eliminar a ${paciente.nomepac} ${paciente.apelpac}.`;

  // isConfirmed = true solo si el usuario pulsa el botón de confirmar
  const { isConfirmed } = await alertaConfirmacion(aviso);
```

Qué hace: pide al servidor las citas de ese DNI y elige el texto según cuántas hay. El `.catch(() => [])` hace que, si la API falla, se siga con el aviso normal en vez de dejar el borrado a medias.

## Qué deberías ver

1. Elimina un paciente sin citas: la confirmación normal, «Vas eliminar a …».
2. Elimina uno con 3 citas: «Este paciente ten 3 citas. Eliminar igualmente?».
3. Si aceptas, el servidor responde `409` y sale su mensaje de error («Non se pode eliminar: o paciente ten citas»), salvo que hayas hecho también el borrado en cascada.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `obtenerCitas is not defined` | Falta el Paso 1 |
| Siempre dice 0 citas | El DNI es distinto del de las citas (mayúsculas): se pasa `paciente.dnipac` tal cual |
| `isConfirmed has already been declared` | Dejaste la línea antigua además de la nueva: sustituye las tres, no añadas |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `Swal.fire` y `isConfirmed` | Abrir una alerta y saber qué botón pulsó el usuario | `03_lecciones/05_sweetalert.md §2 a §4` |
| axios | Llamar a la API desde Vue | `03_lecciones/03_crud_api_rest.md §5` |

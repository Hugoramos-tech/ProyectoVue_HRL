# Avisar de una cita duplicada antes de enviar el formulario

Antes de guardar una cita, la web mira si el doctor ya tiene otra a esa fecha y hora. Si la tiene, sale una alerta y no se envía nada. El servidor sigue comprobándolo igual, pero así el usuario se entera sin esperar al error.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`). Crea antes una cita para algún doctor.

## La idea

Se piden las citas de ese doctor y se busca una con la misma fecha y hora que no esté cancelada. Si se está editando, la propia cita se deja fuera.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | El import y la comprobación en `gardarCita` |

## Paso 1 · El import

En `src/components/Citas.vue`, busca la línea `import { datosParaPdf } from "../utils/tabla.js";` y pega esto **justo debajo** (si ya la pegaste en otra receta, salta este paso):

```js
// La función que pide las citas al servidor
import { obtenerCitas } from "../api/citas.js";
```

## Paso 2 · La comprobación

Busca la línea `// Se guarda antes de actualizar idEditando, para saber qué mensaje mostrar` y pega esto **justo encima**:

```js
    // Antes de enviar: ¿el doctor ya tiene otra cita a esa fecha y hora?
    // Se piden al servidor las citas de ese doctor (await = esperar la respuesta antes de seguir)
    const delDoctor = await obtenerCitas({ doctor: datos.doctorId });
    // find devuelve la primera cita que coincide en fecha y hora, o undefined si no hay ninguna.
    // Se ignoran las canceladas y la propia cita que se está editando (idEditando).
    const choca = delDoctor.find(
      (c) =>
        c.fecha === datos.fecha &&
        c.hora === datos.hora &&
        c.estado !== "cancelada" &&
        c.id !== idEditando.value
    );
    if (choca) {
      alertaError(`O doctor xa ten unha cita ás ${datos.hora} ese día.`, "Cita duplicada");
      return; // sale de la función SIN enviar nada al servidor
    }
```

Qué hace: `return` dentro del `try` sale de la función sin enviar. No hay que hacer nada más: el formulario queda como estaba.

## Qué deberías ver

1. Con un doctor y una hora ya ocupados, al pulsar «Gardar» sale la alerta «O doctor xa ten unha cita ás 10:00 ese día.» y no se guarda nada.
2. Con otra hora, se guarda con normalidad.
3. Editar una cita sin cambiarle la hora no da la alerta.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| La alerta sale al editar la propia cita | Falta `c.id !== idEditando.value` |
| No hace nada | La línea del Paso 2 se pegó fuera del `try` de `gardarCita` |
| Avisa de citas canceladas | Falta `c.estado !== "cancelada"` |
| `obtenerCitas is not defined` | Falta el Paso 1 |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `async` / `await` | Esperar la respuesta antes de seguir | `03_lecciones/03_crud_api_rest.md §5` |
| SweetAlert2 | La alerta roja con título | `03_lecciones/05_sweetalert.md` |

## Guías relacionadas

- [Horas libres](../mejoras-de-la-clinica/horas-libres.md)
- [Índice único](../backend/indice-unico.md)

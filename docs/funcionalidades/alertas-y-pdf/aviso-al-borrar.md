# Aviso al borrar un paciente con citas

Al eliminar un paciente, la confirmación dice cuántas citas tiene. El número se pide a la API en ese momento, no sale de una lista cargada en otra pantalla.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Necesitas un paciente con citas y otro sin ellas.

> **Importante en este proyecto:** el backend **sí deja** borrar un paciente con citas. `DELETE /api/pacientes/:dni` solo borra el paciente y no toca la colección `citas`, así que sus citas se quedan **huérfanas**: siguen en la base de datos apuntando a un DNI que ya no existe, y en la pantalla de citas saldrían como «Paciente no disponible». Por eso este aviso es útil de verdad. Si quieres que además se borren sus citas, está la receta de [borrado en cascada](../backend/borrado-en-cascada.md).

## La idea

Las citas guardan el **DNI** del paciente en el campo `pacienteDNI`, y `getCitas` acepta ese DNI como filtro. Así que antes de abrir la confirmación se pide al servidor cuántas citas tiene y se cambia el texto del aviso según el resultado.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | El import y la confirmación, con el número de citas |

## Paso 1 · Importar la API de citas

Busca la línea `import { generarPDF } from "../utils/pdf.js";` y pega esto **justo debajo**:

```js
// Hace falta para contar las citas del paciente antes de borrarlo.
import { getCitas } from "../api/citas.js";
```

## Paso 2 · Contar las citas antes de confirmar

Dentro de `eliminarPaciente(index)`, busca esta línea:

```js
    `¿Quieres eliminar a ${paciente.nomepac} ${paciente.apelpac}?`,
```

y **sustitúyela** por:

```js
    aviso,
```

Después, busca la línea `  // La promesa devuelve isConfirmed para decidir si se elimina o se cancela.` y pega esto **justo encima**:

```js
  // Las citas guardan el DNI del paciente, y getCitas acepta ese DNI como filtro.
  // .catch(() => []) hace que, si la API falla, se siga con "ninguna cita" en vez
  // de dejar el borrado a medias por un error de red.
  const citasPaciente = await getCitas({ pacienteDNI: paciente.dnipac }).catch(() => []);

  // condicion ? si_es_cierto : si_es_falso -> el texto depende de cuantas citas tenga.
  // citasPaciente.length === 1 se trata aparte para no escribir "1 citas".
  const aviso = citasPaciente.length > 0
    ? `${paciente.nomepac} ${paciente.apelpac} tiene ${citasPaciente.length} ${
        citasPaciente.length === 1 ? "cita" : "citas"
      }. Si lo eliminas, esas citas quedarán sin paciente. ¿Eliminar igualmente?`
    : `¿Quieres eliminar a ${paciente.nomepac} ${paciente.apelpac}?`;
```

El bloque entero queda así:

```js
  // Las citas guardan el DNI del paciente...
  const citasPaciente = await getCitas({ pacienteDNI: paciente.dnipac }).catch(() => []);

  const aviso = citasPaciente.length > 0
    ? `...`
    : `¿Quieres eliminar a ${paciente.nomepac} ${paciente.apelpac}?`;

  // La promesa devuelve isConfirmed para decidir si se elimina o se cancela.
  const confirmacion = await alertaConfirmacion(
    aviso,
    "Eliminar paciente"
  );
```

> El orden importa: `aviso` tiene que estar **declarado antes** de usarse en `alertaConfirmacion`. Si lo pegas debajo, dará `Cannot access 'aviso' before initialization`.

## Variante · Que el aviso sea de verdad un aviso

Para que la ventana se vea como advertencia y no como pregunta, puedes usar `alertaConfirmacion` con otro título cuando hay citas:

```js
  const confirmacion = await alertaConfirmacion(
    aviso,
    citasPaciente.length > 0 ? "Atención: tiene citas" : "Eliminar paciente"
  );
```

## Qué deberías ver

1. Elimina un paciente sin citas: la confirmación normal, «¿Quieres eliminar a …?».
2. Elimina uno con 3 citas: «… tiene 3 citas. Si lo eliminas, esas citas quedarán sin paciente. ¿Eliminar igualmente?».
3. Con una sola cita dice «1 cita», no «1 citas».
4. Si aceptas, el paciente se borra. Si entras en Citas con otro paciente seleccionado, las citas huérfanas no se ven, porque la pantalla filtra por la selección.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `getCitas is not defined` | Falta el Paso 1 |
| Siempre dice 0 citas | El filtro es `pacienteDNI`, no `paciente`: es el nombre que espera `getCitas` |
| Siempre dice 0 y el DNI parece correcto | El backend normaliza el DNI a mayúsculas; si en la base está en minúsculas no cuadra |
| `Cannot access 'aviso' before initialization` | El bloque del Paso 2 quedó **debajo** de `alertaConfirmacion` |
| `aviso is not defined` | Pegaste el bloque fuera de la función `eliminarPaciente` |
| Se queda colgado al borrar | La API de citas no responde: el `.catch(() => [])` lo evita, comprueba que lo copiaste |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `alertaConfirmacion` e `isConfirmed` | Abrir un diálogo y saber qué botón pulsó el usuario |
| Operador ternario | `condicion ? a : b`, elegir entre dos valores en una línea |
| `.catch(() => [])` | Si la petición falla, seguir con una lista vacía |
| Integridad a mano | MongoDB no tiene claves ajenas: los huérfanos hay que evitarlos en el código |

## Guías relacionadas

- [Borrado en cascada](../backend/borrado-en-cascada.md)
- [Dar de baja a un paciente](../mejoras-de-la-clinica/dar-de-baja-a-un-paciente.md)
- [Alertas extra](alertas-extra.md)

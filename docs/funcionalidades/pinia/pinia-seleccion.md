# Elegir en una página y usarlo en otra (Pinia)

Al seleccionar un paciente en su pestaña, la portada muestra «Último paciente: …». Sirve para entender cómo dos pantallas comparten un dato.

**Antes de empezar:** arranca el proyecto (`npm start`). Necesitas al menos un paciente guardado.

## Lo que ya tienes hecho

**Este proyecto ya usa Pinia para esto**, así que no hay que crear ningún store nuevo. Ya existen dos:

| Store | Fichero | Qué guarda |
|---|---|---|
| `usepacienteStore` | `src/store/pacienteStore.js` | El paciente seleccionado: `idPaciente`, `dnipac`, `nomepac`, `apelpac` |
| `useDoctorStore` | `src/store/doctorStore.js` | El doctor seleccionado: `idDoctor`, `nomedoc`, `apeldoc`, `espedoc` |

El circuito que ya funciona:

```
XestionPacientes.vue  ──seleccionarPaciente(u)──▶  pacienteStore  ──▶  Citas.vue
   (boton 👤 de la tabla)                           (Pinia)         (carga sus citas)
```

En `XestionPacientes.vue` el botón 👤 de cada fila llama a `seleccionarPaciente(u)`, que a su vez llama a `pacienteStore.seleccionarPaciente(paciente)`. En `Citas.vue` hay un `watch` sobre `pacienteStore.dnipac` que recarga la pantalla cuando cambia.

Lo que vas a hacer aquí es **añadir un tercer lector**: la portada.

## Dos detalles de estos stores

**1. Son stores de opciones, no de función.** Los tuyos se escriben así:

```js
export const usepacienteStore = defineStore("paciente", {
  state: () => ({ ... }),
  actions: { ... },
});
```

No con `ref()` dentro de una función. Es la otra forma válida de escribir un store, y es la que usa el profesor en clase.

**2. No necesitas `storeToRefs`.** Si en la plantilla escribes `pacienteStore.nomepac`, la reactividad se mantiene, porque el objeto del store ya es reactivo. `storeToRefs` solo hace falta si **desestructuras** (`const { nomepac } = store`), que es justo lo que rompe la reactividad.

**3. Cuidado con el nombre.** Es `usepacienteStore`, con la **p minúscula**. No `usePacienteStore`. Si lo escribes con mayúscula dará `usePacienteStore is not a function`.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Inicio.vue` | Leer el store y pintar el nombre |

## Paso 1 · Leer el store en la portada

En `src/components/Inicio.vue`, busca la línea `const clinicVideoUrl = '/assets/videos/clinica.mp4'` y pega esto **justo debajo**:

```js
// El store ya existe y lo rellena la pestana de pacientes: aqui solo se lee.
import { usepacienteStore } from '../store/pacienteStore.js'

// usepacienteStore() devuelve SIEMPRE el mismo objeto compartido, no una copia.
// Por eso lo que escriba la pestana de pacientes se ve aqui.
const pacienteStore = usepacienteStore()
```

> Los `import` pueden ir en cualquier punto del `<script setup>`: el navegador los sube arriba al compilar. Aun así, si lo prefieres ordenado, pon la línea del `import` encima de `const clinicVideoUrl`.

## Paso 2 · Pintarlo

En el `<template>`, busca la línea `</main>` y pega esto **justo encima**:

```vue
    <!-- v-if: el bloque solo existe si hay un paciente seleccionado en Pinia.
         Se lee pacienteStore.nomepac directamente: asi no se pierde la reactividad. -->
    <section
      v-if="pacienteStore.dnipac"
      class="rounded-2xl border border-[#cfe0d6] bg-[#f4faf6] p-5"
    >
      <h2 class="mb-1 text-lg font-bold text-[#153f2e]">
        Último paciente seleccionado
      </h2>
      <p class="text-sm text-[#28695e]">
        <strong>{{ pacienteStore.nomepac }} {{ pacienteStore.apelpac }}</strong>
        — DNI {{ pacienteStore.dnipac }}
      </p>
      <RouterLink
        class="mt-3 inline-block text-sm font-bold text-[#14543a] underline"
        to="/citas"
      >
        Ver sus citas →
      </RouterLink>
    </section>
```

> `RouterLink` no hace falta importarlo: el router lo registra para toda la aplicación.

## Variante · Mostrar también el doctor

El store de doctores funciona igual. En el Paso 1 añade:

```js
import { useDoctorStore } from '../store/doctorStore.js'
const doctorStore = useDoctorStore()
```

Y en el Paso 2, dentro de la `<section>`:

```vue
      <p
        v-if="doctorStore.idDoctor"
        class="text-sm text-[#28695e]"
      >
        Doctor: <strong>{{ doctorStore.nomedoc }} {{ doctorStore.apeldoc }}</strong>
        ({{ doctorStore.espedoc }})
      </p>
```

Fíjate en que aquí el nombre del store **sí** lleva la D mayúscula: `useDoctorStore`.

## Variante · Un botón para limpiar la selección

Los dos stores ya traen su acción de limpiar. Dentro de la `<section>`:

```vue
      <button
        class="mt-2 text-sm underline"
        type="button"
        @click="pacienteStore.limpiarPaciente()"
      >
        Quitar selección
      </button>
```

Al pulsarlo, el bloque desaparece solo, porque `v-if` depende de `pacienteStore.dnipac`.

## Qué deberías ver

1. Entra en Pacientes y pulsa el botón 👤 de una fila. El emoji cambia a ✅.
2. Vuelve a la portada con el menú: aparece «Último paciente: …» con su nombre y DNI.
3. El enlace «Ver sus citas» lleva a Citas, ya cargada con ese paciente.
4. Recarga con F5: desaparece. **Un store no sobrevive a recargar la página**, porque vive en memoria.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `usePacienteStore is not a function` | Es `usepacienteStore`, con p minúscula |
| La portada no muestra nada | No seleccionaste con el botón 👤: editar un paciente también lo selecciona, pero solo pulsar ✏️ o 👤 |
| Se ve pero no se actualiza al cambiar de paciente | Desestructuraste el store (`const { nomepac } = ...`) sin `storeToRefs`: usa `pacienteStore.nomepac` |
| Sale «undefined undefined» | El paciente no tiene `nomepac` o `apelpac`: míralo en la tabla |
| Desaparece al recargar | Es lo normal. Para que sobreviva habría que guardarlo en `localStorage` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Store de Pinia | Un objeto compartido entre pantallas, con estado y acciones |
| Store de opciones | La forma `{ state, actions }`, la que usa este proyecto |
| `storeToRefs` | Solo hace falta si desestructuras el store |
| El store vive en memoria | Se pierde al recargar la página |

## Guías relacionadas

- [Contador en el menú](contador-en-el-menu.md)
- [Citas de hoy en la portada](citas-de-hoy.md)

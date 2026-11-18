# Horario de cada doctor

Cada doctor tiene una hora de entrada y una de salida. El formulario de doctores las pide, y el servidor rechaza una cita fuera de ese horario.

**Antes de empezar:** arranca el proyecto (`npm start`). El backend no recarga solo: se reinicia tras los pasos del servidor.

## La idea

Son dos campos nuevos en el modelo `Doctor` (con valores por defecto, para los doctores que ya existen). Al crear o editar una cita, el servidor busca al doctor y comprueba que la hora cae dentro. Las horas `HH:MM` se pueden comparar como texto: `"09:30" < "10:00"`.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/modelos/Doctor.js` | Los dos campos |
| `src/components/XestionDoctores.vue` | El molde y los campos del formulario |
| `backend/rutas/citas.rutas.js` | La comprobación |

## Paso 1 · El modelo

En `backend/modelos/Doctor.js`, hay dos cambios.

Busca la línea `import { TELEFONO, CORREO } from './validaciones.js'` y **sustitúyela** por:

```js
// Se añade HORA al import: es la validación de formato "HH:MM" que ya existe en validaciones.js
import { TELEFONO, CORREO, HORA } from './validaciones.js'
```

Busca la línea `espedoc: { type: String, required: true, trim: true },` y pega esto **justo debajo**:

```js
        // Horario de trabajo (HH:MM). Los doctores que ya existían no tienen estos campos: toman el `default`.
        // `match` rechaza textos que no tengan forma de hora.
        horaini: { type: String, default: '09:00', match: HORA },
        horafin: { type: String, default: '20:00', match: HORA },
```

## Paso 2 · El molde

En `src/components/XestionDoctores.vue`, busca la línea `espedoc: "",` y pega esto **justo debajo**:

```js
  // Valores iniciales del molde del formulario (y a los que vuelve "Limpar")
  horaini: "09:00",
  horafin: "20:00",
```

## Paso 3 · Los campos

Busca estas dos líneas (están juntas, una debajo de otra) y pega el bloque de debajo **justo encima de ellas**:

```vue
      <template #acciones>
        <!-- Limpar: vacía el formulario y sale del modo edición. Va a la izquierda de Gardar. -->
```

```vue
      <!-- type="time" da un selector de hora; v-model lo ata al dato del molde -->
      <FormField label="Entrada:">
        <input
          v-model="datos.horaini"
          type="time"
          required
        >
      </FormField>
      <FormField label="Saída:">
        <input
          v-model="datos.horafin"
          type="time"
          required
        >
      </FormField>
```

## Paso 4 · La comprobación en el servidor

En `backend/rutas/citas.rutas.js`, hay tres cambios.

Busca la línea `import Cita from '../modelos/Cita.js'` y pega esto **justo debajo**:

```js
// El modelo Doctor, para poder buscar al doctor de la cita
import Doctor from '../modelos/Doctor.js'
```

Busca la línea `// Listado de citas, ordenadas por fecha y hora. Acepta ?doctor=<id> y ?paciente=<id>.` y pega esto **justo encima**:

```js
// ¿Cae la hora dentro del horario del doctor? Si el doctor no existe, no se opina aquí
// (de eso se encarga otra validación). Las horas "HH:MM" se pueden comparar como texto: "09:30" < "10:00".
async function dentroDelHorario({ doctorId, hora }) {
    // lean() devuelve un objeto simple (más rápido); findById busca por id
    const doctor = await Doctor.findById(doctorId).lean()
    if (!doctor) return true
    // `??` = valor por defecto si el doctor es antiguo y no tiene horario guardado
    return hora >= (doctor.horaini ?? '09:00') && hora < (doctor.horafin ?? '20:00')
}
```

Busca la línea `const cita = await Cita.create(req.body)` y pega esto **justo encima**:

```js
    // Al crear: si la hora cae fuera del horario, 400 (Bad Request: la petición no es válida)
    if (!(await dentroDelHorario(req.body))) {
        return res.status(400).json({ error: 'A hora non está dentro do horario do doctor' })
    }
```

**Reinicia el backend.** Para la edición (`PUT`), busca `const cita = await Cita.findByIdAndUpdate(req.params.id, req.body, {` y pega justo encima, con `actual` ya definido:

```js
    // Al editar: los datos nuevos (req.body) encima de los que ya tenía la cita (actual)
    if (!(await dentroDelHorario({ ...actual.toObject(), ...req.body }))) {
        return res.status(400).json({ error: 'A hora non está dentro do horario do doctor' })
    }
```

## Qué deberías ver

1. En el formulario de doctores, «Entrada» y «Saída» con `09:00` y `20:00`.
2. Un doctor con horario 10:00 a 14:00: una cita a las 09:00 da `400` «A hora non está dentro do horario do doctor»; a las 12:00 se crea.
3. En la web, esa frase sale en la alerta roja al guardar.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Los campos no aparecen | El Paso 3 se pegó fuera de `<FormGrid>`, antes de `<template #acciones>` |
| El horario no se guarda | No reiniciaste el backend: sin los campos en el modelo, Mongoose los ignora |
| Rechaza todas las citas | `doctor.horaini` vale `undefined`: falta el `?? '09:00'` |
| `Doctor is not defined` en la ruta | Falta el import del Paso 4 |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Campo nuevo con `default` | Un valor por defecto para los registros antiguos | [Campo nuevo](../datos/campo-nuevo.md) |
| Código `400` | La petición no es válida | `03_lecciones/03_crud_api_rest.md §3` |

## Guías relacionadas

- [Horario y fines de semana](../backend/horario-y-fines-de-semana.md)
- [Guía: campo nuevo](../../guias/campo-nuevo.md)

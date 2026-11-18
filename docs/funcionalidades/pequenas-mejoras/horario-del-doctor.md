# Horario de cada doctor

Cada doctor tiene una hora de entrada y una de salida. El formulario de doctores las pide, y el servidor rechaza con `400` cualquier cita fuera de ese horario.

**Antes de empezar:** arranca el proyecto (`npm start`). El backend no recarga solo: se reinicia tras los pasos 1 y 5.

## La idea

Dos campos nuevos en el modelo `Doctor`, **con valores por defecto**, para que los doctores
que ya existen sigan funcionando. Al crear o editar una cita, el servidor busca al doctor y
comprueba que la hora cae dentro de su horario.

Las horas se guardan como texto `hh:mm`, y así se pueden comparar directamente:
`"09:30" < "10:00"` es cierto. Es el mismo truco que con las fechas `aaaa-mm-dd`.

> `backend/modelos/Doctor.js` **no tiene** un fichero de validaciones compartido: cada regla
> está escrita en su propio campo. Así que el `match` va aquí mismo, con la expresión regular
> dentro.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/modelos/Doctor.js` | Los dos campos |
| `src/components/XestionDoctores.vue` | El molde y los campos del formulario |
| `backend/rutas/citas.rutas.js` | La comprobación |

## Paso 1 · El schema

En `backend/modelos/Doctor.js`, busca la línea `    espedoc: { type: String, required: true },` y pega esto **justo debajo**:

```js
    // Horario de trabajo, como texto hh:mm. Los doctores que ya existian no tienen
    // estos campos: toman el default, asi que no hay que editarlos uno a uno.
    // match rechaza cualquier texto que no tenga forma de hora: ^ principio, $ final,
    // [01]\d|2[0-3] las horas de 00 a 23, y [0-5]\d los minutos de 00 a 59.
    horainidoc: {
      type: String,
      default: "09:00",
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe tener formato hh:mm"]
    },
    horafindoc: {
      type: String,
      default: "20:00",
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe tener formato hh:mm"]
    },
```

**Reinicia el backend.**

## Paso 2 · El molde del formulario

En `src/components/XestionDoctores.vue`, busca la línea `  espedoc: "",` (está dentro de `doctorVacio`) y pega esto **justo debajo**:

```js
  // Valores iniciales del molde. Al estar en doctorVacio(), limparFormulario()
  // los restaura solos: esa funcion hace Object.assign(novoDoctor, doctorVacio()).
  horainidoc: "09:00",
  horafindoc: "20:00",
```

## Paso 3 · Los campos del formulario

En el `<template>`, busca la línea `      <div class="fila fila-colexiado">` y pega esto **justo encima**:

```vue
      <div class="fila">
        <div class="campo">
          <label for="horainidoc">Entrada:</label>
          <!-- type="time" da un selector de hora y guarda el valor como hh:mm -->
          <input
            id="horainidoc"
            v-model="novoDoctor.horainidoc"
            type="time"
            required
          >
        </div>

        <div class="campo">
          <label for="horafindoc">Salida:</label>
          <input
            id="horafindoc"
            v-model="novoDoctor.horafindoc"
            type="time"
            required
          >
        </div>
      </div>
```

## Paso 4 · Que la salida no sea antes de la entrada

Esto es de la web, y es la validación que se olvida. Busca la línea `const mailTocado = ref(false);` y pega esto **justo debajo**:

```js
// Mensaje de error del horario. Cadena vacia = sin error.
// Las horas hh:mm se comparan como texto y el orden sale bien.
const errorHorario = computed(() =>
  novoDoctor.horainidoc &&
  novoDoctor.horafindoc &&
  novoDoctor.horafindoc <= novoDoctor.horainidoc
    ? "La salida tiene que ser posterior a la entrada"
    : ""
);
```

`computed` ya está importado en este fichero.

Y en el `<template>`, busca la línea `      <p v-if="erro" class="mensaxe-erro" role="alert">{{ erro }}</p>` y pega esto **justo encima**:

```vue
      <p v-if="errorHorario" class="mensaxe-erro" role="alert">
        {{ errorHorario }}
      </p>
```

Para que además bloquee el botón, busca `        <button type="submit" class="btn-guardar">` y **sustitúyela** por:

```vue
        <button type="submit" class="btn-guardar" :disabled="Boolean(errorHorario)">
```

El `Boolean(...)` convierte el texto en `true`/`false`: con la cadena a secas, `:disabled`
recibiría `""`, que HTML interpreta de forma rara.

## Paso 5 · La comprobación en el servidor

En `backend/rutas/citas.rutas.js` hay dos cambios.

**5.1** Los imports: **no hay que tocar nada**. Ese fichero ya importa `Doctor`, porque
`validarRelaciones()` lo usa para comprobar que el doctor existe.

**5.2** Busca la línea `// GET /api/citas: filtra por DNI de paciente y doctor, y ordena cronologicamente.` y pega esto **justo encima**:

```js
// Comprueba que la hora de la cita cae dentro del horario del doctor.
// Devuelve "" si todo bien, o el mensaje de error.
async function dentroDelHorario(datos) {
    // Sin doctor o sin hora no hay nada que comprobar: de eso ya se ocupa el schema.
    if (!datos.doctorId || !datos.hora) {
        return ""
    }

    // Solo se piden los dos campos del horario, no el doctor entero.
    const doctor = await Doctor.findById(datos.doctorId, "horainidoc horafindoc nomedoc apeldoc").lean()
    if (!doctor) {
        return ""
    }

    // ?? son los valores de los doctores creados antes del Paso 1.
    const entrada = doctor.horainidoc ?? "09:00"
    const salida = doctor.horafindoc ?? "20:00"

    // Las horas hh:mm se comparan como texto. La salida NO entra: una cita a las
    // 20:00 de un doctor que acaba a las 20:00 se rechaza.
    if (datos.hora < entrada || datos.hora >= salida) {
        return `El doctor ${doctor.nomedoc} ${doctor.apeldoc} atiende de ${entrada} a ${salida}`
    }

    return ""
}
```

**5.3** Busca la línea `        const cita = await Cita.create(datos)` y pega esto **justo encima**:

```js
        // 400 Bad Request: los datos que llegan no son validos.
        const errorHora = await dentroDelHorario(datos)
        if (errorHora) {
            return res.status(400).json({ mensaje: errorHora })
        }

```

Y lo mismo al editar: busca la línea `        const cita = await Cita.findByIdAndUpdate(` y pega esto **justo encima**:

```js
        const errorHora = await dentroDelHorario(datos)
        if (errorHora) {
            return res.status(400).json({ mensaje: errorHora })
        }

```

**Reinicia el backend.**

La clave de la respuesta tiene que llamarse `mensaje`: es la que lee `mensajeError(...)` en
`Citas.vue`, así que el texto sale solo en la alerta roja sin tocar nada de la web.

## Variante · Limitar también el selector de hora en citas

Con la receta de [horas libres](../mejoras-de-la-clinica/horas-libres.md) hecha, los huecos
se pueden recortar al horario del doctor en vez de dejar siempre de 09:00 a 19:30. Es más
trabajo, porque hay que traerse el horario del doctor seleccionado, pero es lo que haría una
aplicación de verdad: no ofrecer lo que el servidor va a rechazar.

## Variante · Días de la semana

Añadiendo un campo más al schema:

```js
    // Dias que trabaja, 1 = lunes ... 7 = domingo. El default son los laborables.
    diasdoc: { type: [Number], default: [1, 2, 3, 4, 5] },
```

Y en la comprobación:

```js
    // getDay() da 0 para domingo; se convierte a 7 para que 1-7 sea lunes-domingo.
    const dia = new Date(`${datos.fecha}T00:00:00`).getDay() || 7
    if (!(doctor.diasdoc ?? [1, 2, 3, 4, 5]).includes(dia)) {
        return "El doctor no atiende ese dia de la semana"
    }
```

El `T00:00:00` fuerza a interpretar la fecha en hora local: sin él, en algunos husos saldría
el día anterior.

## Qué deberías ver

1. El formulario de doctores tiene «Entrada» y «Salida», con 09:00 y 20:00 puestas.
2. Pon la salida antes de la entrada: sale el mensaje y Guardar se desactiva.
3. Guarda un doctor con horario de 09:00 a 14:00.
4. Intenta crear una cita con ese doctor a las 16:00: sale la alerta roja con «atiende de 09:00 a 14:00».
5. A las 10:00 se crea sin problema.
6. Los doctores creados antes siguen funcionando: toman 09:00 y 20:00.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Los campos salen vacíos | Falta el Paso 2 |
| El horario no se guarda | No reiniciaste el backend tras el Paso 1 |
| Acepta cualquier hora en las citas | Falta el Paso 5.3, o no reiniciaste |
| `dentroDelHorario is not defined` | El Paso 5.2 quedó dentro de otra función |
| `Doctor is not defined` | Mira los imports de `citas.rutas.js`: debería estar ya |
| Siempre rechaza la cita | Los campos se llaman `horainidoc` y `horafindoc`; si en el schema pusiste otros nombres, `?? "09:00"` tapa el fallo y el horario real nunca se lee |
| Una cita a la hora de salida se rechaza | Es a propósito: el `>=` deja fuera la última hora. Con `>` se admitiría |
| El botón Guardar no se desactiva | Falta el `Boolean(...)` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `default` en el schema | Un valor para los documentos que no traen el campo |
| `match` | Validar con una expresión regular |
| Horas como texto `hh:mm` | Se comparan con `<` y `>` sin convertir nada |
| `findById` con campos | Traer solo lo que hace falta, no el documento entero |
| `type="time"` | Selector de hora que guarda `hh:mm` |
| Código `400` | Los datos que llegan no son válidos |

## Guías relacionadas

- [Horas libres del doctor](../mejoras-de-la-clinica/horas-libres.md)
- [Un paciente no puede tener dos citas a la vez](../mejoras-de-la-clinica/paciente-sin-dos-citas-a-la-vez.md)
- [Límite de citas por día](../backend/limite-por-dia.md)
- [Validaciones](../validacion/validaciones.md)

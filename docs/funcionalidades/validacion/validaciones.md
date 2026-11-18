# Validaciones: fecha no pasada y botón desactivado

En el formulario de citas, un mensaje debajo del campo «Fecha» si la fecha es anterior a hoy, y el botón Guardar desactivado mientras haya error. La misma regla en el servidor, por si alguien llama a la API sin pasar por la web.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

Hay **dos sitios** y los dos cuentan:

- La **web** evita que el usuario se equivoque y le dice por qué. Es comodidad.
- El **servidor** no se fía de nadie: la API se puede llamar con `curl` o desde Postman sin pasar por la web. Es seguridad.

Esa es la respuesta a «¿dónde se valida?»: en los dos, y por razones distintas.

> Tu `Citas.vue` ya tiene un `computed` llamado `formularioValido` que desactiva el botón si falta algún campo. Lo que falta es una regla de **contenido** (la fecha no puede ser pasada) y el mensaje que explica por qué.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Citas.vue` | El error, el mensaje y el botón |
| `backend/modelos/Cita.js` | La misma regla en el servidor |

## Paso 1 · En la web: calcular el error

Busca la línea `// Habilita el envio solo cuando los campos necesarios tienen contenido util.` y pega esto **justo encima**:

```js
// Mensaje de error de la fecha. Cadena vacia = sin error.
// computed se recalcula solo cuando cambia cita.fecha.
const errorFecha = computed(() => {
  // toLocaleDateString("sv-SE") da aaaa-mm-dd en hora LOCAL. Es el truco corto para
  // tener el formato de la base de datos sin montarlo con getFullYear y padStart.
  const hoy = new Date().toLocaleDateString("sv-SE")
  // Si hay fecha y es anterior a hoy, mensaje; si no, texto vacio.
  // Los textos aaaa-mm-dd se comparan con < en orden cronologico.
  return cita.fecha && cita.fecha < hoy ? "La fecha no puede ser pasada" : ""
})

// La fecha de hoy, para el atributo min del calendario del Paso 2.
const minimoFecha = new Date().toLocaleDateString("sv-SE")
```

`computed` ya está importado en este fichero.

## Paso 2 · En la web: enseñar el mensaje

En el `<template>`, busca la línea `id="fecha-cita"` y mira el bloque que la contiene:

```vue
          <div class="citas-campo">
            <label for="fecha-cita">Fecha:</label>
            <input
              id="fecha-cita"
              v-model="cita.fecha"
              type="date"
              required
            >
          </div>
```

**Sustituye ese bloque entero** por:

```vue
          <div class="citas-campo">
            <label for="fecha-cita">Fecha:</label>
            <!-- :min es la validacion del NAVEGADOR: no deja elegir dias anteriores
                 en el calendario. No sustituye a las otras dos, las complementa. -->
            <input
              id="fecha-cita"
              v-model="cita.fecha"
              :min="minimoFecha"
              type="date"
              required
            >
            <!-- v-if con un texto: si errorFecha esta vacio, el parrafo no se pinta -->
            <p
              v-if="errorFecha"
              class="text-sm font-bold text-[#b3261e]"
            >
              {{ errorFecha }}
            </p>
          </div>
```

## Paso 3 · En la web: desactivar el botón

El botón Guardar ya mira `formularioValido`. Hay que añadirle la regla nueva.

Busca la línea `    cita.estado` (está dentro de `formularioValido`) y **sustitúyela** por:

```js
    cita.estado &&
    // La regla nueva: sin error de fecha. Como errorFecha es un computed,
    // dentro del script se lee con .value.
    !errorFecha.value
```

Así no hay que tocar el `<button>`: su `:disabled="guardando || !formularioValido"` ya recoge el cambio.

## Paso 4 · En el servidor

En `backend/modelos/Cita.js`, busca la línea `fecha: { type: String, required: true },` y **sustitúyela** por:

```js
        fecha: {
            type: String,
            required: true,
            // validate con una funcion: tiene que devolver true si el valor VALE.
            // Esta es la validacion del SERVIDOR: aunque alguien se salte la web,
            // aqui se rechaza igual y Express responde 400 con este mensaje.
            validate: {
                validator: (valor) => valor >= new Date().toLocaleDateString("sv-SE"),
                message: "La fecha no puede ser pasada"
            }
        },
```

**Reinicia el backend** (Ctrl+C y `npm start`): el servidor no recarga solo.

## Paso 5 · Comprobar que el servidor la aplica de verdad

Con solo los pasos 1 a 3, una cita con fecha pasada **se guardaría** si la petición no pasa
por la web. Para verlo, en la pestaña Console de F12 (con la web abierta, para que no haya
problema de permisos):

```js
await fetch("http://localhost:3000/api/citas", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    pacienteDNI: "12345678Z",
    doctorId: "000000000000000000000000",
    fecha: "2020-01-01",
    hora: "10:00",
    motivo: "prueba",
  }),
}).then((r) => r.status)
```

Antes del Paso 4 da `201` o `500`. Después del Paso 4 da **`400`**. Eso es la prueba de que
la validación del servidor existe y no depende de la web.

## Ojo con esto

La regla del servidor se aplica también al **editar**. Si tu ruta de modificar pasa
`runValidators`, no podrás cambiar una cita de ayer (por ejemplo, marcarla como
«realizada»), porque la petición lleva la fecha pasada. Dos salidas:

- Dejar solo los Pasos 1 a 3, sin la regla del servidor.
- O validar la fecha **solo al crear**, poniendo la comprobación en la ruta `POST` de
  `backend/rutas/citas.rutas.js` en vez de en el modelo:

```js
  if (req.body.fecha < new Date().toLocaleDateString("sv-SE")) {
    return res.status(400).json({ mensaje: "La fecha no puede ser pasada" })
  }
```

Esa segunda opción es la más práctica para una clínica real: impide crear citas en el
pasado, pero deja arreglar las que ya existen.

## Las tres capas de validación

Esto es lo que conviene saber explicar:

| Capa | Dónde | Qué aporta | ¿Se puede saltar? |
|---|---|---|---|
| HTML | `required`, `min`, `max`, `pattern`, `type="email"` en el `<input>` | El navegador avisa sin escribir JavaScript | Sí, con las herramientas de F12 |
| JavaScript | `computed` y funciones en el componente | Mensajes a medida y reglas que cruzan campos | Sí, llamando a la API directamente |
| Servidor | `required`, `validate`, `match` en `backend/modelos/` | La única que no se puede saltar | No |

Las de tu proyecto que ya existen: `esDniCorrecto`, `validarMail`, `dniDuplicado` y
`hayError` en `XestionPacientes.vue` (capa JavaScript), y los `required: true` de los tres
schemas de `backend/modelos/` (capa servidor).

## Variante · Una regla que cruza dos campos

Que la hora no pueda ser pasada **si la fecha es hoy**:

```js
const errorHora = computed(() => {
  const hoy = new Date().toLocaleDateString("sv-SE")
  // Solo aplica si la cita es para hoy: mañana cualquier hora vale.
  if (cita.fecha !== hoy || !cita.hora) {
    return ""
  }
  // toTimeString() da "14:05:33 GMT+0100..."; slice(0, 5) deja "14:05"
  const ahora = new Date().toTimeString().slice(0, 5)
  return cita.hora < ahora ? "Esa hora ya ha pasado" : ""
})
```

Esto **solo** se puede hacer en la capa JavaScript: el HTML no sabe comparar dos campos
entre sí.

## Variante · Una regla de formato en el servidor

En `backend/modelos/Paciente.js`, para que el móvil sean nueve dígitos:

```js
        movilpac: {
            type: String,
            required: true,
            // match es una expresion regular: ^ es el principio, $ el final,
            // \d un digito y {9} exactamente nueve.
            match: [/^\d{9}$/, "El movil tiene que tener nueve digitos"]
        },
```

Tu `XestionPacientes.vue` ya limpia el móvil en el navegador con `sanitizarMobil`. Esto es
la misma regla, pero en la capa que no se puede saltar.

## Qué deberías ver

1. Elige una fecha de ayer: aparece «La fecha no puede ser pasada» en rojo bajo el campo y el botón Guardar se queda desactivado.
2. Con la fecha de hoy o futura, el mensaje desaparece y el botón se activa.
3. El calendario no deja ni seleccionar días anteriores: eso es el `:min`.
4. La petición del Paso 5 responde `400`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El mensaje no aparece nunca | El Paso 1 quedó dentro de otra función, o falta el `v-if` |
| El botón no se desactiva | En el Paso 3 pusiste `errorFecha` sin `.value`: dentro del script hace falta |
| `Cannot access errorFecha before initialization` | El Paso 1 tiene que ir **encima** de `formularioValido`: en JavaScript un `const` no existe antes de su línea |
| El servidor sigue aceptando fechas pasadas | No reiniciaste el backend |
| Ahora no puedo editar una cita antigua | Es lo que dice el apartado «Ojo con esto» |
| El calendario sí deja elegir días pasados | Falta el `:min`, o lo escribiste sin los dos puntos |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Validar en los dos lados | La web por comodidad, el servidor por seguridad |
| `computed` que devuelve un texto | Cadena vacía = sin error; es el patrón habitual |
| `validate` en Mongoose | Una función que devuelve `true` si el valor vale |
| `match` en Mongoose | Validar con una expresión regular |
| `toLocaleDateString("sv-SE")` | `aaaa-mm-dd` en hora local, en una línea |
| `:min` en un `type="date"` | El navegador limita el calendario |

## Guías relacionadas

- [Horas libres del doctor](../mejoras-de-la-clinica/horas-libres.md)
- [Cita duplicada antes de enviar](../pequenas-mejoras/cita-duplicada-antes-de-enviar.md)
- [Apuntes a fondo: formularios y campos](../../detalle/02-formularios-y-campos.md)

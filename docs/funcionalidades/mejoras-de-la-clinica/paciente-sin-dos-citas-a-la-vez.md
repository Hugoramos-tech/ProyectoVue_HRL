# Un paciente no puede tener dos citas a la misma hora

El servidor responde `409` si se intenta dar a un paciente una cita a una fecha y hora en la que ya tiene otra, aunque sea con otro doctor. Las canceladas no cuentan. La web ya enseña ese mensaje en una alerta, sin tocar nada.

**Antes de empezar:** el backend no recarga solo: reinícialo al terminar.

## La idea

Tu `citas.rutas.js` ya tiene una función, `validarRelaciones`, que comprueba que el paciente
y el doctor existan de verdad antes de guardar. Esto es lo mismo pero una regla más: ¿existe
ya una cita de ese DNI, en esa fecha y esa hora, que no esté cancelada?

**El servidor no comprueba hoy ningún solape**, ni del paciente ni del doctor. Así que esta
receta añade la primera regla de ese tipo que tendrá tu API.

Lo bueno: no hay que tocar nada en la web. `guardarCita()` de `Citas.vue` ya pasa el error
por `mensajeError(...)`, que lee `error.response.data.mensaje` y lo enseña en la alerta roja.
Por eso la clave de la respuesta tiene que llamarse **`mensaje`**, como en todo tu backend.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/rutas/citas.rutas.js` | La comprobación al crear y al editar |

## Paso 1 · La función

Busca la línea `// GET /api/citas: filtra por DNI de paciente y doctor, y ordena cronologicamente.` y pega esto **justo encima**:

```js
// Un paciente no puede tener dos citas a la misma fecha y hora, con ningun doctor.
// Las canceladas no ocupan hueco, e idActual deja fuera la propia cita al editar.
// Devuelve "" si esta libre, o el mensaje de error si choca.
async function pacienteLibre(datos, idActual = null) {
    // Sin los tres datos no hay nada que comprobar: de eso ya se ocupa el schema.
    if (!datos.pacienteDNI || !datos.fecha || !datos.hora) {
        return ""
    }

    // Una cita cancelada no ocupa hora.
    if (datos.estado === "cancelada") {
        return ""
    }

    // El filtro de la consulta. Las claves se van anadiendo como en el GET.
    const filtro = {
        // El backend guarda los DNI en mayusculas; se normaliza igual aqui.
        pacienteDNI: String(datos.pacienteDNI).trim().toUpperCase(),
        fecha: datos.fecha,
        hora: datos.hora,
        // $ne = "distinto de": solo cuentan las que NO estan canceladas.
        estado: { $ne: "cancelada" }
    }

    // Al editar hay que dejar fuera la propia cita, o chocaria consigo misma.
    if (idActual) {
        filtro._id = { $ne: idActual }
    }

    // exists devuelve un objeto si hay AL MENOS una que cumpla el filtro, y null si no hay ninguna.
    // Es mas rapido que find porque no trae los documentos, solo mira si existen.
    if (await Cita.exists(filtro)) {
        return "El paciente ya tiene una cita a esa fecha y hora"
    }

    return ""
}
```

Devuelve un **texto** en vez de `true`/`false` a propósito: es el mismo estilo que
`validarRelaciones`, que ya está en ese fichero. Así las dos se usan igual.

## Paso 2 · Al crear

Busca la línea `        const cita = await Cita.create(datos)` y pega esto **justo encima**:

```js
        // datos ya viene filtrado por datosPermitidos() y normalizado por validarRelaciones().
        // 409 Conflict: la peticion es correcta, pero choca con un dato que ya existe.
        const errorOcupado = await pacienteLibre(datos)
        if (errorOcupado) {
            return res.status(409).json({ mensaje: errorOcupado })
        }

```

Va **después** de `validarRelaciones`, no antes: así el DNI ya está en mayúsculas cuando se
hace la consulta.

## Paso 3 · Al editar

Al editar, la petición puede traer solo la hora nueva. Hay que comprobar **cómo quedaría la
cita**, no solo lo que llega, así que primero hay que leer la que ya existe.

Busca la línea `        const cita = await Cita.findByIdAndUpdate(` y pega esto **justo encima**:

```js
        // La cita tal como esta ahora en la base de datos.
        const citaActual = await Cita.findById(req.params.id).lean()
        if (!citaActual) {
            return res.status(404).json({ mensaje: "Cita no encontrada" })
        }

        // Los datos nuevos se ponen ENCIMA de los viejos: asi se comprueba el resultado
        // final, aunque la peticion solo traiga la hora. El orden importa.
        const errorOcupado = await pacienteLibre({ ...citaActual, ...datos }, req.params.id)
        if (errorOcupado) {
            return res.status(409).json({ mensaje: errorOcupado })
        }

```

## Paso 4 · Probarlo

**Reinicia el backend.** Luego, en la consola de F12 con la web abierta, crea dos citas del
mismo paciente a la misma hora con doctores distintos. La segunda tiene que dar `409`.

Desde la propia web es más rápido: selecciona un paciente, elige un doctor, crea una cita a
las 10:00. Vuelve a doctores, selecciona **otro** doctor, y crea otra cita para el mismo
paciente a la misma fecha y hora. Sale la alerta roja con el mensaje.

## Variante · Lo mismo para el doctor

La misma función, cambiando el campo que se filtra:

```js
async function doctorLibre(datos, idActual = null) {
    if (!datos.doctorId || !datos.fecha || !datos.hora || datos.estado === "cancelada") {
        return ""
    }

    const filtro = {
        doctorId: datos.doctorId,
        fecha: datos.fecha,
        hora: datos.hora,
        estado: { $ne: "cancelada" }
    }

    if (idActual) {
        filtro._id = { $ne: idActual }
    }

    if (await Cita.exists(filtro)) {
        return "El doctor ya tiene una cita a esa fecha y hora"
    }

    return ""
}
```

Se llama igual que la otra, en los mismos dos sitios. Con las dos puestas, la agenda queda
coherente por los dos lados, que es lo que pediría un enunciado de «mejoras de la clínica».

## Variante · Con un índice único, sin código

MongoDB puede garantizarlo por sí solo, en `backend/modelos/Cita.js`, al final del schema:

```js
// Un indice compuesto unique: MongoDB rechaza el duplicado antes de escribirlo.
CitaSchema.index({ pacienteDNI: 1, fecha: 1, hora: 1 }, { unique: true });
```

Entonces el duplicado llega al `catch` como error `11000`, y se traduce añadiendo esto a los
dos `catch`:

```js
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: "El paciente ya tiene una cita a esa fecha y hora" })
        }
```

Es más corto y no se puede saltar, pero **también bloquea las canceladas**: una cita
cancelada seguiría ocupando ese hueco para siempre. Para una clínica, la versión con la
función es mejor; para un examen que pida «garantizarlo en la base de datos», el índice es
la respuesta. Está en [índice único](../backend/indice-unico.md).

## Qué deberías ver

1. Dos citas del mismo paciente a la misma hora con doctores distintos: la segunda da `409`.
2. En la web, el texto sale en la alerta roja al guardar.
3. Con otra hora, o si una de las dos está cancelada, se crea sin problema.
4. Editar una cita **sin** cambiarle la hora no da error contra sí misma.
5. Cambiar solo el estado de una cita a «realizada» sigue funcionando.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Deja crear las dos | No reiniciaste el backend |
| Una cita choca consigo misma al editar | Falta el segundo argumento `req.params.id` en la llamada del Paso 3 |
| Al editar solo el estado, da 409 | El orden de `{ ...citaActual, ...datos }` está invertido: lo nuevo va a la derecha |
| Con el DNI en minúsculas no lo detecta | Falta `.toUpperCase()` en el filtro |
| `pacienteLibre is not defined` | El Paso 1 quedó dentro de otra función, o debajo de donde se usa |
| `Cita.exists is not a function` | Está mal escrito: es `exists`, no `exist` |
| Ahora no deja crear ninguna cita | El `$ne: "cancelada"` tiene que ir en `estado`, no en `fecha` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Código `409` | Conflicto: el dato choca con otro que ya existe |
| `Model.exists` | Preguntar si hay algún documento que cumpla un filtro, sin traerlo |
| `$ne` | «Distinto de», dentro de un filtro de MongoDB |
| `{ ...viejo, ...nuevo }` | Juntar dos objetos; el de la derecha gana |
| Índice `unique` compuesto | Que MongoDB garantice la regla sin escribir código |

## Guías relacionadas

- [Índice único](../backend/indice-unico.md)
- [Límite de citas por día](../backend/limite-por-dia.md)
- [Horas libres del doctor](horas-libres.md)
- [Cita duplicada antes de enviar](../pequenas-mejoras/cita-duplicada-antes-de-enviar.md)

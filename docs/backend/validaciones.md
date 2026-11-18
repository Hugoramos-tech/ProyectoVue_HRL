# Qué valida el servidor

**No hay un fichero de validaciones compartido.** Cada regla está escrita donde se usa: unas
en el schema del modelo, otras como un `if` dentro de la ruta. Saber cuál va dónde es la
parte importante.

| Tipo de regla | Dónde va | Por qué |
|---|---|---|
| Solo mira el valor del campo | En el **schema** (`required`, `match`, `enum`, `min`, `validate`) | Mongoose la aplica sola, al crear y al modificar |
| Necesita consultar la colección | En la **ruta** (un `findOne`, un `exists`, un `countDocuments`) | Un `validate` del schema no puede hacer consultas |

## Lo que hay hoy en los schemas

Solo `required`, y nada más:

| Modelo | Obligatorios | Opcionales |
|---|---|---|
| `Paciente` | `nomepac`, `dnipac`, `apelpac`, `movilpac`, `lopdpac` | `nacipac`, `mailpac`, `dirpac`, `propac`, `munipac` |
| `Doctor` | `nomedoc`, `apeldoc`, `coledoc`, `movildoc`, `espedoc` | `maildoc` |
| `Cita` | `pacienteDNI`, `doctorId`, `fecha`, `hora`, `motivo` | `observacions` (`default: ""`), `estado` (`default: "pendente"`) |

Si falta uno de los obligatorios, Mongoose lanza un `ValidationError` y las rutas lo
traducen a **`400`** con el mensaje que trae el propio error.

**Ningún campo tiene `unique`**, ni `match`, ni `enum`. Las comprobaciones de formato están
en las rutas.

## Lo que hay en las rutas

**Formato del móvil**, en pacientes y en doctores, al crear y al modificar:

```js
        // Formato nacional: empieza por 6 o 7 y suma nueve digitos en total.
        if (!/^[67]\d{8}$/.test(movilpac)) {
            return res.status(400).json({
                mensaje: "El móvil debe empezar por 6 o 7 y tener 9 dígitos"
            });
        }
```

**DNI único**, en pacientes, con una consulta:

```js
        const pacienteDuplicado = await Paciente.findOne({ dnipac });
        if (pacienteDuplicado) {
            return res.status(409).json({ mensaje: "Ya existe un paciente con ese DNI" });
        }
```

**Normalización**, antes de guardar: el DNI a mayúsculas y sin espacios, el móvil sin
espacios. Por eso todos los DNI de la base de datos están en mayúsculas, y por eso al
compararlos hay que normalizar los dos lados.

**Referencias que existen**, en citas, con `validarRelaciones`:

```js
    if (datos.pacienteDNI) {
        datos.pacienteDNI = String(datos.pacienteDNI).trim().toUpperCase()
        if (!(await Paciente.exists({ dnipac: datos.pacienteDNI }))) {
            return "El paciente seleccionado no existe"
        }
    }
    if (datos.doctorId && !(await Doctor.exists({ _id: datos.doctorId }))) {
        return "El doctor seleccionado no existe"
    }
```

**MongoDB no tiene claves ajenas**, así que la integridad referencial se comprueba aquí a
mano. Eso es una respuesta de examen en sí misma: en una base de datos relacional lo haría la
propia base de datos.

**Lista blanca de campos**, en citas, con `datosPermitidos(body)`: solo pasan las siete
propiedades de `camposCita`. Cualquier otra se descarta antes de llegar al modelo, así que
nadie puede colar campos arbitrarios desde una petición.

**Conexión viva**, en `server.js`, con el middleware `requireDatabase`:

```js
function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ mensaje: "La base de datos no está disponible." });
  }
  next();
}
```

`readyState === 1` significa «conectado». Las tres rutas de datos pasan por él; los dos
catálogos JSON, no.

## Lo que valida la web y el servidor NO

La web es más estricta que el servidor en varias cosas, y eso significa que **la API acepta
datos que el formulario nunca dejaría pasar**:

| Regla | En la web | En el servidor |
|---|---|---|
| Letra de control del DNI | `esDniCorrecto()` | **No** |
| Formato del correo | `validarMail()` | **No** |
| Fecha que exista de verdad | El `type="date"` | **No**: `2026-02-31` se guardaría |
| Fecha no pasada | No | **No** |
| Dos citas a la misma hora | No | **No** |
| `lopdpac` aceptado | El `:disabled` del botón | Solo `required`, da igual el valor |

Esa columna de la derecha es la lista de cosas que pueden pedirte añadir, y la respuesta a
«¿por qué validar también en el servidor?»: porque la API se puede llamar sin pasar por la
web, y entonces nada de la columna izquierda existe.

## Cómo añadir una regla

- Al schema, si solo mira el valor: [validación nueva](../guias/validacion-nueva.md)
- A la ruta, si hay que consultar la colección: [paciente sin dos citas a la vez](../funcionalidades/mejoras-de-la-clinica/paciente-sin-dos-citas-a-la-vez.md)
- Con un índice de MongoDB, para que lo garantice la base de datos: [índice único](../funcionalidades/backend/indice-unico.md)
- Las tres capas explicadas: [validaciones](../funcionalidades/validacion/validaciones.md)

Y siempre: **reinicia el backend** después de tocarlo.

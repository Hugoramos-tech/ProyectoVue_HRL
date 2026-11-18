# Validación nueva

Hay **tres capas** y la pregunta es siempre la misma: ¿se puede saltar?

| Capa | Dónde | Qué aporta | ¿Se puede saltar? |
|---|---|---|---|
| HTML | `required`, `pattern`, `min`, `max`, `maxlength`, `type="email"` en el `<input>` | El navegador avisa sin escribir JavaScript | Sí, con F12 |
| JavaScript | Un `computed` o una función en el componente | Mensajes a medida y reglas que cruzan campos | Sí, llamando a la API |
| Servidor | `required`, `match`, `validate` en `backend/modelos/`, o un `if` en la ruta | La única que no se puede saltar | **No** |

Lo correcto es poner la regla en **la web y en el servidor**: la web por comodidad, el
servidor por seguridad. Y saber decir por qué.

## En la web

**Normalizar al salir del campo** (`@blur`):

```js
function sanitizarDni() {
  novoPaciente.dnipac = novoPaciente.dnipac.trim().toUpperCase();
}
```

**Impedir caracteres en cada tecla** (`@input`):

```vue
            @input="novoPaciente.movilpac = novoPaciente.movilpac.replace(/\D/g, '')"
```

**Un error con mensaje.** El patrón de este proyecto: un `computed` que devuelve texto, y la
cadena vacía significa «sin error».

```js
const errorFecha = computed(() => {
  const hoy = new Date().toLocaleDateString("sv-SE")
  return cita.fecha && cita.fecha < hoy ? "La fecha no puede ser pasada" : ""
})
```

```vue
            <p v-if="errorFecha" class="erro-campo">{{ errorFecha }}</p>
```

**Y el botón**, con `Boolean(...)` para convertir el texto en `true` o `false`:

```vue
          :disabled="Boolean(errorFecha)"
```

Sin el `Boolean(...)`, `:disabled` recibe `""` y HTML lo trata de forma inconsistente.

## En el servidor

**En el schema**, cuando la regla solo mira el valor:

```js
        movilpac: {
            type: String,
            required: true,
            // ^ principio, $ final, \d un digito, {8} ocho veces
            match: [/^[67]\d{8}$/, "El movil debe empezar por 6 o 7 y tener 9 digitos"]
        },
```

```js
        fecha: {
            type: String,
            required: true,
            validate: {
                // Tiene que devolver true si el valor VALE
                validator: (valor) => valor >= new Date().toLocaleDateString("sv-SE"),
                message: "La fecha no puede ser pasada"
            }
        },
```

**En la ruta**, cuando hay que consultar la base de datos: duplicados, solapes, límites.

```js
        const duplicado = await Paciente.findOne({ dnipac })
        if (duplicado) {
            return res.status(409).json({ mensaje: "Ya existe un paciente con ese DNI" })
        }
```

Esa distinción es lo que preguntan: **una regla que solo mira el valor va en el schema; una
que necesita preguntarle a la colección va en la ruta.** Un `validate` no puede comprobar un
duplicado.

**Reinicia el backend** después de tocarlo.

## Las dos cosas que se olvidan

**1. La clave de la respuesta se llama `mensaje`.** Todo tu backend la usa así, y todos tus
componentes la leen con `mensajeError(...)` o `mensaxeDoErro(...)`:

```js
function mensajeError(error, porDefecto) {
  return error?.response?.data?.mensaje ?? porDefecto
}
```

Si en una ruta nueva pones `{ error: "..." }`, el texto no sale en la alerta y verás el
mensaje genérico. Es un fallo de cinco segundos que cuesta media hora encontrar.

**2. Al editar, deja fuera el propio registro.** Si no, guardar sin cambiar nada da «ya
existe». En el servidor se hace con `$ne`:

```js
        const otro = await Paciente.findOne({ movilpac, dnipac: { $ne: req.params.dni } })
```

En el cliente, comparando con el identificador original. Ese detalle es lo que distingue un
control de duplicados bien hecho de uno que molesta.

## Los códigos

| Código | Cuándo |
|---|---|
| `400` | Los datos no valen: falla un `required`, un `match` o un `validate` |
| `404` | El DNI o el id no existe |
| `409` | Conflicto: un valor repetido, un solape de horas |
| `503` | No hay base de datos; lo pone `requireDatabase` de `server.js` |

## Cómo demostrar que el servidor la aplica

Con la web abierta, en la consola de F12:

```js
await fetch("http://localhost:3000/api/citas", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ pacienteDNI: "12345678Z", doctorId: "000000000000000000000000", fecha: "2020-01-01", hora: "10:00", motivo: "prueba" }),
}).then((r) => r.status)
```

Antes de poner la regla en el servidor responde `201`. Después, `400`. Eso es la prueba de
que la validación no depende de la web, y es exactamente lo que piden cuando dicen «¿y si
alguien llama a la API directamente?».

## Receta completa

- [Validaciones](../funcionalidades/validacion/validaciones.md)
- [Apuntes a fondo: formularios y campos](../detalle/02-formularios-y-campos.md), apartados 9 y 10
- [Móvil repetido](../funcionalidades/pequenas-mejoras/movil-repetido.md)
- [Horario del doctor](../funcionalidades/pequenas-mejoras/horario-del-doctor.md)
- [Un paciente no puede tener dos citas a la vez](../funcionalidades/mejoras-de-la-clinica/paciente-sin-dos-citas-a-la-vez.md)

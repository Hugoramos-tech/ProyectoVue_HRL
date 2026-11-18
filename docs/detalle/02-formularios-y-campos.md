# Formularios y campos

[← Anterior: listas y filtros](01-listas-filtros-y-busqueda.md) · [Índice](README.md) · [Siguiente: rutas y componentes →](03-rutas-y-componentes.md)

Todo lo que pueden pedirte sobre **un formulario**: un campo nuevo, un desplegable, un número, un sí o no, desplegables en cascada, un valor calculado, validaciones y baja lógica. Sin salir de esta página.

## En esta página

1. [Cómo está montado un formulario](#1-cómo-está-montado-un-formulario)
2. [Lo que necesitas saber](#2-lo-que-necesitas-saber)
3. [Campo de texto nuevo](#3-campo-de-texto-nuevo)
4. [Desplegable con valores fijos](#4-desplegable-con-valores-fijos)
5. [Número, sí o no, y fecha](#5-número-sí-o-no-y-fecha)
6. [Provincia y municipio en cascada](#6-provincia-y-municipio-en-cascada)
7. [Un valor calculado: la edad](#7-un-valor-calculado-la-edad)
8. [Dar de baja sin borrar](#8-dar-de-baja-sin-borrar)
9. [Validar mientras se escribe](#9-validar-mientras-se-escribe)
10. [Validar en el servidor](#10-validar-en-el-servidor)
11. [Si te piden esto, mira aquí](#11-si-te-piden-esto-mira-aquí)
12. [Fallos que quitan puntos](#12-fallos-que-quitan-puntos)
13. [Recetas cortas](#13-recetas-cortas)

## 1. Cómo está montado un formulario

Los tres formularios (pacientes, doctores, citas) siguen el mismo patrón. Si entiendes uno,
entiendes los tres. **No hay componentes de formulario reutilizables**: cada `<label>` y cada
`<input>` están escritos a mano, con las clases de `src/style.css`.

| Pieza | Pacientes | Doctores | Citas |
|---|---|---|---|
| El objeto del formulario | `novoPaciente` (`reactive`) | `novoDoctor` (`reactive`) | `cita` (`reactive`) |
| El molde vacío | Las claves de `novoPaciente` | `doctorVacio()` | Las claves de `cita` |
| Vaciarlo | `limpiaFormpac()` | `limparFormulario()` | `limpiarFormulario()` |
| Modo edición | `editando` (`ref`) | `editando` (`ref`) | `editando` (`ref`) |
| Guardar | `guardarPaciente()` | `guardarDoctor()` | `guardarCita()` |
| El schema | `backend/modelos/Paciente.js` | `Doctor.js` | `Cita.js` |

Dos formas distintas de vaciar el formulario, y las dos son automáticas:

```js
// Pacientes: recorre las claves y las pone a "" o a false segun su tipo.
Object.keys(novoPaciente).forEach((key) => { ... })

// Doctores: sustituye el contenido por el del molde.
Object.assign(novoDoctor, doctorVacio())
```

**Las dos tienen la misma consecuencia práctica:** en cuanto añadas un campo al objeto del
formulario, se vacía solo. No hay que tocar la función de limpiar.

### El camino de un campo nuevo

1. Está en el **schema** de Mongoose, o el servidor lo ignora al guardar.
2. Está en el **objeto del formulario**, o al editar sale vacío.
3. Tiene su **`<input>`** con `v-model`.
4. Tiene su **`<th>` y su `<td>`**, si debe verse en la tabla.
5. Está en **`cabeceras` y `filas`** de la función del PDF, si debe salir ahí.

Si falta uno de los cinco, falla de una forma distinta cada vez. La tabla está en el
apartado [12](#12-fallos-que-quitan-puntos).

## 2. Lo que necesitas saber

**`reactive`**: un objeto vigilado **entero**. Se usa **sin** `.value`: `novoPaciente.nomepac`.
Es lo que se usa para los formularios, porque son objetos con muchos campos.

**`ref`**: un valor suelto vigilado. Se lee y escribe con `.value` en el script. Es lo que se
usa para `editando`, `cargando`, las listas y los filtros.

**La regla:** objeto de formulario → `reactive`. Todo lo demás → `ref`.

**No sustituyas un `reactive`.** `novoPaciente = {...}` rompe la reactividad: la pantalla deja
de enterarse de los cambios. Hay que escribir **dentro**: `Object.assign(novoPaciente, otro)`,
o campo a campo.

**`v-model` según el campo**:

| Campo | Qué guarda |
|---|---|
| `type="text"` | El texto |
| `type="text"` con `v-model.trim` | El texto sin espacios en los extremos |
| `<select>` | El `:value` de la opción elegida, no el texto que se ve |
| `type="checkbox"` | `true` o `false` |
| `type="radio"` | El `value` del que esté marcado |
| `type="number"` | Un **texto**, salvo con `v-model.number` |
| `type="date"` | Un texto `aaaa-mm-dd` |
| `type="time"` | Un texto `hh:mm` |

**`watch`**: ejecuta algo cuando cambia un dato. Para vigilar una propiedad de un `reactive`
hay que pasarle una función: `watch(() => novoPaciente.propac, ...)`. Con
`watch(novoPaciente.propac, ...)` se vigilaría el texto que había en ese momento, y nunca
volvería a saltar.

**Schema de Mongoose**: la forma del documento. **Un campo que no está en el schema no se
guarda**, aunque lo envíes y aunque la petición responda `201`.

## 3. Campo de texto nuevo

Ejemplo: `alergiaspac`, opcional, en pacientes.

**El schema** (`backend/modelos/Paciente.js`):

```js
        // default: "" para que los pacientes que ya existian no den error al editarlos.
        alergiaspac: { type: String, trim: true, default: "" },
```

**Reinicia el backend.**

**El objeto del formulario** (`XestionPacientes.vue`, dentro de `novoPaciente`):

```js
  alergiaspac: "",
```

**El `<input>`:**

```vue
        <div class="campo">
          <label for="pac-alergias">Alergias:</label>
          <input id="pac-alergias" v-model="novoPaciente.alergiaspac" type="text">
        </div>
```

**La columna** (dos cambios, misma posición):

```vue
            <th>Alergias</th>
```

```vue
            <td>{{ u.alergiaspac || "—" }}</td>
```

**El PDF**, dentro de `exportarPacientes()`: una entrada más en `cabeceras` y otra en cada
fila de `filas`. **Tienen que tener el mismo número de elementos** o la tabla sale desplazada.

Receta completa: [campo nuevo](../funcionalidades/datos/campo-nuevo.md).

## 4. Desplegable con valores fijos

```js
        // enum limita los valores admitidos; cualquier otro da un 400.
        // El "" tiene que estar, o la opcion "Sin especificar" daria error.
        grupopac: { type: String, enum: ["A", "B", "AB", "0", ""], default: "" },
```

```vue
        <div class="campo">
          <label for="pac-grupo">Grupo sanguíneo:</label>
          <select id="pac-grupo" v-model="novoPaciente.grupopac">
            <option value="">Sin especificar</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="0">0</option>
          </select>
        </div>
```

### Desplegable desde el servidor

Es lo que ya hace tu proyecto con las especialidades y las provincias:

```js
const especialidades = ref([])

// Una llamada suelta en el script setup: se ejecuta al crear el componente.
obtenerEspecialidades()
  .then((lista) => (especialidades.value = lista))
  .catch(() => (especialidades.value = []))
```

```vue
          <select id="doc-espe" v-model="novoDoctor.espedoc" :disabled="especialidades.length === 0">
            <option value="">Elige una especialidad</option>
            <option v-for="e in especialidades" :key="e.id" :value="e.nm">{{ e.nm }}</option>
          </select>
```

El `:disabled` mientras la lista está vacía es un detalle que se agradece: evita que alguien
abra un desplegable vacío y crea que está roto.

## 5. Número, sí o no, y fecha

**Número:**

```js
        pesopac: { type: Number, min: 0, max: 400, default: null },
```

```vue
          <input id="pac-peso" v-model.number="novoPaciente.pesopac" type="number" min="0" step="0.1">
```

**El `.number` no es opcional.** Sin él llega el texto `"70"`, y Mongoose lo convierte… hasta
que alguien escribe algo raro y sale un `CastError`. Además, `"70" + 5` da `"705"`.

**Sí o no:**

```js
        privadopac: { type: Boolean, default: false },
```

```vue
          <input id="pac-privado" v-model="novoPaciente.privadopac" type="checkbox">
```

En la tabla: `{{ u.privadopac ? "Sí" : "No" }}`. Tu `lopdpac` funciona exactamente así.

**Radio** (una opción de varias), como el `coledoc` de doctores:

```vue
            <label><input v-model="novoDoctor.coledoc" type="radio" value="SI" required> Sí</label>
            <label><input v-model="novoDoctor.coledoc" type="radio" value="NO" required> No</label>
```

Los dos `<input>` tienen el **mismo `v-model`**: eso es lo que los hace excluyentes.

**Fecha:**

```js
        // String, no Date: aaaa-mm-dd se ordena y compara bien como texto,
        // y es exactamente lo que da y espera un <input type="date">.
        nacipac: { type: String },
```

```vue
          <input id="pac-naci" v-model="novoPaciente.nacipac" type="date" :max="hoyTexto">
```

Guardar las fechas como texto es una decisión de este proyecto, y tiene sentido: así no hay
conversiones ni problemas de zona horaria en ningún punto del camino.

## 6. Provincia y municipio en cascada

Ya está hecho en tu proyecto: es el modelo a seguir para cualquier par de desplegables
dependientes.

```js
const provincias = ref([])
const municipios = ref([])

// Al elegir provincia se piden sus municipios y se vacia el municipio anterior.
async function cargarMunicipios() {
  // Vaciar PRIMERO: si no, queda un municipio de la provincia vieja.
  // Es el paso que casi todo el mundo olvida.
  novoPaciente.munipac = ""
  municipios.value = []

  if (!novoPaciente.propac) {
    return
  }

  const provincia = provincias.value.find((p) => p.nm === novoPaciente.propac)
  if (!provincia) {
    return
  }

  municipios.value = await obtenerMunicipios(provincia.id)
}
```

```vue
          <select id="pac-pro" v-model="novoPaciente.propac" @change="cargarMunicipios">
            <option value="">Elige provincia</option>
            <option v-for="p in provincias" :key="p.id" :value="p.nm">{{ p.nm }}</option>
          </select>
```

```vue
          <select id="pac-muni" v-model="novoPaciente.munipac" :disabled="municipios.length === 0">
            <option value="">Elige municipio</option>
            <option v-for="m in municipios" :key="m.id" :value="m.nm">{{ m.nm }}</option>
          </select>
```

**Lo esencial de una cascada**, y lo que preguntan: al cambiar el primero hay que **vaciar el
segundo**. Si no, el formulario puede enviar un municipio que no pertenece a la provincia
elegida, y nada avisa.

**Y el detalle del modo edición:** al cargar un paciente para editarlo hay que llamar a
`cargarMunicipios()` después de copiar sus datos, o el desplegable de municipio sale vacío
aunque el paciente tenga uno. En tu `buscarPaciente()` ese `await cargarMunicipios()` está
puesto justo por eso.

Lo mismo con `@change="cargarMunicipios"` en vez de un `watch`: funcionan igual. El `watch`
salta también cuando el valor cambia desde el código; el `@change` solo cuando lo cambia el
usuario. Para una cascada en edición, eso importa.

## 7. Un valor calculado: la edad

Un dato que **no se guarda**: se calcula al pintarlo.

```js
// "2000-05-10" -> 25. Devuelve null si no hay fecha.
export function calcularEdad(fecha) {
  if (!fecha) {
    return null
  }

  const [anyo, mes, dia] = String(fecha).split("-").map(Number)
  const hoy = new Date()

  let edad = hoy.getFullYear() - anyo
  // getMonth() cuenta desde 0 (enero es 0), de ahi el +1.
  const mesActual = hoy.getMonth() + 1
  // Si este anyo todavia no ha cumplido, se le resta uno.
  if (mesActual < mes || (mesActual === mes && hoy.getDate() < dia)) {
    edad--
  }

  return edad
}
```

Ese ajuste del mes y el día es lo que diferencia una edad correcta de una restada a ojo. Sin
él, alguien nacido en diciembre aparece un año mayor durante once meses.

En la tabla: `<td>{{ calcularEdad(u.nacipac) ?? "—" }}</td>`.

**Por qué no se guarda:** un dato calculado que se guarda queda desactualizado al día
siguiente del cumpleaños. La regla general: **si se puede deducir de otro dato, no se guarda**.

### Un campo condicional

```js
// Hace falta anadir computed al import de Vue de XestionPacientes.vue.
const esMenor = computed(() => {
  const edad = calcularEdad(novoPaciente.nacipac)
  return edad !== null && edad < 18
})
```

```vue
        <div v-if="esMenor" class="campo">
          <label for="pac-tutor">Tutor legal:</label>
          <input id="pac-tutor" v-model="novoPaciente.tutorpac" type="text" required>
        </div>
```

**`v-if` y no `v-show`**: con `v-show` el `<input required>` seguiría existiendo, oculto, y
bloquearía el envío del formulario para los adultos. Es exactamente el tipo de pregunta de
«¿cuál usarías y por qué?».

Y en el `:disabled` del botón, una condición más:
`|| (esMenor && !novoPaciente.tutorpac.trim())`.

Receta completa: [tutor si es menor](../funcionalidades/pequenas-mejoras/tutor-si-es-menor.md).

## 8. Dar de baja sin borrar

Baja lógica: el registro se queda, marcado.

```js
        // false = activo. Se llama "baja" y no "activo" para que el default sea el caso normal.
        bajapac: { type: Boolean, default: false },
```

En la tabla, un botón que cambia la marca en lugar de borrar:

```js
async function alternarBaja(paciente) {
  const texto = paciente.bajapac
    ? `¿Reactivar a ${paciente.nomepac}?`
    : `¿Dar de baja a ${paciente.nomepac}? No se borra: deja de aparecer en Citas.`

  const confirmacion = await alertaConfirmacion(texto, "Cambiar estado")
  if (!confirmacion.isConfirmed) {
    return
  }

  // Solo se manda el campo que cambia: el PUT acepta cambios parciales.
  await modifyPaciente(paciente.dnipac, { bajapac: !paciente.bajapac })
  await cargarPacientes()
}
```

Y donde no deban aparecer, un filtro: `pacientes.value.filter((p) => !p.bajapac)`.

**Cuándo tiene sentido:** cuando hay datos que dependen de ese registro. Borrar un paciente
deja sus citas apuntando a un DNI que ya no existe. Darlo de baja no rompe nada, y se puede
deshacer. La otra salida es el
[borrado en cascada](../funcionalidades/backend/borrado-en-cascada.md): borrar también sus
citas. Las dos son respuestas válidas; lo que importa es saber **por qué** eliges una.

## 9. Validar mientras se escribe

El patrón de este proyecto: una función por campo, y un `computed` o una función que decide
si hay error.

**Al salir del campo** (`@blur`), para normalizar:

```js
function sanitizarDni() {
  novoPaciente.dnipac = novoPaciente.dnipac.trim().toUpperCase()
}
```

**En cada tecla** (`@input`), para impedir caracteres:

```vue
            @input="novoPaciente.movilpac = novoPaciente.movilpac.replace(/\D/g, '')"
```

**Un error con mensaje** (`computed` que devuelve texto; cadena vacía = sin error):

```js
const errorFecha = computed(() => {
  const hoy = new Date().toLocaleDateString("sv-SE")
  return cita.fecha && cita.fecha < hoy ? "La fecha no puede ser pasada" : ""
})
```

```vue
            <p v-if="errorFecha" class="erro-campo">{{ errorFecha }}</p>
```

**Y el botón**, con `Boolean(...)`:

```vue
          :disabled="Boolean(errorFecha)"
```

El `Boolean(...)` convierte el texto en `true`/`false`. Sin él, `:disabled` recibe `""`, que
HTML trata de forma inconsistente.

**La regla de oro de los duplicados:** al editar hay que dejar fuera el propio registro.

```js
  // Sin el segundo trozo, guardar un paciente sin cambiarle nada daria "DNI repetido".
  const repetido = pacientes.value.some(
    (p) => p.dnipac === novoPaciente.dnipac && (!editando.value || p.dnipac !== dniOriginal)
  )
```

En el servidor es lo mismo con `$ne`. Es el detalle que más distingue un control de
duplicados bien hecho.

### Lo que ya tiene tu proyecto

| Función | En | Qué hace |
|---|---|---|
| `esDniCorrecto()` | Pacientes | Formato y letra de control calculada |
| `dniDuplicado()` | Pacientes | Busca el DNI en la lista cargada |
| `validarMail()` | Pacientes | Expresión regular del correo |
| `sanitizarDni/Nome/Apellidos/Mobil/Mail` | Pacientes | Normalizan al salir del campo |
| `capitalizarNome()` | Pacientes y doctores | «juan lópez» → «Juan López» |
| `hayError(campo)` | Pacientes | Decide si pintar el campo en rojo |
| `mobilInvalido`, `mailInvalido` | Doctores | `computed` de validación |
| `formularioValido` | Citas | Habilita el botón Guardar |

Antes de escribir una validación, mira si ya está: casi siempre hay una parecida que copiar.

## 10. Validar en el servidor

**Las tres capas**, y la pregunta de examen es siempre la misma: ¿se puede saltar?

| Capa | Dónde | ¿Se puede saltar? |
|---|---|---|
| HTML | `required`, `pattern`, `min`, `max` en el `<input>` | Sí, con F12 |
| JavaScript | `computed` y funciones en el componente | Sí, llamando a la API |
| Servidor | `backend/modelos/` y `backend/rutas/` | **No** |

**En el schema:**

```js
        movilpac: {
            type: String,
            required: true,
            // ^ principio, $ final, \d un digito, {8} ocho veces.
            match: [/^[67]\d{8}$/, "El movil debe empezar por 6 o 7 y tener 9 digitos"]
        },
```

```js
        fecha: {
            type: String,
            required: true,
            // validate con una funcion: devuelve true si el valor VALE.
            validate: {
                validator: (valor) => valor >= new Date().toLocaleDateString("sv-SE"),
                message: "La fecha no puede ser pasada"
            }
        },
```

**En la ruta**, cuando hace falta consultar la base de datos:

```js
        // Un duplicado no se puede comprobar con una regla del schema:
        // hay que preguntarle a la coleccion.
        const duplicado = await Paciente.findOne({ dnipac })
        if (duplicado) {
            return res.status(409).json({ mensaje: "Ya existe un paciente con ese DNI" })
        }
```

**Los códigos, y cuándo usar cada uno:**

| Código | Significa | En tu proyecto |
|---|---|---|
| `201` | Creado | Un `POST` que sale bien |
| `400` | Datos mal | Falla un `required`, un `match` o un `validate` |
| `404` | No existe | Un DNI o un id que no está |
| `409` | Conflicto | Un DNI repetido, un solape |
| `500` | Error del servidor | Algo se rompió |
| `503` | Sin base de datos | `requireDatabase` cuando Mongo no responde |

**La clave de la respuesta se llama `mensaje`.** Todo tu backend la usa así, y todos tus
componentes la leen con `mensajeError(...)` / `mensaxeDoErro(...)`:

```js
function mensajeError(error, porDefecto) {
  return error?.response?.data?.mensaje ?? porDefecto
}
```

Si en una ruta nueva pones `{ error: "..." }` en vez de `{ mensaje: "..." }`, el texto no sale
en la alerta y verás el mensaje genérico. Es un fallo de cinco segundos que cuesta media hora
encontrar.

Y siempre: **reinicia el backend** después de tocarlo.

## 11. Si te piden esto, mira aquí

| El enunciado dice | Apartado |
|---|---|
| «añade un campo X» | [3](#3-campo-de-texto-nuevo) |
| «un desplegable con…» | [4](#4-desplegable-con-valores-fijos) |
| «un número», «una casilla» | [5](#5-número-sí-o-no-y-fecha) |
| «al elegir A, que B solo muestre…» | [6](#6-provincia-y-municipio-en-cascada) |
| «la edad», «un dato calculado» | [7](#7-un-valor-calculado-la-edad) |
| «sin borrarlo», «dar de baja» | [8](#8-dar-de-baja-sin-borrar) |
| «que avise si…», «que no deje guardar» | [9](#9-validar-mientras-se-escribe) |
| «que el servidor lo rechace», «un 400» | [10](#10-validar-en-el-servidor) |
| «que no se repita» | [9](#9-validar-mientras-se-escribe) y [10](#10-validar-en-el-servidor) |

## 12. Fallos que quitan puntos

| Falta… | Síntoma |
|---|---|
| El campo en el schema | Se guarda, parece que va, y al recargar **no está** |
| El campo en el objeto del formulario | Al editar sale vacío |
| Reiniciar el backend | Nada de lo que tocaste en `backend/` hace efecto |
| El `<th>` o el `<td>` | La tabla se descuadra |
| `v-model.number` | Se guarda `"70"` en vez de `70` |
| Vaciar el municipio en la cascada | Se guarda un municipio de otra provincia |
| `cargarMunicipios()` al editar | El desplegable de municipio sale vacío |
| `Boolean(...)` en el `:disabled` | El botón se comporta de forma rara |
| Dejar fuera el propio registro | «DNI repetido» al editarse a sí mismo |
| `computed` en el import de `XestionPacientes.vue` | `computed is not defined` |
| Usar `mensaje` como clave | La alerta enseña el texto genérico |
| `v-if` en vez de `v-show` en un campo `required` | El formulario no se puede enviar nunca |
| No sustituir un `reactive` | Si lo sustituyes, la pantalla deja de actualizarse |

## 13. Recetas cortas

- [Campo nuevo en un modelo](../funcionalidades/datos/campo-nuevo.md)
- [Entidad nueva con CRUD completo](../funcionalidades/datos/entidad-nueva.md)
- [Validaciones](../funcionalidades/validacion/validaciones.md)
- [Tutor si es menor](../funcionalidades/pequenas-mejoras/tutor-si-es-menor.md)
- [Teléfono solo números](../funcionalidades/pequenas-mejoras/telefono-solo-numeros.md)
- [Móvil repetido](../funcionalidades/pequenas-mejoras/movil-repetido.md)
- [DNI con autocarga](../funcionalidades/como-el-profe/dni-autocarga.md)
- [Columna calculada: la edad](../funcionalidades/columnas-y-filtros/columna-calculada.md)
- [Dar de baja a un paciente](../funcionalidades/mejoras-de-la-clinica/dar-de-baja-a-un-paciente.md)
- [Provincia y municipio en cascada](../funcionalidades/columnas-y-filtros/filtro-municipio-en-cascada.md)
- [Especialidad y doctor en la cita](../funcionalidades/mejoras-de-la-clinica/especialidad-y-doctor-en-la-cita.md)

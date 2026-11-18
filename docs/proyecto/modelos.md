# Modelos de datos

Hay **tres** modelos de Mongoose, en `backend/modelos/`. Los nombres de los campos llevan un
sufijo según la entidad (`pac`, `doc`), que es la convención del proyecto.

## Paciente · `backend/modelos/Paciente.js` · colección `pacientes`

| Campo | Tipo | Obligatorio | Qué es |
|---|---|---|---|
| `dnipac` | String | Sí | DNI o CIF. **Es el identificador público**: va en la URL de la API |
| `nomepac` | String | Sí | Nombre |
| `apelpac` | String | Sí | Apellidos |
| `movilpac` | String | Sí | Móvil, 9 dígitos empezando por 6 o 7 |
| `lopdpac` | Boolean | Sí | Si aceptó la política de privacidad |
| `nacipac` | String | No | Fecha de nacimiento, texto `aaaa-mm-dd` |
| `mailpac` | String | No | Correo |
| `dirpac` | String | No | Dirección |
| `propac` | String | No | Provincia, el **nombre**, no el código |
| `munipac` | String | No | Municipio, el **nombre** |

El `dnipac` **no tiene `unique`** en el schema: la unicidad se comprueba a mano en la ruta,
con un `findOne` que devuelve `409`.

La provincia y el municipio se guardan como **texto**, no como referencia a otra colección.
Vienen de `backend/data/municipios.json`, que es un catálogo estático, no una colección de
MongoDB.

## Doctor · `backend/modelos/Doctor.js` · colección `doctores`

| Campo | Tipo | Obligatorio | Qué es |
|---|---|---|---|
| `nomedoc` | String | Sí | Nombre |
| `apeldoc` | String | Sí | Apellidos |
| `coledoc` | String | Sí | Colegiado: `"SI"` o `"NO"` (se elige con dos *radio*) |
| `movildoc` | String | Sí | Móvil |
| `espedoc` | String | Sí | Especialidad, el **nombre** |
| `maildoc` | String | No | Correo |

El doctor **no tiene un identificador propio**: se usa su `_id` de MongoDB. De ahí que sus
rutas sean `/api/doctores/:id` y las del paciente `/api/pacientes/:dni`.

`espedoc` guarda el nombre de la especialidad como texto, de `backend/data/especialidades.json`.

## Cita · `backend/modelos/Cita.js` · colección `citas`

| Campo | Tipo | Obligatorio | Qué es |
|---|---|---|---|
| `pacienteDNI` | String | Sí | El DNI del paciente, **no una referencia** |
| `doctorId` | ObjectId, `ref: "Doctor"` | Sí | El `_id` del doctor, **sí una referencia** |
| `fecha` | String | Sí | Texto `aaaa-mm-dd` |
| `hora` | String | Sí | Texto `hh:mm` |
| `motivo` | String | Sí | Motivo de la consulta |
| `observacions` | String | No | `default: ""` |
| `estado` | String | No | `default: "pendente"`. Valores: `pendente`, `confirmada`, `realizada`, `cancelada` |

**Las dos relaciones son de formas distintas**, y eso es a propósito:

- El paciente por su DNI, porque tiene un identificador natural y público.
- El doctor por su `_id`, con `ref: "Doctor"`, que es lo que permitiría usar `populate`.

Confundirlas es el origen de la mitad de los `404` y los `CastError` de este proyecto.

### Las fechas y las horas son texto

`fecha` y `hora` son `String`, no `Date`. Tres razones:

1. `aaaa-mm-dd` y `hh:mm` **se ordenan y comparan como texto** en orden cronológico, porque
   van de lo más general a lo más concreto. `"2026-11-18" < "2026-12-01"` es cierto.
2. Es exactamente lo que dan y esperan un `<input type="date">` y un `type="time"`: no hay
   que convertir nada en ningún punto del camino.
3. No hay problemas de zona horaria. `new Date("2026-11-18")` se interpreta en UTC y puede
   dar el día anterior; comparar textos nunca falla.

Es un buen ejemplo de una decisión de diseño que se puede justificar, y la pregunta «¿por qué
no `Date`?» tiene respuesta.

### El estado no tiene `enum`

Cualquier texto se guardaría como estado. Las cuatro etiquetas visibles las traduce
`etiquetaEstado()` en `Citas.vue`:

```js
  const etiquetas = {
    pendente: "Pendiente",
    confirmada: "Confirmada",
    realizada: "Realizada",
    cancelada: "Cancelada"
  }
```

Fíjate en que el valor guardado es `pendente` (con «e»): es gallego, y es lo que hay que
escribir en los filtros y en los `<option>`. Lo que se ve es «Pendiente».

## Lo que NO es un modelo

| Catálogo | Dónde está | Cómo se sirve |
|---|---|---|
| Especialidades | `backend/data/especialidades.json` | `GET /api/especialidades`, definida en `server.js` |
| Provincias y municipios | `backend/data/municipios.json` | `GET /api/municipios`, definida en `server.js` |

Los dos son ficheros JSON estáticos: no hay colección, ni schema, ni modelo. Por eso siguen
funcionando con MongoDB apagado, y por eso sus rutas no pasan por `requireDatabase`.

Los dos tienen la misma forma: una lista de `{ id, nm }`, donde `nm` es el nombre. Y los dos
**envuelven la lista en un objeto**: la respuesta es `{ "especialidades": [...] }`, no el
array suelto. De ahí el `.data.especialidades` en `src/api/especialidades.js`.

## Lo que devuelve la API

**Los documentos salen con su `_id` de MongoDB**, tal cual. No hay ningún `toJSON` que lo
renombre a `id`, así que en los componentes se usa `item._id`, no `item.id`.

El `_id` llega a veces como texto y a veces como objeto, según por dónde haya pasado. Al
compararlos, conviene normalizar los dos lados:

```js
String(a._id) === String(b._id)
```

Sin eso, `===` puede dar `false` entre dos identificadores que son el mismo.

## Si hay que añadir algo

- Un campo a uno de los tres modelos: [campo nuevo](../funcionalidades/datos/campo-nuevo.md)
- Una entidad entera, con su colección, rutas, API y pantalla: [entidad nueva](../funcionalidades/datos/entidad-nueva.md)
- Las reglas de validación: [qué valida el servidor](../backend/validaciones.md)

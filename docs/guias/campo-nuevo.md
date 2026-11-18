# Campo nuevo en un formulario

Un campo tiene que existir en **cinco sitios**. Si falta uno, falla de una forma distinta cada vez.

| # | Sitio | Si falta |
|---|---|---|
| 1 | El schema, en `backend/modelos/` | Se envía, el servidor lo **ignora en silencio** y al recargar no está |
| 2 | El objeto del formulario (`novoPaciente`, `doctorVacio()`, `cita`) | Al editar sale vacío |
| 3 | El `<input>` con su `v-model` | No hay dónde escribirlo |
| 4 | El `<th>` y el `<td>` de la tabla | No se ve en la lista |
| 5 | `cabeceras` y `filas` de la función del PDF | No sale en el PDF |

El 1 es el que más despista: Mongoose descarta sin avisar cualquier propiedad que no esté en
el schema, la petición responde `201`, y el dato desaparece al recargar. **Y hay que
reiniciar el backend** después de tocarlo.

## Lo mínimo

```js
// 1. backend/modelos/Paciente.js
        // default: "" para que los pacientes que ya existian no den error al editarlos
        campopac: { type: String, trim: true, default: "" },
```

```js
// 2. XestionPacientes.vue, dentro de novoPaciente
  campopac: "",
```

```vue
<!-- 3. El input -->
        <div class="campo">
          <label for="pac-campo">Etiqueta:</label>
          <input id="pac-campo" v-model="novoPaciente.campopac" type="text">
        </div>
```

```vue
<!-- 4. La columna: las dos cosas, en la misma posicion -->
            <th>Etiqueta</th>
            <td>{{ u.campopac || "—" }}</td>
```

```js
// 5. En exportarPacientes(): una entrada mas en cabeceras y otra en cada fila.
// Tienen que tener el MISMO numero de elementos, o la tabla del PDF sale desplazada.
```

## Lo que NO hay que hacer

**No toques la función de limpiar.** `limpiaFormpac()` recorre las claves de `novoPaciente`,
y `limparFormulario()` de doctores hace `Object.assign(novoDoctor, doctorVacio())`. Las dos
recogen el campo nuevo solas en cuanto está en el paso 2. Por eso están escritas así.

**No sustituyas el objeto del formulario.** Asignarle un objeto nuevo rompe la reactividad:
hay que escribir dentro, campo a campo o con `Object.assign`.

## Según el tipo de campo

| Tipo | En el schema | En el `<input>` |
|---|---|---|
| Texto | `{ type: String, trim: true, default: "" }` | `type="text"` |
| Número | `{ type: Number, min: 0, default: null }` | `type="number"` con **`v-model.number`** |
| Sí o no | `{ type: Boolean, default: false }` | `type="checkbox"` |
| Fecha | `{ type: String }` | `type="date"`, que da `aaaa-mm-dd` |
| Hora | `{ type: String }` | `type="time"`, que da `hh:mm` |
| Lista cerrada | `{ type: String, enum: ["A", "B", ""] }` | `<select>`, con el `""` dentro del `enum` |
| Relación | `{ type: mongoose.Schema.Types.ObjectId, ref: "Otro" }` | `<select>` con los `_id` como `:value` |

El `v-model.number` no es opcional: sin él se guarda el texto `"70"` en vez del número `70`,
y `"70" + 5` da `"705"`.

Las fechas se guardan como `String` a propósito, no como `Date`: `aaaa-mm-dd` se ordena y
compara bien como texto, y es exactamente lo que da un `<input type="date">`.

## Si el campo es obligatorio

Son tres cosas, no una:

1. `required: true` en el schema.
2. `required` en el `<input>`.
3. **Y un problema:** los registros que ya existen no tienen ese campo, así que no se podrán
   editar hasta rellenárselo. Por eso para un campo nuevo casi siempre es mejor `default: ""`
   en el schema y exigirlo solo en el formulario.

## Receta completa

- [Campo nuevo en un modelo](../funcionalidades/datos/campo-nuevo.md), con variantes y la tabla de fallos
- [Apuntes a fondo: formularios y campos](../detalle/02-formularios-y-campos.md)
- [Entidad nueva con CRUD completo](../funcionalidades/datos/entidad-nueva.md), si lo que falta es una tabla entera
- [Validación nueva](validacion-nueva.md)

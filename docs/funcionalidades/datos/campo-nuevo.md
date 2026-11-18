# Campo nuevo en un modelo

Un campo opcional «Alergias» en pacientes: se guarda en la base de datos, sale en el formulario, en la tabla y en el PDF, y se carga al editar.

**Antes de empezar:** arranca el proyecto (`npm start`). El backend no recarga solo: después del Paso 1 tendrás que reiniciarlo.

## La idea

Un campo tiene que existir en **cinco sitios**. Si falta uno, falla de una forma distinta cada vez, y esa es la tabla que conviene llevar en la cabeza:

| Sitio | Si falta... |
|---|---|
| El schema de Mongoose | Se envía, pero el servidor lo **ignora en silencio** y no se guarda |
| El objeto `novoPaciente` del script | Al editar, el campo sale vacío |
| El `<input>` del formulario | No hay dónde escribirlo |
| El `<th>` y el `<td>` de la tabla | No se ve en la lista |
| `cabeceras` y `filas` del PDF | No sale en el PDF |

El primero es el que más despista: Mongoose descarta sin avisar cualquier propiedad que no
esté en el schema. El navegador no da error, la petición responde `201`, y al recargar el
dato no está.

> En este proyecto **no hay que limpiar el campo a mano**: `limpiaFormpac()` recorre las
> claves de `novoPaciente` con `Object.keys(...)`, así que en cuanto añadas la del Paso 2
> ya se vacía sola. Ese es el motivo por el que esa función está escrita así.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/modelos/Paciente.js` | Que el servidor guarde el campo |
| `src/components/XestionPacientes.vue` | Molde, formulario, tabla y PDF |

## Paso 1 · El schema

En `backend/modelos/Paciente.js`, busca la línea `lopdpac: { type: Boolean, required: true },` y pega esto **justo debajo**:

```js
        // Campo de texto opcional. trim quita los espacios de los extremos.
        // default: "" evita que los pacientes que ya existian den error: no tienen este dato.
        // Si fuera required: true, no se podria editar ninguno de los antiguos.
        alergiaspac: { type: String, trim: true, default: "" },
```

**Reinicia el backend**: Ctrl+C en la terminal de `npm start` y vuelve a arrancarlo.

## Paso 2 · El molde del formulario

En `src/components/XestionPacientes.vue`, busca la línea `  lopdpac: false,` (está dentro de `novoPaciente`) y pega esto **justo encima**:

```js
  // Valor inicial del campo. Al estar aqui, limpiaFormpac() lo vacia solo
  // y editarPaciente() lo rellena solo al cargar una fila.
  alergiaspac: "",
```

El orden de las claves no importa, pero ponerlo junto a los demás campos de texto deja el
objeto más legible.

## Paso 3 · El campo en el formulario

En el `<template>`, busca el comentario `<!-- Provincia cambia cargarMunicipios(); el selector de municipio usa su lista resultante. -->` y pega esto **justo encima**:

```vue
      <!-- Fila propia para un campo largo. Las clases fila y campo ya estan en style.css -->
      <div class="fila">
        <div class="campo">
          <label for="pac-alergias">Alergias:</label>
          <!-- v-model ata el campo a novoPaciente.alergiaspac en los dos sentidos:
               lo que se escribe llega al objeto, y al editar el objeto rellena el campo.
               Sin required: es opcional, igual que en el schema. -->
          <textarea
            id="pac-alergias"
            v-model="novoPaciente.alergiaspac"
            rows="2"
          />
        </div>
      </div>
```

Si prefieres una sola línea en vez de un cuadro de texto, cambia el `<textarea>` por:

```vue
          <input
            id="pac-alergias"
            v-model="novoPaciente.alergiaspac"
            type="text"
          >
```

## Paso 4 · La columna de la tabla

Son dos cambios, y los dos en la misma posición: la cabecera y la celda.

**4.1** Busca la línea `<th>Apellidos</th>` y pega esto **justo debajo**:

```vue
            <th>Alergias</th>
```

**4.2** Busca la línea `<td>{{ u.apelpac }}</td>` y pega esto **justo debajo**:

```vue
            <!-- ?? "—" pone un guion si el paciente es antiguo y no tiene el campo -->
            <td>{{ u.alergiaspac || "—" }}</td>
```

Si falta uno de los dos, la tabla se descuadra: habrá una cabecera más que celdas, o al
revés.

## Paso 5 · El PDF

Dentro de `exportarPacientes()` hay dos cambios.

**5.1** Busca la línea `      cabeceras: ["DNI", "Apellidos", "Nombre", "Móvil"],` y **sustitúyela** por:

```js
      cabeceras: ["DNI", "Apellidos", "Nombre", "Móvil", "Alergias"],
```

**5.2** Busca la línea `        paciente.movilpac ?? "",` y pega esto **justo debajo**:

```js
        paciente.alergiaspac ?? "",
```

`cabeceras` y cada fila de `filas` tienen que tener **el mismo número de elementos**, o la
tabla del PDF sale desplazada. Es el fallo clásico de este paso.

## Variante · Un campo obligatorio

Si el enunciado pide que el campo sea obligatorio, hay tres cosas, no una:

```js
        // 1. En el schema: el servidor lo rechaza con 400 si falta
        alergiaspac: { type: String, required: true, trim: true },
```

```vue
          <!-- 2. En el formulario: el navegador avisa antes de enviar -->
          <input id="pac-alergias" v-model="novoPaciente.alergiaspac" type="text" required>
```

Y **3**: los pacientes que ya existen en la base de datos no tienen ese campo, así que no se
podrán editar hasta rellenárselo. Por eso para un campo nuevo casi siempre es mejor
`default: ""`, y validarlo solo en el formulario.

## Variante · Un número

```js
        // min y max son las validaciones de Mongoose para numeros
        pesopac: { type: Number, min: 0, max: 400, default: null },
```

```vue
          <!-- .number convierte lo escrito a numero: sin eso llegaria el texto "70" -->
          <input id="pac-peso" v-model.number="novoPaciente.pesopac" type="number" min="0">
```

## Variante · Un sí o no

```js
        privadopac: { type: Boolean, default: false },
```

```vue
          <!-- Con type="checkbox", v-model guarda true o false, no texto -->
          <input id="pac-privado" v-model="novoPaciente.privadopac" type="checkbox">
```

En la tabla: `{{ u.privadopac ? "Sí" : "No" }}`.

## Variante · Un desplegable de valores fijos

```js
        // enum limita los valores admitidos; cualquier otro da 400
        grupopac: { type: String, enum: ["A", "B", "AB", "0", ""], default: "" },
```

```vue
          <select id="pac-grupo" v-model="novoPaciente.grupopac">
            <option value="">Sin especificar</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="AB">AB</option>
            <option value="0">0</option>
          </select>
```

El `""` tiene que estar en el `enum`, o la opción «Sin especificar» daría error de
validación.

## Qué deberías ver

1. Un campo «Alergias» en el formulario de pacientes.
2. Crea un paciente con alergias: la tabla muestra la columna nueva con el valor.
3. **Recarga la página (F5)**: el valor sigue ahí. Eso es lo que prueba que el Paso 1 funciona.
4. Pulsa editar en esa fila: el valor aparece en el formulario.
5. Pulsa «Limpar»: el campo se vacía, sin haber tocado `limpiaFormpac()`.
6. El PDF incluye la columna.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Se guarda, pero al recargar no está | Falta el Paso 1, o no reiniciaste el backend. Mongoose descarta en silencio lo que no está en el schema |
| Sale vacío al editar | Falta el Paso 2 |
| El campo del formulario no responde | El `v-model` tiene que ser `novoPaciente.alergiaspac`, no `paciente.alergiaspac` |
| La tabla se descuadra | Falta el `<th>` o el `<td>` del Paso 4 |
| El PDF sale desplazado | `cabeceras` y `filas` no tienen el mismo número de elementos |
| `400` al guardar un paciente antiguo | Pusiste `required: true` en un campo que los antiguos no tienen |
| Guarda `"70"` en vez de `70` | En un `type="number"` hace falta `v-model.number` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Schema de Mongoose | La forma del documento; lo que no está en él se descarta |
| `default` en el schema | El valor para los documentos que no traen el campo |
| `v-model` | Ata un campo del formulario a un dato en los dos sentidos |
| `v-model.number` | Convierte lo escrito a número |
| `enum` | Lista cerrada de valores admitidos |
| `Object.keys` en un `reactive` | Recorrer las claves para vaciarlas todas de golpe |

## Guías relacionadas

- [Entidad nueva con CRUD completo](entidad-nueva.md)
- [Validaciones](../validacion/validaciones.md)
- [Columna calculada: la edad](../columnas-y-filtros/columna-calculada.md)
- [Apuntes a fondo: formularios y campos](../../detalle/02-formularios-y-campos.md)

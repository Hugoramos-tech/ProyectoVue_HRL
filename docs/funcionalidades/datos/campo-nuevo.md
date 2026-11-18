# Campo nuevo

Un campo opcional «Alerxias» en pacientes: se guarda en la base de datos, sale en el formulario, en la tabla y en el PDF, y se carga al editar.

*Versión extendida, con variantes y más casos: [apuntes a fondo, apartado 3](../../detalle/02-formularios-y-campos.md).*

**Antes de empezar:** arranca el proyecto (`npm start`). El backend no recarga solo: después del Paso 1 tendrás que reiniciarlo.

## La idea

Un campo tiene que existir en **cuatro sitios**. Si falta uno, falla de una forma distinta cada vez:

| Sitio | Si falta |
|---|---|
| El modelo de Mongoose | Se envía, pero el servidor lo ignora y no se guarda |
| El molde del formulario | Al editar, el campo sale vacío |
| El `<input>` del formulario | No hay dónde escribirlo |
| La lista `columnas` | No sale en la tabla ni en el PDF |

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/modelos/Paciente.js` | Que el servidor guarde el campo |
| `src/components/XestionPacientes.vue` | Molde, campo del formulario y columna |

## Paso 1 · El modelo

En `backend/modelos/Paciente.js`, busca la línea `lopdpac: { type: Boolean, required: true },` y pega esto **justo debajo**:

```js
        // Un campo de texto. trim quita los espacios de los extremos; default '' = si no se envía, queda vacío
        // (así los pacientes que ya existían no dan error: no tienen este dato).
        alerxiaspac: { type: String, trim: true, default: '' },
```

Qué hace: añade un campo de texto opcional. `trim` quita espacios sobrantes y `default: ''` lo deja vacío si no se escribe nada.

**Reinicia el backend** (en la terminal donde corre `npm start`: Ctrl+C y otra vez `npm start`).

## Paso 2 · El molde del formulario

En `src/components/XestionPacientes.vue`, busca la línea `lopdpac: false, // aceptación de la política de protección de datos (LOPD)` y pega esto **justo encima**:

```js
  // Valor inicial del campo en el molde del formulario. "Limpar" y los formularios nuevos empiezan con él.
  alerxiaspac: "",
```

## Paso 3 · El campo en el formulario

En `src/components/XestionPacientes.vue`, busca el comentario `<!-- Dirección postal -->` y pega esto **justo encima**:

```vue
      <!-- class="col-span-full": el campo ocupa toda la fila de la rejilla del formulario -->
      <FormField label="Alerxias:" class="col-span-full">
        <!-- v-model ata el campo a `datos.alerxiaspac`: lo que se escribe llega al molde, y al editar, se rellena solo -->
        <input
          v-model="datos.alerxiaspac"
          type="text"
        >
      </FormField>
```

Qué hace: `v-model` ata el campo a `datos.alerxiaspac`. `col-span-full` hace que ocupe toda la fila de la rejilla.

## Paso 4 · La columna

En `src/components/XestionPacientes.vue`, busca la línea `{ clave: "munipac", titulo: "Municipio" },` y pega esto **justo debajo**:

```js
  // La misma lista de columnas sirve para la tabla y para el PDF: una columna aquí sale en los dos
  { clave: "alerxiaspac", titulo: "Alerxias" },
```

## Qué deberías ver

1. Un campo «Alerxias» en el formulario de pacientes.
2. Crea un paciente con alergias y mira la tabla: tiene una columna nueva con el valor.
3. Pulsa editar en esa fila: el valor aparece en el formulario.
4. El botón PDF incluye la columna.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Se guarda pero al recargar no está | Falta el Paso 1, o no reiniciaste el backend |
| Sale vacío al editar | Falta el Paso 2 (el molde) |
| No aparece en la tabla | Falta el Paso 4 |
| Error al guardar | Mira la consola del navegador (F12) y la terminal del backend |

## Variantes

- **Obligatorio:** `required: true` en el modelo y el atributo `required` en el `<input>`.
- **Desplegable con valores fijos, número, sí o no:** están en [formularios y campos](../../detalle/02-formularios-y-campos.md).

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Schema de Mongoose | La forma de los documentos y sus validaciones | `03_lecciones/03_crud_api_rest.md §4` |
| `v-model` | Ata un campo del formulario a un dato en los dos sentidos | `03_lecciones/vue/02_v_model.md` |
| Camino de un dato | De la pantalla a MongoDB: vista, store, api, ruta, modelo | `01_arquitectura/README.md` |

## Guías relacionadas

- [Guía: campo nuevo](../../guias/campo-nuevo.md)

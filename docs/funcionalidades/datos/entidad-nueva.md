# Entidad nueva con CRUD completo: aseguradoras

Una gestión completa de aseguradoras (nombre y teléfono): modelo, rutas, API, pantalla con formulario y tabla, entrada en el menú, y un desplegable en pacientes para asignarla.

Sirve igual para salas, medicamentos, tratamientos o seguros: solo cambian los nombres.

**Antes de empezar:** es la receta más larga de la wiki. Son 9 pasos, de abajo (base de datos) hacia arriba (pantalla). **Prueba cada capa antes de pasar a la siguiente**, o cuando falle no sabrás dónde. El backend no recarga solo: reinícialo después de los pasos 2, 3 y 8.

## Cómo viaja un dato

Una aseguradora recorre siempre este camino, y cada paso de esta receta es una pieza de él:

```
Pantalla (.vue)  ->  src/api/ (axios)  ->  backend/rutas/  ->  backend/modelos/  ->  MongoDB
```

En este proyecto **no hay un store por entidad**: Pinia solo guarda qué paciente y qué
doctor están seleccionados. Las listas se piden al servidor en cada pantalla. Así que no
hace falta crear ningún store, y la cadena tiene cuatro piezas, no cinco.

## Qué vas a tocar

| # | Fichero | Nuevo o existente |
|---|---|---|
| 1 | `backend/modelos/Aseguradora.js` | **Nuevo** |
| 2 | `backend/rutas/aseguradoras.rutas.js` | **Nuevo** |
| 3 | `backend/server.js` | Existente: enchufar las rutas |
| 4 | `src/api/aseguradoras.js` | **Nuevo** |
| 5 | `src/components/XestionAseguradoras.vue` | **Nuevo**: la pantalla |
| 6 | `src/router/index.js` | Existente: la ruta |
| 7 | `src/components/NavBar.vue` | Existente: el enlace del menú |
| 8 | `backend/modelos/Paciente.js` | Existente: el campo nuevo |
| 9 | `src/components/XestionPacientes.vue` | Existente: el desplegable |

Los pasos 1 a 7 son la entidad. Los pasos 8 y 9 son **relacionarla con los pacientes**: si
el enunciado no lo pide, para en el 7.

## Paso 1 · El modelo

Crea `backend/modelos/Aseguradora.js`:

```js
// Esquema de la coleccion aseguradoras: catalogo de companias de seguros medicos.
import mongoose from "mongoose";

const AseguradoraSchema = new mongoose.Schema(
    {
        // unique: true crea un indice en MongoDB: dos aseguradoras no pueden
        // llamarse igual. Si se intenta, MongoDB lanza el error 11000.
        // trim quita los espacios de los extremos antes de guardar.
        nomeaseg: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        // Formato nacional: empieza por 6, 7, 8 o 9 y nueve digitos en total.
        telfaseg: {
            type: String,
            required: true,
            match: [/^[6789]\d{8}$/, "El telefono debe tener 9 digitos"]
        },
        // Campo libre opcional; si no se envia queda como cadena vacia.
        observaseg: {
            type: String,
            default: ""
        }
    },
    {
        // Nombre exacto de la coleccion tal como aparece en MongoDB.
        collection: "aseguradoras"
    }
);

export default mongoose.model("Aseguradora", AseguradoraSchema);
```

Los nombres de campo acaban en `aseg` por la misma razón que los de paciente acaban en
`pac` y los de doctor en `doc`: es la convención de este proyecto.

## Paso 2 · Las rutas

Crea `backend/rutas/aseguradoras.rutas.js`. Es el mismo molde que `doctores.rutas.js`:

```js
// Rutas del CRUD de aseguradoras, montadas bajo /api/aseguradoras desde server.js.
// La aseguradora se localiza por su _id de MongoDB, como los doctores.
import express from "express"
import Aseguradora from "../modelos/Aseguradora.js"

// Agrupa las operaciones HTTP disponibles para aseguradoras.
const router = express.Router()

// GET /api/aseguradoras: todas, por orden alfabetico.
router.get("/", async (req, res) => {
    try {
        // sort({ nomeaseg: 1 }) ordena de la A a la Z; -1 seria al contrario.
        // lean() devuelve objetos JavaScript simples, mas ligeros que los documentos.
        const aseguradoras = await Aseguradora.find().sort({ nomeaseg: 1 }).lean()
        res.json(aseguradoras)
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar las aseguradoras" })
    }
})

// POST /api/aseguradoras: crea un documento validado por Mongoose.
router.post("/", async (req, res) => {
    try {
        // Instancia del modelo: vive en memoria hasta que save la escribe en la base.
        const aseguradora = new Aseguradora(req.body)
        const nuevaAseguradora = await aseguradora.save()
        // 201 Created: el recurso se ha creado.
        res.status(201).json(nuevaAseguradora)
    } catch (error) {
        // El codigo 11000 de MongoDB avisa de un valor unico repetido.
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: "Ya existe una aseguradora con ese nombre" })
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ mensaje: error.message })
        }
        res.status(500).json({ mensaje: "Error al crear la aseguradora" })
    }
})

// PUT /api/aseguradoras/:id: actualiza los campos enviados.
router.put("/:id", async (req, res) => {
    try {
        // new: true devuelve el documento YA actualizado; sin eso devolveria el viejo.
        // runValidators: true aplica las reglas del esquema tambien al modificar.
        const aseguradora = await Aseguradora.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!aseguradora) {
            return res.status(404).json({ mensaje: "Aseguradora no encontrada" })
        }

        res.json(aseguradora)
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ mensaje: "Ya existe una aseguradora con ese nombre" })
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ mensaje: error.message })
        }
        res.status(500).json({ mensaje: "Error al modificar la aseguradora" })
    }
})

// DELETE /api/aseguradoras/:id: elimina por el _id del documento.
router.delete("/:id", async (req, res) => {
    try {
        const aseguradora = await Aseguradora.findByIdAndDelete(req.params.id)
        if (!aseguradora) {
            return res.status(404).json({ mensaje: "Aseguradora no encontrada" })
        }
        res.json({ mensaje: "Aseguradora eliminada" })
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la aseguradora" })
    }
})

export default router
```

## Paso 3 · Enchufarlas en el servidor

En `backend/server.js` hay dos cambios.

**3.1** Busca la línea `import citasRutas from './rutas/citas.rutas.js'` y pega esto **justo debajo**:

```js
import aseguradorasRutas from './rutas/aseguradoras.rutas.js'
```

**3.2** Busca la línea `app.use("/api/citas", requireDatabase, citasRutas);` y pega esto **justo debajo**:

```js
app.use("/api/aseguradoras", requireDatabase, aseguradorasRutas);
```

`requireDatabase` es el middleware de este fichero que responde **503** si MongoDB no está
conectado. Todas las rutas que tocan la base de datos pasan por él.

**Reinicia el backend** y comprueba la primera capa antes de seguir: abre
`http://localhost:3000/api/aseguradoras` en el navegador. Tiene que salir `[]`. Si sale un
error, el problema está en los pasos 1 a 3 y no en los siguientes.

## Paso 4 · La API del frontend

Crea `src/api/aseguradoras.js`, con el mismo molde que `src/api/doctores.js`:

```js
import axios from "axios";

// Endpoint del CRUD de aseguradoras publicado por el backend Express.
const URL = "http://localhost:3000/api/aseguradoras";

// GET: devuelve el array de aseguradoras ordenadas alfabeticamente.
export async function getAseguradoras() {
  // respuesta contiene el estado HTTP y el JSON devuelto por Express.
  const respuesta = await axios.get(URL);
  return respuesta.data;
}

// POST: crea una aseguradora y devuelve el documento guardado.
export async function saveAseguradora(aseguradora) {
  const respuesta = await axios.post(URL, aseguradora);
  return respuesta.data;
}

// PUT: modifica la aseguradora identificada por su _id.
export async function modifyAseguradora(id, aseguradora) {
  // Los acentos graves permiten meter el id dentro de la URL.
  const respuesta = await axios.put(`${URL}/${id}`, aseguradora);
  return respuesta.data;
}

// DELETE: elimina la aseguradora identificada por su _id.
export async function deleteAseguradora(id) {
  const respuesta = await axios.delete(`${URL}/${id}`);
  return respuesta.data;
}
```

La URL está escrita a mano porque así está en los otros cuatro ficheros de `src/api/`: este
proyecto no usa variables de entorno en el frontend.

## Paso 5 · La pantalla

Crea `src/components/XestionAseguradoras.vue`:

```vue
<template>
  <section class="box-border w-full min-w-0 rounded-lg bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-8">
    <h4 class="mb-4 rounded bg-[#14543a] px-3 py-2 font-semibold text-white">
      Gestión de aseguradoras
    </h4>

    <!-- @submit.prevent ejecuta guardarAseguradora() sin recargar la pagina -->
    <form class="mb-8 grid gap-4" @submit.prevent="guardarAseguradora">
      <div class="grid gap-2">
        <label for="aseg-nome">Nombre:</label>
        <!-- v-model.trim ata el campo al objeto y quita los espacios de los extremos -->
        <input
          id="aseg-nome"
          v-model.trim="aseguradora.nomeaseg"
          class="w-full rounded border border-[#cfe0d6] p-2"
          type="text"
          required
        >
      </div>

      <div class="grid gap-2">
        <label for="aseg-telf">Teléfono:</label>
        <input
          id="aseg-telf"
          v-model.trim="aseguradora.telfaseg"
          class="w-full rounded border border-[#cfe0d6] p-2"
          type="tel"
          required
        >
      </div>

      <div class="grid gap-2">
        <label for="aseg-obs">Observaciones:</label>
        <textarea
          id="aseg-obs"
          v-model.trim="aseguradora.observaseg"
          class="w-full rounded border border-[#cfe0d6] p-2"
          rows="2"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <!-- El texto del boton cambia segun se este creando o editando -->
        <button
          class="rounded bg-[#14543a] px-4 py-2 font-bold text-white"
          type="submit"
          :disabled="guardando"
        >
          {{ editando ? "Guardar cambios" : "Crear aseguradora" }}
        </button>
        <!-- v-if: el boton de cancelar solo existe mientras se edita -->
        <button
          v-if="editando"
          class="rounded border border-[#14543a] px-4 py-2 font-bold text-[#14543a]"
          type="button"
          @click="limpiarFormulario"
        >
          Cancelar
        </button>
        <button
          class="rounded border border-[#14543a] px-4 py-2 font-bold text-[#14543a]"
          type="button"
          :disabled="aseguradoras.length === 0"
          @click="exportarAseguradoras"
        >
          Descargar PDF
        </button>
      </div>
    </form>

    <!-- v-if / v-else: la tabla o el aviso de lista vacia, nunca los dos -->
    <div v-if="aseguradoras.length > 0" class="tabla-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Observaciones</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <!-- :key ayuda a Vue a saber que fila es cada una al reordenar -->
          <tr v-for="(item, index) in aseguradoras" :key="item._id">
            <td class="centrado">{{ index + 1 }}</td>
            <td>{{ item.nomeaseg }}</td>
            <td class="centrado">{{ item.telfaseg }}</td>
            <td>{{ item.observaseg }}</td>
            <td class="celda-acciones">
              <button
                class="btn-accion"
                type="button"
                title="Editar"
                @click="editarAseguradora(item)"
              >
                ✏️
              </button>
              <button
                class="btn-accion"
                type="button"
                title="Eliminar"
                @click="eliminarAseguradora(item)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="lista-vacia">
      No hay aseguradoras cargadas.
    </p>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import {
  getAseguradoras,
  saveAseguradora,
  modifyAseguradora,
  deleteAseguradora,
} from "../api/aseguradoras.js";
import { alertaExito, alertaError, alertaConfirmacion } from "../utils/alertas.js";
import { generarPDF } from "../utils/pdf.js";

// reactive para el objeto del formulario: sus propiedades se leen sin .value.
// _id vacio significa "nueva"; al editar se rellena con el de la fila.
const aseguradora = reactive({
  _id: "",
  nomeaseg: "",
  telfaseg: "",
  observaseg: "",
});

// ref para los valores sueltos: dentro del script se leen con .value.
const aseguradoras = ref([]);
const guardando = ref(false);
const editando = ref(false);

// Saca el mensaje que manda el backend; si no hay, usa el texto de reserva.
function mensajeError(error, respaldo) {
  return error?.response?.data?.mensaje ?? respaldo;
}

// Pide la lista al servidor. Se llama al montar y despues de cada cambio.
async function cargarAseguradoras() {
  try {
    aseguradoras.value = await getAseguradoras();
  } catch (error) {
    alertaError(mensajeError(error, "No se pudieron cargar las aseguradoras."));
  }
}

// onMounted se ejecuta una vez, cuando la pantalla aparece.
onMounted(cargarAseguradoras);

// Vacia el formulario y sale del modo edicion.
function limpiarFormulario() {
  aseguradora._id = "";
  aseguradora.nomeaseg = "";
  aseguradora.telfaseg = "";
  aseguradora.observaseg = "";
  editando.value = false;
}

// Copia la fila al formulario. Se copian los campos uno a uno para no
// sustituir el objeto reactive, que perderia la reactividad.
function editarAseguradora(item) {
  aseguradora._id = item._id;
  aseguradora.nomeaseg = item.nomeaseg;
  aseguradora.telfaseg = item.telfaseg;
  aseguradora.observaseg = item.observaseg ?? "";
  editando.value = true;
}

// Crear o modificar, segun si el formulario trae un _id.
async function guardarAseguradora() {
  guardando.value = true;
  try {
    const datos = {
      nomeaseg: aseguradora.nomeaseg,
      telfaseg: aseguradora.telfaseg,
      observaseg: aseguradora.observaseg,
    };

    if (editando.value) {
      await modifyAseguradora(aseguradora._id, datos);
      alertaExito("Aseguradora modificada");
    } else {
      await saveAseguradora(datos);
      alertaExito("Aseguradora creada");
    }

    limpiarFormulario();
    await cargarAseguradoras();
  } catch (error) {
    // El backend responde 409 si el nombre esta repetido y 400 si falla una validacion.
    alertaError(mensajeError(error, "No se pudo guardar la aseguradora."));
  } finally {
    // finally se ejecuta pase lo que pase: el boton nunca se queda bloqueado.
    guardando.value = false;
  }
}

async function eliminarAseguradora(item) {
  // La promesa de confirmacion devuelve isConfirmed; si se cancela, no se borra nada.
  const confirmacion = await alertaConfirmacion(
    `¿Quieres eliminar ${item.nomeaseg}?`,
    "Eliminar aseguradora"
  );

  if (!confirmacion.isConfirmed) {
    return;
  }

  try {
    await deleteAseguradora(item._id);
    alertaExito("Aseguradora eliminada");
    await cargarAseguradoras();
  } catch (error) {
    alertaError(mensajeError(error, "No se pudo eliminar la aseguradora."));
  }
}

async function exportarAseguradoras() {
  try {
    await generarPDF({
      titulo: "Listado de aseguradoras",
      // Las cabeceras y cada fila tienen que tener el mismo numero de elementos.
      cabeceras: ["Nombre", "Teléfono", "Observaciones"],
      filas: aseguradoras.value.map((item) => [
        item.nomeaseg,
        item.telfaseg,
        item.observaseg ?? "",
      ]),
      nombreArchivo: "aseguradoras",
      descripcion: `Total: ${aseguradoras.value.length} aseguradoras`,
    });
  } catch (error) {
    alertaError("No se pudo generar el PDF.");
  }
}
</script>
```

Las clases `tabla-wrapper`, `celda-acciones`, `btn-accion` y `lista-vacia` ya están
definidas en `src/style.css`: son las mismas que usan las otras pantallas, así que la tabla
sale con el mismo aspecto sin escribir estilos nuevos.

## Paso 6 · La ruta

En `src/router/index.js` hay dos cambios.

**6.1** Busca la línea `import NotFound from '../components/NotFound.vue'` y pega esto **justo encima**:

```js
import XestionAseguradoras from '../components/XestionAseguradoras.vue'
```

**6.2** Busca la línea `// Comodin al final: recoge las URLs que no coinciden con ninguna ruta anterior.` y pega esto **justo encima**:

```js
    { path: '/XestionAseguradoras', name: 'XestionAseguradoras', component: XestionAseguradoras },
```

**Tiene que ir antes del comodín**: el router prueba las rutas en orden y el comodín se
queda con todo lo que llegue a él.

Pruébalo ya escribiendo `localhost:5173/XestionAseguradoras` en el navegador, antes de poner
el enlace del menú.

## Paso 7 · El enlace del menú

En `src/components/NavBar.vue`, busca la línea que acaba en `to="/citas">Citas</RouterLink>`.
Está dentro de un `<li>`, y debajo tiene su `</li>`. Pega esto **justo debajo de ese `</li>`**:

```vue
      <li>
        <RouterLink class="font-medium text-white no-underline transition-colors hover:text-[#ffe66d] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffe66d] [&.router-link-active]:border-b-[0.2rem] [&.router-link-active]:border-[#ffe66d]" to="/XestionAseguradoras">Aseguradoras</RouterLink>
      </li>
```

La clase es larga porque en este proyecto el menú está escrito enlace por enlace, con las
clases repetidas en cada uno. Cópiala tal cual de otro enlace y cambia solo el `to` y el
texto.

**Aquí acaba la entidad.** Si el enunciado solo pedía un CRUD nuevo, ya está. Los dos pasos
que quedan son para relacionarla con los pacientes.

## Paso 8 · El campo en el paciente

En `backend/modelos/Paciente.js`, busca la línea `lopdpac: { type: Boolean, required: true },` y pega esto **justo encima**:

```js
        // Referencia a la aseguradora: se guarda su _id, no su nombre.
        // ref: "Aseguradora" es lo que permite usar populate en las rutas.
        // No es required: un paciente puede no tener seguro privado.
        asegpac: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Aseguradora",
            default: null
        },
```

**Reinicia el backend.** Un campo que no está en el schema **no se guarda**: Mongoose
ignora en silencio lo que no conoce. Es el fallo número uno de este paso.

## Paso 9 · El desplegable en pacientes

En `src/components/XestionPacientes.vue` hay tres cambios.

**9.1** Busca la línea `import { generarPDF } from "../utils/pdf.js";` y pega esto **justo debajo**:

```js
import { getAseguradoras } from "../api/aseguradoras.js";
```

**9.2** Busca la línea `const pacienteStore = usepacienteStore();` y pega esto **justo debajo**:

```js
// Catalogo de aseguradoras para el desplegable del formulario.
const aseguradoras = ref([]);

getAseguradoras()
  .then((lista) => (aseguradoras.value = lista))
  .catch(() => (aseguradoras.value = []));
```

**9.3** En el `<template>`, busca la línea `<th>Provincia</th>` y pega esto **justo encima**:

```vue
            <th>Aseguradora</th>
```

Y busca la línea `<td>{{ u.propac }}</td>` y pega esto **justo encima**:

```vue
            <!-- find busca la aseguradora cuyo _id coincide con el del paciente.
                 Se comparan como texto porque uno viene de MongoDB y el otro del formulario. -->
            <td>{{ aseguradoras.find((a) => String(a._id) === String(u.asegpac))?.nomeaseg ?? "—" }}</td>
```

El `<th>` y el `<td>` van en la misma posición, los dos encima de Provincia. Si falta uno,
la tabla se descuadra.

Para el desplegable del formulario, pega esto dentro del `<form>`, antes del bloque de los
botones:

```vue
          <div class="grid gap-2">
            <label for="pac-aseg">Aseguradora:</label>
            <!-- El :value de cada opcion es el _id, que es lo que guarda el paciente -->
            <select
              id="pac-aseg"
              v-model="paciente.asegpac"
              class="w-full rounded border border-[#cfe0d6] p-2"
            >
              <option :value="null">
                Sin aseguradora
              </option>
              <option
                v-for="a in aseguradoras"
                :key="a._id"
                :value="a._id"
              >
                {{ a.nomeaseg }}
              </option>
            </select>
          </div>
```

Y añade `asegpac: null,` al objeto `paciente` del script y a la función que lo limpia, igual
que están los demás campos.

## Variante · Traer el nombre desde el servidor con populate

El Paso 9.3 busca el nombre en el navegador. También se puede pedir ya resuelto, en
`backend/rutas/pacientes.rutas.js`, dentro del `GET /`:

```js
        // populate sustituye el _id guardado por el documento entero de la aseguradora.
        // Solo funciona porque el campo tiene ref: "Aseguradora" en el schema.
        const pacientes = await Paciente.find().populate("asegpac", "nomeaseg").lean()
```

Entonces en la tabla basta `{{ u.asegpac?.nomeaseg ?? "—" }}`. Es más limpio, pero obliga a
cambiar también el formulario: al editar, `u.asegpac` ya no es un `_id` sino un objeto.

## Qué deberías ver

1. `http://localhost:3000/api/aseguradoras` devuelve `[]` (tras el paso 3).
2. «Aseguradoras» aparece en el menú y la pantalla crea, lista, edita y borra.
3. Crear dos con el mismo nombre da «Ya existe una aseguradora con ese nombre»: ese es el **409** del `unique: true`.
4. Un teléfono de 8 dígitos da un error de validación: ese es el **400** del `match`.
5. El PDF se descarga con las tres columnas.
6. En pacientes, el desplegable lista las aseguradoras y la tabla muestra el nombre de la asignada.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `http://localhost:3000/api/aseguradoras` da 404 | Falta el Paso 3.2, o no reiniciaste el backend |
| Da 503 | MongoDB no está conectado: `docker compose up -d` |
| `Cannot find module '../modelos/Aseguradora.js'` | El nombre del fichero tiene que coincidir exactamente, mayúsculas incluidas |
| `Failed to resolve component: XestionAseguradoras` | Falta el Paso 6.1 |
| Sale la pantalla de 404 de la web | La ruta quedó **después** del comodín |
| El enlace del menú no aparece | El `<li>` quedó fuera del `<ul>`, o lo pegaste dentro de otro `<li>` |
| Crea dos con el mismo nombre sin quejarse | El índice `unique` se crea al arrancar: reinicia el backend, y si ya había datos repetidos, bórralos primero |
| El campo `asegpac` no se guarda en el paciente | Falta el Paso 8, o no reiniciaste el backend |
| La columna de aseguradora sale vacía | Los `_id` se comparan como texto: `String(a._id) === String(u.asegpac)` |
| La tabla de pacientes se descuadra | Falta el `<th>` o el `<td>` del Paso 9.3 |
| `aseguradoras is not defined` en pacientes | Falta el Paso 9.2 |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Schema y Model de Mongoose | La forma del documento y el objeto que consulta la colección |
| `unique: true` | Un índice de MongoDB; su violación llega como error `11000` |
| `express.Router()` | Agrupar las rutas de un recurso en su propio fichero |
| Códigos HTTP | 200 bien, 201 creado, 400 datos malos, 404 no existe, 409 repetido, 500 error, 503 sin base de datos |
| `findByIdAndUpdate` con `new: true` | Devuelve el documento ya actualizado |
| `ref` y `ObjectId` | Guardar el `_id` de otro documento para relacionarlos |
| `populate` | Sustituir ese `_id` por el documento entero |
| `reactive` frente a `ref` | Objeto de formulario frente a valores sueltos |

## Guías relacionadas

- [Campo nuevo en un modelo](campo-nuevo.md)
- [Ruta con parámetro](../pantallas/ruta-con-parametro.md)
- [Columna de otra tabla](../columnas-y-filtros/columna-de-otra-tabla.md)
- [Borrado en cascada](../backend/borrado-en-cascada.md)

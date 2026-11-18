# Entidad nueva con CRUD: aseguradoras

Una gestión completa de aseguradoras (`nome` y `telefono`): modelo, API, una página con formulario y tabla, y un desplegable en pacientes para asignarla. Sirve igual para salas, medicamentos o seguros: cambia los nombres.

**Antes de empezar:** es la tarea más larga: son 8 pasos, de abajo (base de datos) hacia arriba (pantalla). Prueba cada capa antes de pasar a la siguiente. El backend no recarga solo: reinícialo después de los pasos 2 y 3.

## Cómo viaja un dato

Una aseguradora recorre siempre este camino, y cada paso de esta receta es una pieza:

`Pantalla (.vue)` → `Store` → `API (axios)` → `Ruta Express` → `Modelo Mongoose` → `MongoDB`

## Qué vas a tocar

| # | Fichero | Para qué |
|---|---|---|
| 1 | `backend/modelos/Aseguradora.js` | **Nuevo.** La forma del documento |
| 2 | `backend/rutas/aseguradoras.js` | **Nuevo.** Los endpoints |
| 3 | `backend/server.js` | Enchufar las rutas |
| 4 | `src/api/aseguradoras.js` | **Nuevo.** Las peticiones HTTP |
| 5 | `src/store/aseguradoraStore.js` | **Nuevo.** El estado compartido |
| 6 | `src/components/XestionAseguradoras.vue` | **Nuevo.** La página |
| 7 | `src/router/index.js` | La ruta y el menú |
| 8 | `Paciente.js` y `XestionPacientes.vue` | Asignarlas a los pacientes |

## Paso 1 · El modelo

Crea `backend/modelos/Aseguradora.js`:

```js
import mongoose from 'mongoose'

// Un Schema describe la FORMA de los documentos de una colección: campos, tipos y reglas
const AseguradoraSchema = new mongoose.Schema(
    {
        // required: true = obligatorio. trim quita los espacios de los extremos.
        nome: { type: String, required: true, trim: true },
        telefono: { type: String, trim: true },
    },
    {
        collection: 'aseguradoras', // nombre exacto de la colección en MongoDB
        timestamps: true,           // añade solos createdAt y updatedAt
        toJSON: {
            versionKey: false,      // quita el campo interno __v
            // Mongo usa `_id`; el frontend usa `id` (texto)
            transform(_doc, ret) {
                ret.id = ret._id.toString()
                delete ret._id
                return ret
            },
        },
    }
)

// El Model es lo que usan las rutas para consultar y guardar en esta colección
export default mongoose.model('Aseguradora', AseguradoraSchema)
```

## Paso 2 · Las rutas

Crea `backend/rutas/aseguradoras.js`:

```js
import { Router } from 'express'
import Aseguradora from '../modelos/Aseguradora.js'

// Un Router es una mini-aplicación que agrupa rutas; server.js le pondrá el prefijo /api/aseguradoras
const router = Router()

// Listado, por orden alfabético (sort({ nome: 1 }): 1 = de la A a la Z)
router.get('/', async (req, res) => {
    res.json(await Aseguradora.find().sort({ nome: 1 }))
})

// Crear. El nombre no se puede repetir: 409 = conflicto
router.post('/', async (req, res) => {
    // findOne devuelve la primera con ese nombre, o null si no hay ninguna
    const repetida = await Aseguradora.findOne({ nome: String(req.body.nome ?? '').trim() })
    if (repetida) {
        return res.status(409).json({ error: 'Xa existe unha aseguradora con ese nome' })
    }
    // 201 = Created: se creó correctamente
    res.status(201).json(await Aseguradora.create(req.body))
})

// Actualizar. req.params.id es el tramo :id de la URL; req.body son los datos nuevos
router.put('/:id', async (req, res) => {
    // Al editar, el nombre tampoco puede coincidir con el de OTRA aseguradora (`$ne` = "distinto de":
    // se deja fuera a la propia, que sí puede conservar su nombre)
    const nombre = String(req.body.nome ?? '').trim()
    if (nombre && (await Aseguradora.findOne({ nome: nombre, _id: { $ne: req.params.id } }))) {
        return res.status(409).json({ error: 'Xa existe unha aseguradora con ese nome' })
    }
    const aseguradora = await Aseguradora.findByIdAndUpdate(req.params.id, req.body, {
        new: true,           // devuelve el documento YA actualizado (por defecto devolvería el antiguo)
        runValidators: true, // aplica las reglas del schema también al actualizar
    })
    // null = no existe: 404 = no encontrado
    if (!aseguradora) return res.status(404).json({ error: 'Aseguradora non atopada' })
    res.json(aseguradora)
})

// Eliminar. 204 = borrado, sin cuerpo en la respuesta
router.delete('/:id', async (req, res) => {
    const aseguradora = await Aseguradora.findByIdAndDelete(req.params.id)
    if (!aseguradora) return res.status(404).json({ error: 'Aseguradora non atopada' })
    res.status(204).end()
})

export default router
```

## Paso 3 · Enchufarlas en el servidor

En `backend/server.js`, hay dos cambios.

Busca la línea `import rutasCitas from './rutas/citas.js'` y pega esto **justo debajo**:

```js
import rutasAseguradoras from './rutas/aseguradoras.js'
```

Busca la línea `app.use('/api/citas', rutasCitas)` y pega esto **justo debajo**:

```js
app.use('/api/aseguradoras', rutasAseguradoras)
```

**Reinicia el backend** y prueba antes de seguir:

```bash
curl -X POST localhost:3000/api/aseguradoras -H 'content-type: application/json' -d '{"nome":"Sanitas","telefono":"900100200"}'
curl localhost:3000/api/aseguradoras
```

Si el segundo comando devuelve la aseguradora, el backend funciona. Si repites el primero, debe dar `409`.

## Paso 4 · La API del frontend

Crea `src/api/aseguradoras.js`:

```js
import axios from "axios";

// Misma URL base que el resto de la API (se lee del .env; solo las variables VITE_ llegan al navegador)
const URL = `${import.meta.env.VITE_API_URL}/api/aseguradoras`;

// Cada función hace UNA petición HTTP y devuelve solo los datos (.data de la respuesta de axios)
export async function obtenerAseguradoras() {
  return (await axios.get(URL)).data;            // GET    -> leer la lista
}
export async function crearAseguradora(datos) {
  return (await axios.post(URL, datos)).data;    // POST   -> crear una nueva
}
export async function actualizarAseguradora(id, datos) {
  return (await axios.put(`${URL}/${id}`, datos)).data; // PUT -> modificar la de ese id
}
export async function eliminarAseguradora(id) {
  return (await axios.delete(`${URL}/${id}`)).data;     // DELETE -> borrar la de ese id
}
```

## Paso 5 · El store

Crea `src/store/aseguradoraStore.js`:

```js
import { ref } from "vue";
import { defineStore } from "pinia";
import {
  obtenerAseguradoras,
  crearAseguradora,
  actualizarAseguradora,
  eliminarAseguradora,
} from "../api/aseguradoras.js";

// Un store de Pinia es un almacén de datos compartido por todas las páginas.
// Aquí, con la "sintaxis setup": cada ref es estado, cada function es una acción.
export const useAseguradoraStore = defineStore("aseguradora", () => {
  const aseguradoras = ref([]); // la lista, tal y como la devolvió el servidor

  async function cargarAseguradoras() {
    aseguradoras.value = await obtenerAseguradoras(); // los ref se escriben con .value
  }

  // Con id actualiza; sin id crea. Después recarga la lista para que la tabla muestre el cambio.
  async function gardarAseguradora(id, datos) {
    const guardado = id ? await actualizarAseguradora(id, datos) : await crearAseguradora(datos);
    await cargarAseguradoras();
    return guardado;
  }

  async function eliminarAseguradoraPorId(id) {
    await eliminarAseguradora(id);
    await cargarAseguradoras();
  }

  // Dado un id, devuelve el nombre ("—" si no existe). Lo usará la tabla de pacientes.
  // ?. = "si lo encuentra, lee su nome; si no, no falles"
  function nombrePorId(id) {
    return aseguradoras.value.find((a) => a.id === id)?.nome ?? "—";
  }

  // Lo que se devuelve es lo que queda disponible fuera del store
  return { aseguradoras, cargarAseguradoras, gardarAseguradora, eliminarAseguradoraPorId, nombrePorId };
});
```

## Paso 6 · La página

Crea `src/components/XestionAseguradoras.vue`:

```vue
<script setup>
import { storeToRefs } from "pinia";
import { ShieldCheck, ClipboardList, Save, Eraser } from "lucide-vue-next";
import { useAseguradoraStore } from "../store/aseguradoraStore.js";
import { alertaExito, alertaError, alertaConfirmacion } from "../utils/alertas.js";
import { mensajeError } from "../utils/errores.js";
import { useFormulario } from "../composables/useFormulario.js";
import { useCargaInicial } from "../composables/useCargaInicial.js";
import AppButton from "../components/ui/AppButton.vue";
import AppSection from "../components/ui/AppSection.vue";
import DataTable from "../components/ui/DataTable.vue";
import FormField from "../components/ui/FormField.vue";
import FormGrid from "../components/ui/FormGrid.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import RowActions from "../components/ui/RowActions.vue";

const store = useAseguradoraStore();
const { aseguradoras } = storeToRefs(store);

// El molde: todos los campos del formulario con su valor vacío
const ASEGURADORA_BALEIRA = { nome: "", telefono: "" };
const { datos, idEditando, resetear, cargar } = useFormulario(ASEGURADORA_BALEIRA);

// Qué columnas salen en la tabla
const columnas = [
  { clave: "nome", titulo: "Nome" },
  { clave: "telefono", titulo: "Telefono" },
];

// Al abrir la página se carga la lista
const { cargando, erro } = useCargaInicial(() => store.cargarAseguradoras());

async function gardar() {
  try {
    const editando = Boolean(idEditando.value);
    const guardado = await store.gardarAseguradora(idEditando.value, { ...datos });
    idEditando.value = guardado.id;
    alertaExito(editando ? "Aseguradora actualizada." : "Aseguradora gardada.");
  } catch (e) {
    alertaError(mensajeError(e, "Non se puido gardar a aseguradora."));
  }
}

async function eliminar(aseguradora) {
  const { isConfirmed } = await alertaConfirmacion(`Vas eliminar a ${aseguradora.nome}.`);
  if (!isConfirmed) return;
  try {
    await store.eliminarAseguradoraPorId(aseguradora.id);
    if (idEditando.value === aseguradora.id) resetear();
    alertaExito("Aseguradora eliminada.");
  } catch (e) {
    alertaError(mensajeError(e, "Non se puido eliminar a aseguradora."));
  }
}
</script>

<template>
  <PageHeader titulo="Aseguradoras" />

  <p v-if="erro" class="mb-4 text-sm text-danger">{{ erro }}</p>

  <AppSection titulo="Formulario de aseguradora" :icono="ShieldCheck">
    <FormGrid @enviar="gardar">
      <FormField label="Nome:">
        <input v-model="datos.nome" type="text" required>
      </FormField>
      <FormField label="Telefono:">
        <input v-model="datos.telefono" type="tel">
      </FormField>
      <template #acciones>
        <AppButton @click="resetear"><Eraser :size="16" /> Limpar</AppButton>
        <AppButton variante="primario" type="submit"><Save :size="16" /> Gardar</AppButton>
      </template>
    </FormGrid>
  </AppSection>

  <AppSection titulo="Listaxe de aseguradoras" :icono="ClipboardList">
    <DataTable
      :columnas="columnas"
      :filas="aseguradoras"
      :cargando="cargando"
      vacio="Non hai aseguradoras cargadas."
    >
      <template #acciones="{ fila }">
        <RowActions @editar="cargar(fila)" @eliminar="eliminar(fila)" />
      </template>
    </DataTable>
  </AppSection>
</template>
```

## Paso 7 · La ruta y el menú

En `src/router/index.js`, busca la línea `path: "/:pathMatch(.*)*",`. Es la entrada del error 404, que tiene que ir **la última**. Pega este bloque **justo encima del `{` que abre esa entrada**:

```js
  {
    path: "/xestion-aseguradoras",
    name: "xestion-aseguradoras",
    component: () => import("../views/XestionAseguradoras.vue"),
    meta: { titulo: "Aseguradoras", icono: ShieldCheck, menu: "principal" },
  },
```

`ShieldCheck` ya está importado arriba en ese fichero. Con `menu: "principal"` aparece solo en la barra de navegación.

## Paso 8 · Asignarlas a los pacientes

**8a.** En `backend/modelos/Paciente.js`, busca la línea `lopdpac: { type: Boolean, required: true },` y pega esto **justo debajo** (guarda el id de la aseguradora):

```js
        aseguradorapac: { type: String, default: '' },
```

Reinicia el backend.

**8b.** En `src/components/XestionPacientes.vue`, hay cuatro cambios.

Busca la línea `import { useMunicipioStore } from "../store/municipioStore.js";` y pega **justo debajo**:

```js
import { useAseguradoraStore } from "../store/aseguradoraStore.js";
```

Busca la línea `const municipioStore = useMunicipioStore();` y pega **justo debajo**:

```js
const aseguradoraStore = useAseguradoraStore();
const { aseguradoras } = storeToRefs(aseguradoraStore);
```

Busca la línea `lopdpac: false, // aceptación de la política de protección de datos (LOPD)` y pega **justo encima**:

```js
  aseguradorapac: "",
```

Busca la línea `Promise.all([pacienteStore.cargarPacientes(), municipioStore.cargarMunicipios()])` y **sustitúyela** por (carga también las aseguradoras):

```js
  Promise.all([
    pacienteStore.cargarPacientes(),
    municipioStore.cargarMunicipios(),
    aseguradoraStore.cargarAseguradoras(),
  ])
```

**8c.** El desplegable. Busca el comentario `<!-- Dirección postal -->` y pega **justo encima**:

```vue
      <FormField label="Aseguradora:">
        <select v-model="datos.aseguradorapac">
          <option value="">Sen aseguradora</option>
          <option v-for="a in aseguradoras" :key="a.id" :value="a.id">{{ a.nome }}</option>
        </select>
      </FormField>
```

**8d.** La columna, con el nombre y no el id. Busca la línea `{ clave: "munipac", titulo: "Municipio" },` y pega **justo debajo**:

```js
  { clave: "aseguradorapac", titulo: "Aseguradora", formato: (p) => aseguradoraStore.nombrePorId(p.aseguradorapac) },
```

## Qué deberías ver

1. Una opción «Aseguradoras» en el menú.
2. En esa página, el formulario y la tabla: crear, editar y eliminar funcionan.
3. Crear dos con el mismo nombre da una alerta «Xa existe unha aseguradora con ese nome». Ojo: el formulario no se vacía al guardar (se queda en modo edición, como en doctores y pacientes), así que para crear otra hay que pulsar «Limpar» primero. Editar una para ponerle el nombre de otra también da esa alerta.
4. En Pacientes, un desplegable «Aseguradora»; al guardar, la tabla muestra su nombre.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `Cannot GET /api/aseguradoras` o 404 | El Paso 3 no está, o no reiniciaste el backend |
| La página sale en blanco | Mira la consola (F12): un import mal escrito o un nombre distinto |
| La página existe pero no está en el menú | La entrada del Paso 7 no tiene `menu: "principal"`, o está después del 404 |
| La tabla de pacientes muestra «—» | Las aseguradoras no se cargan: falta el cambio del `Promise.all` del 8b |
| El desplegable no guarda | Falta `aseguradorapac` en el modelo (8a) o en el molde (8b) |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Camino de un dato | De la pantalla a MongoDB: vista, store, api, ruta, modelo | `01_arquitectura/README.md` |
| Schema de Mongoose | La forma de los documentos y sus validaciones | `03_lecciones/03_crud_api_rest.md §4` |
| Router de Express | Rutas agrupadas, y cómo leer `req.query` y `req.params` | `03_lecciones/03_crud_api_rest.md §3` |
| axios | Llamar a la API desde Vue | `03_lecciones/03_crud_api_rest.md §5` |
| Store de Pinia | Un objeto compartido entre páginas, con estado y acciones | `03_lecciones/07_pinia.md §4` |

## Guías relacionadas

- [Guía: endpoint nuevo](../../guias/endpoint-nuevo.md)
- [Guía: pantalla nueva](../../guias/pantalla-nueva.md)

# Citas con el nombre del doctor y del paciente

`GET /api/citas/detalle` devuelve cada cita con su doctor y su paciente dentro, en una sola petición. Así el front no necesita cargar las tres listas para pintar nombres.

**Antes de empezar:** arranca el proyecto (`npm start`). El backend no recarga solo: reinícialo al terminar.

## La idea

`doctorId` es una **referencia** a otro documento: `populate` lo sustituye por el doctor. El paciente no es una referencia (la cita guarda su DNI, un texto), así que se pide aparte con una segunda consulta.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/rutas/citas.rutas.js` | La ruta nueva y un import |

## Paso 1 · Importar el modelo de paciente

En `backend/rutas/citas.rutas.js`, busca la línea `import Cita from '../modelos/Cita.js'` y pega **justo debajo**:

```js
import Paciente from '../modelos/Paciente.js'
```

## Paso 2 · La ruta

En `backend/rutas/citas.rutas.js`, busca el comentario `// Una cita por su id.` y pega esto **justo encima**. Tiene que ir antes de `/:id`: si no, Express tomaría «detalle» por un id.

```js
// Citas con el doctor y el paciente dentro
router.get('/detalle', async (req, res) => {
    const citas = await Cita.find()
        .sort({ fecha: 1, hora: 1 })
        // populate sustituye doctorId por el doctor, trayendo solo esos campos
        .populate('doctorId', 'nomedoc apeldoc espedoc')
        // lean() devuelve objetos simples, más rápidos (pero sin toJSON: el id se añade a mano)
        .lean()

    // El paciente no es una referencia: se piden todos los que hacen falta de una vez ($in)
    const dnis = [...new Set(citas.map((c) => c.pacienteDNI))]
    const pacientes = await Paciente.find({ dnipac: { $in: dnis } }, 'dnipac nomepac apelpac').lean()
    const porDni = Object.fromEntries(pacientes.map((p) => [p.dnipac, p]))

    res.json(
        citas.map((c) => ({ ...c, id: String(c._id), doctor: c.doctorId, paciente: porDni[c.pacienteDNI] ?? null }))
    )
})

```

**Reinicia el backend.**

## Qué deberías ver

```bash
curl localhost:3000/api/citas/detalle
```

Cada cita trae `doctor: { nomedoc, apeldoc, espedoc }`, `paciente: { dnipac, nomepac, apelpac }` y su `id`, además de los campos de siempre.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `Identificador non válido` | La ruta quedó después de `/:id`: súbela encima del comentario `// Una cita por su id.` |
| `paciente: null` en todas | Los DNI de las citas no coinciden con los de los pacientes |
| `Paciente is not defined` | Falta el Paso 1 |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `ref` y `populate` | Sustituir una referencia por el documento al que apunta | `03_lecciones/03_crud_api_rest.md §4` |
| Router de Express | Rutas agrupadas, y cómo leer `req.query` y `req.params` | `03_lecciones/03_crud_api_rest.md §3` |

## Guías relacionadas

- [Guía: endpoint nuevo](../../guias/endpoint-nuevo.md)

# Resumen con aggregate

`GET /api/citas/resumen` devuelve cuántas citas hay por estado y por doctor. Lo calcula MongoDB, sin traer todas las citas al servidor.

**Antes de empezar:** arranca el proyecto (`npm start`). El backend no recarga solo: reinícialo al terminar.

## La idea

`aggregate` recibe una lista de **etapas** que se aplican en orden. `$group` junta los documentos por el valor de `_id` y `$sum: 1` cuenta uno por cada documento. Es la etapa más útil de `aggregate` y la que suele bastar para un resumen.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/rutas/citas.rutas.js` | La ruta nueva |

## Paso 1 · La ruta

En `backend/rutas/citas.rutas.js`, busca el comentario `// Una cita por su id.` y pega esto **justo encima**. Tiene que ir antes de `/:id`.

```js
// Totales por estado y por doctor
router.get('/resumen', async (req, res) => {
    // Promise.all lanza las dos consultas a la vez
    const [porEstado, porDoctor] = await Promise.all([
        // '$estado' (con dólar) es el valor del campo estado de cada documento
        Cita.aggregate([{ $group: { _id: '$estado', total: { $sum: 1 } } }]),
        // $sort ordena los grupos: -1 = de más a menos citas
        Cita.aggregate([{ $group: { _id: '$doctorId', total: { $sum: 1 } } }, { $sort: { total: -1 } }]),
    ])
    res.json({ porEstado, porDoctor })
})

```

**Reinicia el backend.**

## Qué deberías ver

```bash
curl localhost:3000/api/citas/resumen
```

```json
{"porEstado":[{"_id":"confirmada","total":15}],"porDoctor":[{"_id":"6afc...","total":4}]}
```

En `porDoctor` sale el id; el nombre se traduce en el front con `doctorStore.nombrePorId`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `Identificador non válido` | La ruta quedó después de `/:id` |
| Todos los grupos con `_id: null` | Escribiste `'estado'` en vez de `'$estado'`: sin el dólar es un texto fijo |
| El orden no es el esperado | `$group` no ordena; hace falta la etapa `$sort` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `aggregate` | Calcular totales y agrupaciones en MongoDB | No está en las lecciones; se explica en esta receta |
| Consultas de Mongoose | `find`, `sort`, `skip`, `limit`, `countDocuments`... |

## Guías relacionadas

- [Guía: endpoint nuevo](../../guias/endpoint-nuevo.md)

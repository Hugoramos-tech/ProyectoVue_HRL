# Ordenar en el backend

`GET /api/citas?sort=hora&dir=desc` devuelve las citas ordenadas por el campo y en el sentido que se pida.

**Antes de empezar:** arranca el proyecto (`npm start`). El backend no recarga solo: reinícialo al terminar.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/rutas/citas.rutas.js` | Leer `sort` y `dir` y ordenar |

## Paso 1 · La ruta

En `backend/rutas/citas.rutas.js`, busca la línea `const citas = await Cita.find(filtros).sort({ fecha: 1, hora: 1 }).lean()` y **sustitúyela** por:

```js
    // Solo se puede ordenar por estos campos: sin la lista, cualquiera ordenaría por lo que quisiera
    const CAMPOS_ORDEN = ['fecha', 'hora', 'estado', 'motivo']
    const campo = CAMPOS_ORDEN.includes(req.query.sort) ? req.query.sort : 'fecha'
    // 1 = ascendente (de menor a mayor); -1 = descendente
    const sentido = req.query.dir === 'desc' ? -1 : 1
    // Los corchetes [campo] usan el VALOR de la variable como nombre de la propiedad.
    // _id desempata, siempre en el mismo orden.
    const citas = await Cita.find(filtros).sort({ [campo]: sentido, _id: 1 }).lean()
```

Si ya hiciste la receta de **paginación**, esa línea será `const consulta = Cita.find(filtros).sort({ fecha: 1, hora: 1 })`: sustitúyela igualmente por el bloque de arriba, pero cambiando la última línea por `const consulta = Cita.find(filtros).sort({ [campo]: sentido, _id: 1 })`.

**Reinicia el backend.**

## Qué deberías ver

```bash
curl "localhost:3000/api/citas?sort=hora&dir=desc"   # de la hora más tarde a la más temprana
curl "localhost:3000/api/citas?sort=hora"            # de la más temprana a la más tarde
curl "localhost:3000/api/citas?sort=loquesea"        # ordena por fecha, sin dar error
```

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Siempre sale en el mismo orden | No reiniciaste el backend |
| `desc` no invierte cuando ordenas por `hora` | Dejaste `hora: 1` como desempate en el mismo objeto: pisa a la clave de orden. El desempate es `_id` |
| Error 500 | Un `}` o un paréntesis de menos al pegar: mira la terminal del backend |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Consultas de Mongoose | `find`, `sort`, `skip`, `limit`, `countDocuments`... | `03_lecciones/03_crud_api_rest.md §4` |
| Router de Express | Rutas agrupadas, y cómo leer `req.query` y `req.params` | `03_lecciones/03_crud_api_rest.md §3` |

## Guías relacionadas

- [Guía: endpoint nuevo](../../guias/endpoint-nuevo.md)

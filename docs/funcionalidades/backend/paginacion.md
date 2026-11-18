# Paginación en el backend

`GET /api/citas?page=2&limit=5` devuelve solo 5 citas, las de la segunda página, y el total en una cabecera. Sin `limit` devuelve todas, como antes: el resto de la web no se rompe.

**Antes de empezar:** arranca el proyecto (`npm start`). El backend no recarga solo: reinícialo al terminar.

## La idea

El total de citas viaja en una cabecera, `X-Total-Count`, y el cuerpo sigue siendo un array. Así no cambia la forma de la respuesta.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/rutas/citas.rutas.js` | Paginar el listado |
| `backend/server.js` | Dejar que el navegador lea la cabecera |
| `src/api/citas.js` | Leerla desde el front (opcional) |

## Paso 1 · La ruta

En `backend/rutas/citas.rutas.js`, busca estas dos líneas dentro de `router.get('/', ...)` y **sustitúyelas** por el bloque de debajo:

```js
    const citas = await Cita.find(filtro).sort({ fecha: 1, hora: 1 })
    res.json(citas)
```

```js
    const consulta = Cita.find(filtro).sort({ fecha: 1, hora: 1 })

    // ?page=2&limit=5. Los Math.max y Math.min evitan valores raros (páginas negativas o un
    // limit=100000). Sin limit no se pagina.
    const pagina = Math.max(parseInt(req.query.page) || 1, 1)
    const limite = Math.min(Math.max(parseInt(req.query.limit) || 0, 0), 100)
    if (limite) {
        // El total (con el filtro aplicado) viaja en una cabecera
        res.set('X-Total-Count', await Cita.countDocuments(filtro))
        // skip se salta las citas de las páginas anteriores; limit coge solo las de esta
        consulta.skip((pagina - 1) * limite).limit(limite)
    }

    res.json(await consulta)
```

## Paso 2 · Permitir leer la cabecera

El navegador solo deja leer cabeceras de otro origen si el servidor las declara. En `backend/server.js`, busca la línea `app.use(cors());` y **sustitúyela** por:

```js
app.use(cors({ exposedHeaders: ["X-Total-Count"] }));
```

**Reinicia el backend.**

## Paso 3 · Leer el total desde el front (opcional)

Desde cualquier función con axios, el total está en `headers` (axios las pone en minúsculas):

```js
const respuesta = await axios.get(URL, { params: { page: 2, limit: 5 } });
const total = Number(respuesta.headers["x-total-count"]);
const paginas = Math.ceil(total / 5);
```

## Qué deberías ver

```bash
curl -i "localhost:3000/api/citas?limit=2&page=1"
```

La respuesta incluye `X-Total-Count: 15` (o el total que tengas) y solo 2 citas en el cuerpo. Con `page=2`, las siguientes 2. Sin `limit`, todas y sin cabecera.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Siempre llegan todas | No reiniciaste el backend, o no pusiste `limit` en la URL |
| `respuesta.headers` no muestra la cabecera | Falta el Paso 2 (`exposedHeaders`) |
| El total no coincide con el filtro | Contaste sin pasar `filtro` a `countDocuments` |
| Las páginas repiten citas | Falta un orden fijo: el `sort` del Paso 1 debe estar |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Consultas de Mongoose | `find`, `sort`, `skip`, `limit`, `countDocuments`... | `03_lecciones/03_crud_api_rest.md §4` |
| Router de Express | Rutas agrupadas, y cómo leer `req.query` y `req.params` | `03_lecciones/03_crud_api_rest.md §3` |
| axios | Llamar a la API desde Vue | `03_lecciones/03_crud_api_rest.md §5` |

## Guías relacionadas

- [Guía: endpoint nuevo](../../guias/endpoint-nuevo.md)

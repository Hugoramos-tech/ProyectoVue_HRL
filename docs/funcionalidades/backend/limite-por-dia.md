# Límite de citas por doctor y día

Un doctor no puede tener más de 8 citas en un mismo día. Al llegar al máximo, el servidor responde `409`.

**Antes de empezar:** el backend no recarga solo: reinícialo al terminar.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/rutas/citas.rutas.js` | La comprobación al crear una cita |

## Paso 1 · La comprobación

En `backend/rutas/citas.rutas.js`, busca la línea `router.post('/', async (req, res) => {` y pega esto **justo debajo**:

```js
    // Máximo de citas por doctor y día
    const MAX_CITAS_DIA = 8
    const ocupadas = await Cita.countDocuments({
        doctorId: req.body.doctorId,
        fecha: req.body.fecha,
        estado: { $ne: 'cancelada' },
    })
    if (ocupadas >= MAX_CITAS_DIA) {
        return res.status(409).json({ error: 'O doctor xa ten o máximo de citas ese día' })
    }

```

Qué hace: cuenta las citas de ese doctor ese día que no estén canceladas. Si ya hay 8 o más, corta con `409` (conflicto). El front enseña el mensaje porque `gardarCita` usa `mensajeError(e)`.

**Ojo:** el límite se comprueba también cuando la cita que llega es una cancelada: en un día lleno, no se puede crear ni una cancelada. Si no quieres eso, envuelve la comprobación en `if (req.body.estado !== 'cancelada') { ... }`.

**Reinicia el backend.**

## Qué deberías ver

Para probarlo rápido, pon `MAX_CITAS_DIA = 2`. Las dos primeras citas del día se crean; la tercera da `409` con ese mensaje; una cita de otro día se acepta.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Deja crear más de las permitidas | Usaste `>` en vez de `>=`, o no reiniciaste el backend |
| Cuenta las canceladas | Falta `estado: { $ne: 'cancelada' }` |
| Al editar una cita y cambiarle el día no se comprueba | Esta receta solo vigila `POST`; el `PUT` necesitaría el mismo control |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Consultas de Mongoose | `find`, `sort`, `skip`, `limit`, `countDocuments`... | `03_lecciones/03_crud_api_rest.md §4` |
| REST y códigos de estado | Qué significan 200, 201, 204, 400, 404 y 409 | `03_lecciones/03_crud_api_rest.md §2` |

## Guías relacionadas

- [Guía: endpoint nuevo](../../guias/endpoint-nuevo.md)

# Citas de un paciente: `/api/pacientes/:id/citas`

Una ruta anidada que devuelve las citas de un paciente a partir de su id. Las citas guardan el DNI, no el id, así que primero hay que buscar al paciente.

**Antes de empezar:** arranca el proyecto (`npm start`). El backend no recarga solo: reinícialo al terminar.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/rutas/pacientes.rutas.js` | La ruta nueva (el modelo `Cita` ya está importado) |

## Paso 1 · La ruta

En `backend/rutas/pacientes.rutas.js`, busca el comentario `// Un paciente por su id.` y pega esto **justo encima**:

```js
// Las citas de un paciente por su id (las citas guardan el DNI, no el id)
router.get('/:id/citas', async (req, res) => {
    const paciente = await Paciente.findById(req.params.id)
    if (!paciente) {
        return res.status(404).json({ error: 'Paciente non atopado' })
    }
    res.json(await Cita.find({ pacienteDNI: paciente.dnipac }).sort({ fecha: 1, hora: 1 }))
})

```

No choca con `/:id` porque esta ruta tiene un tramo más. **Reinicia el backend.**

## Qué deberías ver

```bash
curl localhost:3000/api/pacientes            # copia el "id" de un paciente
curl localhost:3000/api/pacientes/<id>/citas # sus citas
curl -i localhost:3000/api/pacientes/000000000000000000000000/citas   # 404
```

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Siempre lista vacía | Buscas con `paciente.id` en vez de `paciente.dnipac`: las citas guardan el DNI |
| `Identificador non válido` | El id de la URL no tiene 24 caracteres hexadecimales |
| 404 de «Ruta non atopada» | No reiniciaste el backend |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Router de Express | Rutas agrupadas, y cómo leer `req.query` y `req.params` | `03_lecciones/03_crud_api_rest.md §3` |
| REST y códigos de estado | Qué significan 200, 201, 204, 400, 404 y 409 | `03_lecciones/03_crud_api_rest.md §2` |

## Guías relacionadas

- [Guía: endpoint nuevo](../../guias/endpoint-nuevo.md)

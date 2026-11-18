# Borrado en cascada

Al borrar un paciente se borran también sus citas. Hoy tu servidor hace lo contrario: rechaza el borrado si el paciente tiene citas.

**Antes de empezar:** el backend no recarga solo: reinícialo al terminar.

## Cascada o rechazo: cuál elegir

| | Rechazar (lo actual) | Cascada |
|---|---|---|
| Si borras sin querer | No pierdes nada | Pierdes las citas |
| Datos huérfanos | Ninguno | Ninguno |
| Cuándo | El enunciado no dice nada | El enunciado pide que se borren con él |

Si el enunciado habla de «eliminar igualmente», es la cascada. Si no dice nada, deja lo que tienes.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/rutas/pacientes.rutas.js` | Cambiar el rechazo por el borrado de las citas |

## Paso 1 · La ruta

En `backend/rutas/pacientes.rutas.js`, dentro de `router.delete('/:id', ...)`, busca la línea `if (await Cita.exists({ pacienteDNI: paciente.dnipac })) {`. **Borra ese bloque entero** (el comentario de dos líneas que tiene encima, el `if` y su `return` y el `}`): son estas líneas:

```js
    // No se borra un paciente con citas: quedarían citas apuntando a alguien que ya no existe.
    // Las citas guardan el DNI del paciente, no su id.
    if (await Cita.exists({ pacienteDNI: paciente.dnipac })) {
        return res.status(409).json({ error: 'Non se pode eliminar: o paciente ten citas' })
    }
```

Y en su lugar pega:

```js
    // Borrado en cascada: sus citas se borran con él (guardan el DNI, no el id)
    await Cita.deleteMany({ pacienteDNI: paciente.dnipac })
```

La línea `await Paciente.findByIdAndDelete(req.params.id)` que sigue se queda como está. **Reinicia el backend.**

## Qué deberías ver

Un paciente con citas: antes daba `409`, ahora `204` (borrado sin contenido), y `GET /api/citas` ya no trae sus citas.

Para los doctores es igual: en `backend/rutas/doctores.rutas.js`, `Cita.deleteMany({ doctorId: req.params.id })`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Sigue dando 409 | No reiniciaste el backend, o dejaste el `if` antiguo |
| Borra el paciente pero quedan citas | Buscas por `pacienteId` o `paciente.id`: las citas guardan `pacienteDNI` |
| En la web la tabla de citas sigue mostrando las citas borradas | El `citaStore` conserva la lista hasta que recarga: recarga la página |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Consultas de Mongoose | `find`, `sort`, `skip`, `limit`, `countDocuments`... | `03_lecciones/03_crud_api_rest.md §4` |
| REST y códigos de estado | Qué significan 200, 201, 204, 400, 404 y 409 | `03_lecciones/03_crud_api_rest.md §2` |

# Un paciente no puede tener dos citas a la misma hora

El servidor responde `409` si se intenta dar a un paciente una cita a una fecha y hora en la que ya tiene otra (con cualquier doctor). Las canceladas no cuentan. La web ya enseña ese mensaje en una alerta.

**Antes de empezar:** el backend no recarga solo: reinícialo al terminar (`npm start`).

## La idea

El proyecto ya impide que un **doctor** tenga dos citas a la vez, con la función `doctorLibre`. Aquí se hace lo mismo con el **paciente**, con una consulta parecida: ¿existe ya una cita de ese DNI, en esa fecha y hora, que no esté cancelada?

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/rutas/citas.rutas.js` | La comprobación al crear y al editar |

## Paso 1 · La función

En `backend/rutas/citas.rutas.js`, busca la línea `// Listado de citas, ordenadas por fecha y hora. Acepta ?doctor=<id> y ?paciente=<id>.` y pega esto **justo encima**:

```js
// Un paciente no puede tener dos citas a la misma fecha y hora. Las canceladas no cuentan, y
// `idActual` deja fuera a la propia cita cuando se edita. Devuelve true si el paciente está libre.
async function pacienteLibre({ pacienteDNI, fecha, hora, estado }, idActual = null) {
    // Una cita cancelada no ocupa hora: no hay nada que comprobar
    if (estado === 'cancelada') return true
    // exists devuelve algo si hay AL MENOS una cita con esos datos, y null si no hay ninguna
    const otra = await Cita.exists({
        pacienteDNI: String(pacienteDNI ?? '').toUpperCase(), // el DNI se guarda en mayúsculas
        fecha,
        hora,
        estado: { $ne: 'cancelada' }, // $ne = "not equal": las que NO están canceladas
        _id: { $ne: idActual },       // y que no sean la propia cita que se está editando
    })
    // Libre = no se encontró ninguna
    return !otra
}
```

## Paso 2 · Al crear

Busca la línea `const cita = await Cita.create(req.body)` y pega esto **justo encima**:

```js
    // Al crear: se juntan los datos que llegan con estado "pendente" por defecto. Si no está libre: 409.
    // 409 = Conflict: el dato choca con otro que ya existe.
    if (!(await pacienteLibre({ estado: 'pendente', ...req.body }))) {
        return res.status(409).json({ error: 'O paciente xa ten unha cita a esa data e hora' })
    }
```

## Paso 3 · Al editar

Busca la línea `const cita = await Cita.findByIdAndUpdate(req.params.id, req.body, {` y pega esto **justo encima**:

```js
    // Al editar: los datos nuevos (req.body) se ponen encima de los que ya tenía la cita (actual).
    // Así se comprueba el resultado final, aunque solo se cambie la hora. `actual._id` deja fuera la propia cita.
    if (!(await pacienteLibre({ ...actual.toObject(), ...req.body }, actual._id))) {
        return res.status(409).json({ error: 'O paciente xa ten unha cita a esa data e hora' })
    }
```

**Reinicia el backend** y prueba:

```bash
curl -X POST localhost:3000/api/citas -H 'content-type: application/json' -d '{"pacienteDNI":"12345678Z","doctorId":"<ID_DOCTOR_A>","fecha":"2026-12-01","hora":"10:00","motivo":"Revisión"}'
curl -X POST localhost:3000/api/citas -H 'content-type: application/json' -d '{"pacienteDNI":"12345678Z","doctorId":"<ID_DOCTOR_B>","fecha":"2026-12-01","hora":"10:00","motivo":"Otra"}'
```

El segundo debe dar `409` aunque el doctor sea otro.

## Qué deberías ver

1. Dos citas del mismo paciente a la misma hora con doctores distintos: la segunda da `409` «O paciente xa ten unha cita a esa data e hora».
2. En la web, esa frase sale en la alerta roja al guardar.
3. Con otra hora, o con una cita cancelada, se crea sin problema.
4. Editar una cita sin cambiarle la hora no da error contra sí misma.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Deja crear las dos | No reiniciaste el backend, o el Paso 2 está en otro sitio |
| Una cita choca consigo misma al editar | Falta `_id: { $ne: idActual }` o `actual._id` en el Paso 3 |
| `actual is not defined` | El Paso 3 se pegó antes de que exista `actual` (debe ir después de `findById`) |
| Con DNI en minúsculas no detecta el choque | Falta `.toUpperCase()` |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Código `409` | Conflicto: el dato choca con otro | `03_lecciones/03_crud_api_rest.md §3` |
| `Model.exists` | Preguntar si hay algún documento que cumpla algo | `03_lecciones/03_crud_api_rest.md §4` |

## Guías relacionadas

- [Guía: validación nueva](../../guias/validacion-nueva.md)
- [Índice único](../backend/indice-unico.md)
- [Límite de citas por día](../backend/limite-por-dia.md)

# Índice único: un doctor no repite fecha y hora

La ruta ya comprueba que el doctor esté libre. Un índice único hace que sea MongoDB quien lo garantice, también si dos peticiones llegan a la vez.

**Antes de empezar:** el backend no recarga solo: reinícialo al terminar. Si ya hay citas duplicadas en la base, el índice no se puede crear (mira la terminal del backend).

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/modelos/Cita.js` | Declarar el índice |

## Paso 1 · El índice

En `backend/modelos/Cita.js`, busca el comentario `// Crea el modelo 'Cita' a partir del schema; es el que importan las rutas.` y pega esto **justo encima**:

```js
// Un doctor no puede repetir fecha y hora. Un índice con varios campos es "compuesto": lo que no
// puede repetirse es la combinación de los tres. partialFilterExpression limita el índice a las
// citas no canceladas, para que una cancelada no bloquee volver a usar esa hora (MongoDB no
// admite $ne ahí, por eso se enumeran los estados). Al violarlo salta el error 11000, que el
// middleware de server.js ya convierte en un 409.
CitaSchema.index(
    { doctorId: 1, fecha: 1, hora: 1 },
    { unique: true, partialFilterExpression: { estado: { $in: ['pendente', 'confirmada', 'realizada'] } } }
)

```

**Reinicia el backend:** Mongoose crea el índice al arrancar.

## Qué deberías ver

1. Crear dos citas del mismo doctor a la misma fecha y hora, sin cancelar, da `409`.
2. Una cita **cancelada** sobre esa misma fecha y hora se acepta.
3. Para ver el índice: `docker exec mongodb mongosh "mongodb://admin:abc123@localhost:27017/bbdd?authSource=admin" --eval 'db.citas.getIndexes()'` muestra `doctorId_1_fecha_1_hora_1`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El índice no aparece | Hay citas duplicadas en la base; bórralas y reinicia |
| Error al arrancar sobre `partialFilterExpression` | Usaste `$ne`: MongoDB lo rechaza; usa `$in` con los estados |
| No cambia nada | La ruta ya devolvía 409 por su propia comprobación: el índice protege de dos peticiones simultáneas |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Schema de Mongoose | La forma de los documentos y sus validaciones | `03_lecciones/03_crud_api_rest.md §4` |
| REST y códigos de estado | Qué significan 200, 201, 204, 400, 404 y 409 | `03_lecciones/03_crud_api_rest.md §2` |

## Guías relacionadas

- [Guía: validación nueva](../../guias/validacion-nueva.md)

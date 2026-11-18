# Búsqueda en el servidor

`GET /api/pacientes?q=lopez` busca en nombre, apellidos y DNI, sin distinguir mayúsculas ni tildes: con `lopez` encuentra a «López».

**Antes de empezar:** arranca el proyecto (`npm start`). El backend no recarga solo: reinícialo al terminar.

## La idea

La búsqueda usa una **expresión regular** (un patrón de texto). Tiene dos trampas que esta receta resuelve: los caracteres especiales (`(`, `.`, `*`) romperían la consulta si el usuario los escribe, y una regex con la opción `i` ignora mayúsculas pero **no tildes**.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/rutas/pacientes.rutas.js` | Las funciones de ayuda y el filtro |

## Paso 1 · Las funciones de ayuda

En `backend/rutas/pacientes.rutas.js`, busca el comentario `// Listado completo de pacientes, ordenado por apellidos y después por nombre.` y pega esto **justo encima**:

```js
// Escapa los caracteres que en una regex significan algo: sin esto, buscar "(" daría error
const escapar = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Para que "lopez" encuentre "López": se quitan las tildes de lo escrito y cada vocal (y la n)
// se cambia por una clase que acepta sus variantes con tilde.
const VARIANTES = { a: '[aáàä]', e: '[eéèë]', i: '[iíìï]', o: '[oóòö]', u: '[uúùü]', n: '[nñ]' }
const patron = (texto) =>
    escapar(texto.trim().normalize('NFD').replace(/[̀-ͯ]/g, ''))
        .replace(/[aeioun]/gi, (letra) => VARIANTES[letra.toLowerCase()])

```

## Paso 2 · El filtro en la ruta

En `backend/rutas/pacientes.rutas.js`, busca la línea `const pacientes = await Paciente.find().lean()` y **sustitúyela** por:

```js
    const filtro = {}
    // ?q=lopez: busca (sin distinguir mayúsculas) en nombre, apellidos y DNI.
    // $or = vale si se cumple cualquiera de las condiciones.
    if (req.query.q) {
        const texto = new RegExp(patron(req.query.q), 'i')
        filtro.$or = [{ nomepac: texto }, { apelpac: texto }, { dnipac: texto }]
    }
    const pacientes = await Paciente.find(filtro).lean()
```

**Reinicia el backend.**

## Qué deberías ver

Con una paciente «Lucía López Vázquez»:

```bash
curl "localhost:3000/api/pacientes?q=lopez"     # la encuentra
curl "localhost:3000/api/pacientes?q=LÓPEZ"     # la encuentra
curl "localhost:3000/api/pacientes?q=lucia"     # la encuentra
curl -G localhost:3000/api/pacientes --data-urlencode "q=("   # lista vacía, sin error
```

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Error 500 al buscar `(` | Falta `escapar`, o no se usa dentro de `patron` |
| `lopez` no encuentra «López» | Falta la parte de `VARIANTES` o el `normalize('NFD')` |
| Devuelve siempre todos | No reiniciaste el backend, o el `q` no llega: revisa la URL |
| `patron is not defined` | El bloque del Paso 1 está dentro de otra función; debe ir fuera, encima de la ruta |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Consultas de Mongoose | `find`, `sort`, `skip`, `limit`, `countDocuments`... | `03_lecciones/03_crud_api_rest.md §4` |
| Router de Express | Rutas agrupadas, y cómo leer `req.query` y `req.params` | `03_lecciones/03_crud_api_rest.md §3` |

## Guías relacionadas

- [Guía: filtro nuevo](../../guias/filtro-nuevo.md)

# Log de peticiones

Un middleware que escribe en la terminal cada petición que llega al servidor, con su método, URL, código de respuesta y tiempo. Sirve para ver qué llega sin abrir las herramientas del navegador.

**Antes de empezar:** el backend no recarga solo: reinícialo al terminar.

## La idea

Un **middleware** es una función que se ejecuta antes de las rutas. Recibe `req`, `res` y `next`; llamar a `next()` pasa el control a lo siguiente. Tiene que ir **antes** de las rutas, porque si una ruta ya respondió, el middleware nunca se ejecuta.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/server.js` | El middleware |

## Paso 1 · El middleware

En `backend/server.js`, busca la línea `app.use(express.json());` y pega esto **justo encima**:

```js
// Log de cada petición: método, URL, código de respuesta y milisegundos
app.use((req, res, next) => {
    const inicio = Date.now()
    // 'finish' se emite cuando la respuesta ya se ha enviado: así se puede leer su código
    res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - inicio}ms`))
    next()
})

```

**Reinicia el backend.**

## Qué deberías ver

En la terminal del backend, una línea por petición mientras usas la web:

```
GET /api/pacientes 200 4ms
GET /api/citas?paciente=44606635K 200 3ms
POST /api/citas 409 6ms
```

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Las peticiones se quedan colgadas | Falta `next()` |
| No sale ninguna línea | El middleware está después de las rutas, o no reiniciaste |
| Todos salen con 200 | Lees `res.statusCode` sin esperar a `finish` |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Middleware | Funciones que se ejecutan antes de las rutas | `03_lecciones/03_crud_api_rest.md §3` |

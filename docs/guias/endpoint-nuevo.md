# Endpoint u operación nueva

Cuatro capas, y el truco está en **probar cada una antes de pasar a la siguiente**. Así sabes
exactamente dónde está el fallo en vez de buscarlo en las cuatro a la vez.

```
Componente  ->  src/api/<recurso>.js  ->  backend/rutas/  ->  backend/modelos/  ->  MongoDB
```

**No hay store en medio.** En este proyecto el componente llama directamente a la función de
`src/api/`. Los dos stores que existen guardan solo quién está seleccionado.

## 1. La ruta en Express

En `backend/rutas/<recurso>.rutas.js`. Copia la forma de las que ya hay:

```js
// GET /api/pacientes/provincia/:provincia: los pacientes de una provincia.
router.get("/provincia/:provincia", async (req, res) => {
    try {
        const pacientes = await Paciente.find({ propac: req.params.provincia }).lean()
        res.json(pacientes)
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar los pacientes de la provincia" })
    }
})
```

Tres cosas que no se negocian:

- **`try`/`catch` siempre.** Una excepción sin capturar en una función `async` deja la
  petición colgada: el navegador espera hasta que caduca y no sale ningún error claro.
- **La clave del error se llama `mensaje`.** Con cualquier otra, los componentes no lo leen.
- **Cuidado con el orden.** Express prueba las rutas de arriba abajo. Una ruta con parámetro
  (`/:dni`, `/:especialidad`) acepta cualquier valor, así que todo lo que sea más concreto
  tiene que ir **antes**. Si pones `/provincia/:provincia` después de `/:dni`, nunca se
  alcanza: Express entiende que el DNI es "provincia".

**Reinicia el backend.** No recarga solo.

**Pruébalo sin tocar nada más**, en la barra del navegador:

```
http://localhost:3000/api/pacientes/provincia/Pontevedra
```

Si sale JSON, esta capa está hecha. Si no, el problema está aquí y no en Vue.

## 2. La función en `src/api/`

```js
// Pide los pacientes de una provincia concreta.
export async function getPacientesPorProvincia(provincia) {
  const respuesta = await axios.get(`${API_URL}/provincia/${provincia}`)
  return respuesta.data
}
```

Dos detalles de la casa:

- **Devuelve `respuesta.data`**, no la respuesta entera. El componente espera la lista.
- **No captura el error.** Lo deja subir para que el componente decida qué alerta mostrar.

Si el parámetro va en la URL como filtro (`?algo=valor`), no lo pegues a mano: pasa un objeto
y deja que axios lo convierta.

```js
export async function getCitas(filtros = {}) {
  const respuesta = await axios.get(API_URL, { params: filtros })
  return respuesta.data
}
```

Esa es la forma que ya tiene `getCitas`, y es la razón de que **para añadir un filtro nuevo
solo haya que tocar Express**: la función de `src/api/` ya sirve para cualquier parámetro.

## 3. Importarla en el componente

```js
import { getPacientesPorProvincia } from "../api/pacientes.js"
```

La extensión `.js` es obligatoria: el proyecto usa módulos ES.

## 4. Llamarla

```js
async function cargarPorProvincia(provincia) {
  cargando.value = true
  try {
    pacientes.value = await getPacientesPorProvincia(provincia)
  } catch (error) {
    alertaError(mensaxeDoErro(error, "No se pudieron cargar los pacientes."))
  } finally {
    // finally se ejecuta pase lo que pase: asi el "cargando" nunca se queda encendido.
    cargando.value = false
  }
}
```

El `finally` no es adorno: sin él, cuando la petición falla el indicador de carga se queda
puesto para siempre.

## Cuándo hacerlo en el servidor y cuándo en la web

Es la pregunta que acompaña a esta tarea:

| Hazlo en el servidor | Hazlo en la web |
|---|---|
| Hay muchos registros y solo quieres unos pocos | La lista ya está cargada entera |
| El filtro tiene que ser fiable (seguridad) | Es solo una comodidad al mirar |
| Necesitas contar, agrupar o paginar | Un buscador que reacciona a cada tecla |
| Quieres aprovechar un índice de MongoDB | Quieres que responda sin esperar |

En un proyecto de este tamaño filtrar en la web va bien y es más rápido de escribir. En uno
real, con miles de registros, se filtra en el servidor. Las dos respuestas valen si sabes
decir por qué.

## Si algo falla

| Síntoma | Causa |
|---|---|
| `404` en el navegador | La ruta no existe, o el backend no se reinició |
| Responde otra ruta | El orden: una ruta con parámetro la está interceptando |
| La petición se queda colgada | Falta el `try`/`catch` en la ruta |
| `503` | No hay base de datos: mira el `.env` |
| `CastError` | Se pasó un DNI donde se esperaba un `_id`, o al revés |
| `undefined` en la pantalla | Falta el `return respuesta.data` |
| El indicador de carga no se apaga | Falta el `finally` |

## Recetas relacionadas

- [Filtrar en el servidor](../funcionalidades/backend/filtro-en-backend.md)
- [Búsqueda por texto](../funcionalidades/backend/busqueda.md)
- [Paginación](../funcionalidades/backend/paginacion.md)
- [Orden configurable](../funcionalidades/backend/orden.md)
- [Entidad nueva con CRUD completo](../funcionalidades/datos/entidad-nueva.md)
- [La API, endpoint por endpoint](../backend/api.md)

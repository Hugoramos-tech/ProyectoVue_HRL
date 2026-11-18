# API REST

Todas las rutas cuelgan de `http://localhost:3000/api`. El puerto sale de `PORT` en el
`.env`, y los ficheros de `src/api/` lo tienen escrito a mano.

## Pacientes · se identifican por el **DNI**

| Método y ruta | Qué hace | Función en `src/api/pacientes.js` |
|---|---|---|
| `GET /api/pacientes` | Todos | `getPacientes()` |
| `GET /api/pacientes/:dni` | Uno por su DNI | `getPacienteByDni(dni)` |
| `POST /api/pacientes` | Crear | `savePaciente(paciente)` |
| `PUT /api/pacientes/:dni` | Modificar | `modifyPaciente(dni, paciente)` |
| `DELETE /api/pacientes/:dni` | Borrar | `deletePaciente(dni)` |

El `POST` normaliza el DNI (mayúsculas, sin espacios) y el móvil (sin espacios), comprueba
que el móvil empiece por 6 o 7 y tenga 9 dígitos, y rechaza con `409` un DNI que ya exista.

El `GET /` mantiene compatibilidad con un campo antiguo, `nompac`: si un documento viejo no
tiene `nomepac`, la respuesta lo rellena con `nompac`.

## Doctores · se identifican por el **`_id`**

| Método y ruta | Qué hace | Función en `src/api/doctores.js` |
|---|---|---|
| `GET /api/doctores` | Todos | `getDoctores()` |
| `GET /api/doctores/:especialidad` | Los de una especialidad | `getDoctorByEspecialidad(especialidad)` |
| `POST /api/doctores` | Crear | `saveDoctor(doctor)` |
| `PUT /api/doctores/:id` | Modificar | `modifyDoctor(id, doctor)` |
| `DELETE /api/doctores/:id` | Borrar | `deleteDoctor(id)` |

Ojo con el orden: `GET /:especialidad` está escrita **al final** del fichero de rutas, a
propósito. Express prueba las rutas en orden y esa acepta cualquier valor, así que si
estuviera arriba se tragaría cualquier otra ruta `GET`.

## Citas · se identifican por el **`_id`**

| Método y ruta | Qué hace | Función en `src/api/citas.js` |
|---|---|---|
| `GET /api/citas` | Todas, con filtros opcionales | `getCitas(filtros)` |
| `POST /api/citas` | Crear | `saveCita(cita)` |
| `PUT /api/citas/:id` | Modificar | `updateCita(id, cita)` |
| `DELETE /api/citas/:id` | Borrar | `deleteCita(id)` |

El `GET` admite dos filtros en la URL, que se combinan con AND:

```
/api/citas?pacienteDNI=12345678Z
/api/citas?doctorId=6745a1b2c3d4e5f6a7b8c9d0
/api/citas?pacienteDNI=12345678Z&doctorId=6745a1b2c3d4e5f6a7b8c9d0
```

`getCitas(filtros)` hace `axios.get(URL, { params: filtros })`, y axios convierte el objeto
en esa cadena. **Para añadir un filtro nuevo solo hay que tocar Express**: la función de
`src/api/` ya sirve para cualquier parámetro.

Las citas vuelven **ordenadas** por `fecha` y, a igual fecha, por `hora`. Eso evita tener que
ordenarlas en la pantalla, y es por lo que «la próxima cita» es simplemente la primera que
cumple la condición.

El `POST` y el `PUT` pasan por dos funciones del propio fichero de rutas:

- `datosPermitidos(body)` descarta cualquier propiedad que no esté en la lista blanca
  `camposCita`. Así nadie puede colar campos arbitrarios.
- `validarRelaciones(datos)` comprueba con `Paciente.exists` y `Doctor.exists` que el DNI y
  el id apunten a registros que existen. MongoDB no tiene claves ajenas, así que la
  integridad se comprueba aquí a mano.

## Catálogos · no necesitan base de datos

| Método y ruta | Qué devuelve | Función en `src/api/` |
|---|---|---|
| `GET /api/especialidades` | `{ especialidades: [{ id, nm }] }` | `obtenerEspecialidades()` |
| `GET /api/municipios` | `{ provincias: [{ id, nm }], municipios: [...] }` | `obtenerProvincias()`, `obtenerMunicipios(idProvincia)` |

Están definidas directamente en `backend/server.js` y leen dos ficheros de `backend/data/`.
**No pasan por `requireDatabase`**, así que funcionan aunque MongoDB esté apagado. Eso las
convierte en la mejor prueba rápida: si `/api/especialidades` responde y `/api/pacientes` da
`503`, el backend está vivo y lo que falta es la base de datos o el `.env`.

Fíjate en que los catálogos devuelven **un objeto que envuelve la lista**, no la lista
directamente: por eso `obtenerEspecialidades()` hace `return respuesta.data.especialidades`.
Las colecciones de MongoDB, en cambio, devuelven el array directo.

## Los códigos que usa este backend

| Código | Cuándo |
|---|---|
| `200` | Todo bien |
| `201` | Creado, en los `POST` |
| `400` | Los datos no valen: un `required`, un formato de móvil, un `ObjectId` mal formado (`CastError`) |
| `404` | El DNI o el id no existe |
| `409` | Conflicto: un DNI repetido, o el error `11000` de un índice `unique` |
| `500` | Algo se rompió en el servidor |
| `503` | MongoDB no está conectado: lo pone el middleware `requireDatabase` |

**El borrado devuelve `200` con un mensaje**, no `204`. Por ejemplo:
`{ "mensaje": "Paciente eliminado" }`.

## La forma de los mensajes de error

Siempre la misma clave, `mensaje`:

```json
{ "mensaje": "Ya existe un paciente con ese DNI" }
```

Y los componentes la leen así:

```js
function mensajeError(error, porDefecto) {
  return error?.response?.data?.mensaje ?? porDefecto
}
```

Si escribes una ruta nueva, usa `mensaje`. Con cualquier otra clave el texto no sale en la
alerta y verás el mensaje genérico, sin ninguna pista de por qué.

## Lo que la API **no** hace hoy

Conviene saberlo, porque es lo que piden añadir:

- **No comprueba solapes.** Un doctor puede tener dos citas a la misma hora, y un paciente
  también. → [paciente sin dos citas a la vez](../funcionalidades/mejoras-de-la-clinica/paciente-sin-dos-citas-a-la-vez.md)
- **No hay borrado en cascada.** Al borrar un paciente, sus citas se quedan apuntando a un
  DNI que ya no existe. → [borrado en cascada](../funcionalidades/backend/borrado-en-cascada.md)
- **No hay paginación ni orden configurable.** → [paginación](../funcionalidades/backend/paginacion.md) · [ordenar](../funcionalidades/backend/orden.md)
- **No hay búsqueda por texto.** → [búsqueda en el servidor](../funcionalidades/backend/busqueda.md)
- **No hay `populate`.** Las citas devuelven el `doctorId` crudo. → [populate](../funcionalidades/backend/populate-detalle.md)
- **No hay índices `unique`.** El DNI repetido se comprueba a mano con un `findOne`. → [índice único](../funcionalidades/backend/indice-unico.md)

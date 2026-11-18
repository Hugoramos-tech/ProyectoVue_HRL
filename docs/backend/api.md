# API REST

Todas las rutas cuelgan de `http://localhost:3000/api`.

| Recurso | Endpoints |
|---|---|
| `/pacientes` | `GET /`, `GET /dni/:dni`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| `/doctores` | `GET /` (admite `?especialidad=<nombre>`), `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| `/citas` | `GET /` (admite `?doctor=<id>` y `?paciente=<id>`), `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| `/especialidades` | `GET /` |
| `/municipios` | `GET /` (devuelve `{ provincias, municipios }`) |

Códigos habituales: `201` al crear, `204` al borrar, `400` si los datos no son válidos,
`404` si no existe el recurso y `409` si hay un conflicto: un valor que ya existe (un DNI
repetido), un doctor que ya tiene una cita a esa fecha y hora, o un paciente o doctor que
no se puede borrar porque tiene citas.

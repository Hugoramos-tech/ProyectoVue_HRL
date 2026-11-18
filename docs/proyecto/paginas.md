# Páginas

| Ruta | Componente | Qué hace |
|---|---|---|
| `/` | `IniCio.vue` | Portada con presentación, vídeo y accesos rápidos |
| `/servicios` | `Servizos.vue` | Servicios de la clínica y especialidades (desde el store) |
| `/xestionPacientes` | `XestionPacientes.vue` | CRUD de pacientes, validación de DNI/NIE, búsqueda por DNI y exportación a PDF |
| `/xestionDoctores` | `XestionDoctores.vue` | CRUD de doctores con filtro por especialidad y exportación a PDF |
| `/citas` | `XestionCitas.vue` | CRUD de citas (paciente, doctor, fecha, hora, estado), listado e informe por cita en PDF |
| `/sobrenos` | `SobreNos.vue` | Página informativa: texto y tarjetas de cómo se atiende |
| `/avisoLegal` | `AvisoLegal.vue` | Aviso legal |
| `/politica-privacidad` | `PoliticaPrivacidad.vue` | Política de privacidad |
| cualquier otra | `NotFound.vue` | Error 404 |

`NavBar.vue` y `FooTer.vue` se ven en todas las páginas, dentro de la ventana flotante de `App.vue`. El menú sale de `router/routes.js`.

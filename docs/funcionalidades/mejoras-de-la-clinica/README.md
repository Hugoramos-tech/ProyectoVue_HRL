# Cómo mejorarías la app de la clínica

Si la pregunta es «¿qué le añadirías a la aplicación?», estas son las ideas, con su receta cuando existe. Primero lo que se puede hacer ya con una receta; después lo que no tiene receta y cómo plantearlo.

## Con receta

| Mejora | Receta |
|---|---|
| El doctor no puede tener dos citas a la vez | Ya está en el proyecto (`doctorLibre`); ver [Índice único](../backend/indice-unico.md) |
| El paciente no puede tener dos citas a la vez | [Paciente sin dos citas a la vez](paciente-sin-dos-citas-a-la-vez.md) |
| Ver las horas libres de un doctor al pedir la cita | [Horas libres](horas-libres.md) |
| Elegir la especialidad y después el doctor | [Especialidad y doctor en la cita](especialidad-y-doctor-en-la-cita.md) |
| Cancelar una cita diciendo el motivo | [Cancelar con motivo](cancelar-con-motivo.md) |
| Dar de baja a un paciente sin borrarlo | [Dar de baja](dar-de-baja-a-un-paciente.md) |
| Ver cuándo es la próxima cita de cada paciente | [Próxima cita](proxima-cita-del-paciente.md) |
| Exportar las citas a Excel | [Exportar a CSV](exportar-a-csv.md) |
| Avisar si el teléfono ya existe | [Teléfono repetido](../pequenas-mejoras/movil-repetido.md) |
| Pedir tutor a los menores | [Tutor si es menor](../pequenas-mejoras/tutor-si-es-menor.md) |
| Horario de trabajo del doctor | [Horario del doctor](../pequenas-mejoras/horario-del-doctor.md) |
| Ver si un doctor está ocupado ahora | [Citas por doctor](../pequenas-mejoras/citas-por-doctor.md) |
| Cambiar fecha y hora de una cita | [Reprogramar](../pequenas-mejoras/reprogramar-cita.md) |
| Ver las citas agrupadas por día | [Agenda por días](../pequenas-mejoras/agenda-por-dias.md) |
| Confirmar varias citas de golpe | [Confirmar varias](../pequenas-mejoras/confirmar-seleccionadas.md) |
| Limitar las citas de un doctor por día | [Límite por día](../backend/limite-por-dia.md) |
| No dar citas en fin de semana ni fuera de horario | [Horario y fines de semana](../backend/horario-y-fines-de-semana.md) |
| No poder dar citas en el pasado | [Validaciones](../validacion/validaciones.md) |
| Avisar si el paciente tiene citas al borrarlo | [Aviso al borrar](../alertas-y-pdf/aviso-al-borrar.md) |
| Borrar un paciente con sus citas | [Borrado en cascada](../backend/borrado-en-cascada.md) |
| Cambiar el estado de la cita desde la tabla | [Estado desde la tabla](../listas/estado-desde-la-tabla.md) |
| Color distinto por estado | [Color por estado](../estilos/color-por-estado.md) |
| Ver las citas de hoy en la portada | [Citas de hoy](../pinia/citas-de-hoy.md) |
| Ver cuántas citas pendientes hay en el menú | [Contador en el menú](../pinia/contador-en-el-menu.md) |
| Estadísticas de citas por estado y doctor | [Estadísticas](../listas/estadisticas.md) |
| El historial de citas de un paciente | [Ruta con parámetro](../pantallas/ruta-con-parametro.md) |
| Buscar pacientes o doctores por texto | [Buscador](../listas/buscador.md) |
| Ordenar y paginar las tablas | [Ordenar y paginar](../listas/ordenar-y-paginar.md) |
| Ficha en PDF de un doctor o paciente | [PDF](../alertas-y-pdf/pdf-ficha.md) |
| Resaltar las citas de hoy y las atrasadas | [Resaltar por valor](../columnas-y-filtros/resaltar-por-valor.md) |
| Registrar un seguro o aseguradora del paciente | [Entidad nueva](../datos/entidad-nueva.md) |
| Datos nuevos (alergias, sala, tipo de cita…) | [Campo nuevo](../datos/campo-nuevo.md) |

## Sin receta: cómo plantearlas

| Mejora | Cómo se haría |
|---|---|
| Recordatorio de la cita al paciente | Un campo `email` ya existe; un envío real necesita un servicio de correo (`nodemailer`) en el backend. Bastaría con una columna «Mañana» que marque las citas del día siguiente |
| Iniciar sesión (médico, recepcionista) | Una ruta de login que devuelve un token, un store con el usuario y un guard del router. Es de las tareas más largas |
| Duración de la cita | Un campo `duracion` en el modelo de cita ([Campo nuevo](../datos/campo-nuevo.md)) y comparar solapes por intervalo en vez de por hora exacta |
| Sala o consulta | Una entidad nueva, igual que las aseguradoras ([Entidad nueva](../datos/entidad-nueva.md)) |
| Historial clínico del paciente | Una entidad `Historial` ligada al DNI, con su propia ruta `/api/pacientes/:id/historial` ([Citas de un paciente](../backend/citas-de-un-paciente.md)) |
| Agenda semanal | La tabla de citas filtrada por doctor y agrupada por día con un `computed`; la receta de horas libres da los huecos |
| Lista de espera | Un estado nuevo `espera` en las citas y un botón que lo pasa a `pendente` si queda hueco |

## Cómo contestar

1. Di qué problema resuelve la mejora, en una frase.
2. Di qué piezas toca: modelo, ruta, store, vista (el camino de un dato).
3. Si te piden hacerla, empieza por el backend y pruébalo con `curl`; después la pantalla.

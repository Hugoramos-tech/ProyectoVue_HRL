# Funcionalidades

**¿No sabes cuál usar?** Empieza por [«Si te piden esto, usa esta receta»](si-te-piden.md): busca la frase del enunciado y te lleva a la receta.

| Funcionalidad | Qué se hace |
|---|---|
| [Campo nuevo](datos/campo-nuevo.md) | Añadir un campo a un modelo, su formulario, la tabla y el PDF |
| [DNI con autocarga](como-el-profe/dni-autocarga.md) | Al salir del DNI, si existe el paciente, se carga solo para editarlo |
| [Fecha en la tabla de citas](como-el-profe/fecha-en-la-tabla.md) | `dd/mm/aaaa` en la celda, también en el PDF |
| [Animación de tarjetas](como-el-profe/animacion-tarjetas.md) | Tarjetas de Servicios que aparecen una tras otra con `@keyframes` |
| [Columna calculada](columnas-y-filtros/columna-calculada.md) | Edad a partir de la fecha de nacimiento, nombre completo y fecha `dd/mm/aaaa` |
| [Columna de otra tabla](columnas-y-filtros/columna-de-otra-tabla.md) | Teléfono del paciente y correo del doctor dentro de la tabla de citas |
| [Columna contador](columnas-y-filtros/columna-contador.md) | Cuántas citas tiene cada paciente |
| [Filtros en pacientes](columnas-y-filtros/filtro-pacientes.md) | Por provincia, solo con correo y solo mayores de edad |
| [Filtros en citas](columnas-y-filtros/filtro-citas-especialidad-y-fecha.md) | Por especialidad, hoy/futuras/pasadas y ocultar canceladas |
| [Ordenar por cabecera](columnas-y-filtros/ordenar-por-cabecera.md) | Pulsar el título de una columna para ordenar, y otra vez para invertir |
| [Resaltar por valor](columnas-y-filtros/resaltar-por-valor.md) | Fecha de hoy en naranja y pendientes atrasadas en rojo |
| [Contadores y el que más](columnas-y-filtros/contador-de-resultados.md) | Total, pendientes, paciente y doctor con más citas |
| [Filtro por rango de edad](columnas-y-filtros/filtro-rango-de-edad.md) | Edad mínima y máxima en pacientes |
| [Provincia y municipio en cascada](columnas-y-filtros/filtro-municipio-en-cascada.md) | Dos desplegables dependientes para filtrar pacientes |
| [Combinar filtros y orden](columnas-y-filtros/combinar.md) | Encadenar varios `computed` sin que se pisen |
| [Especialidad y doctor en la cita](mejoras-de-la-clinica/especialidad-y-doctor-en-la-cita.md) | Activar el selector de doctor en Citas y filtrarlo por especialidad |
| [Horas libres](mejoras-de-la-clinica/horas-libres.md) | Desplegable de huecos de media hora con las ocupadas desactivadas |
| [Paciente sin dos citas a la vez](mejoras-de-la-clinica/paciente-sin-dos-citas-a-la-vez.md) | `409` si el paciente ya tiene cita a esa fecha y hora |
| [Próxima cita](mejoras-de-la-clinica/proxima-cita-del-paciente.md) | Columna con la siguiente cita de cada paciente, calculada en la pantalla |
| [Cancelar con motivo](mejoras-de-la-clinica/cancelar-con-motivo.md) | Botón que pide el motivo y lo guarda en las observaciones |
| [Dar de baja a un paciente](mejoras-de-la-clinica/dar-de-baja-a-un-paciente.md) | Marcar como «De baixa» sin borrar, y ocultarlo en Citas |
| [Exportar a CSV](mejoras-de-la-clinica/exportar-a-csv.md) | Descargar las citas para Excel |
| [Cómo mejorarías la app](mejoras-de-la-clinica/README.md) | Lista de mejoras con su receta, y cómo plantear las que no la tienen |
| [Móvil repetido](pequenas-mejoras/movil-repetido.md) | Avisar al salir del campo si otro paciente tiene ese móvil, y `409` en el servidor |
| [Teléfono solo números](pequenas-mejoras/telefono-solo-numeros.md) | Borrar letras al escribir y mostrar `600 111 222` en la tabla |
| [Tutor si es menor](pequenas-mejoras/tutor-si-es-menor.md) | Campo condicional obligatorio para menores de 18 |
| [Contador y cumpleaños](pequenas-mejoras/contador-y-cumpleanos.md) | «12 pacientes · 3 menores» y una tarta en quien cumple años hoy |
| [Citas por doctor](pequenas-mejoras/citas-por-doctor.md) | Columnas de total, hoy y «ocupado ahora» en doctores |
| [Horario del doctor](pequenas-mejoras/horario-del-doctor.md) | Entrada y salida por doctor y `400` fuera de horario |
| [Cita duplicada antes de enviar](pequenas-mejoras/cita-duplicada-antes-de-enviar.md) | Alerta en la web sin esperar al error del servidor |
| [Reprogramar cita](pequenas-mejoras/reprogramar-cita.md) | Ventana con fecha y hora nuevas |
| [Agenda por días](pequenas-mejoras/agenda-por-dias.md) | Citas agrupadas por día con dos `v-for` anidados |
| [Confirmar varias citas](pequenas-mejoras/confirmar-seleccionadas.md) | Casillas y un botón que confirma las marcadas |
| [Saludo y reloj](pequenas-mejoras/saludo-y-reloj.md) | «Boas tardes · 14:04:11» en la portada, con `setInterval` |
| [Filtro en el cliente](listas/filtro-en-cliente.md) | Filtrar citas por estado y doctor con `computed`, y PDF solo de lo filtrado |
| [Filtro en el backend](backend/filtro-en-backend.md) | `?estado=`, `?fecha=` y rango de fechas en la API, con sus selectores |
| [Paginación](backend/paginacion.md) | `?page=` y `?limit=`, con el total en la cabecera `X-Total-Count` |
| [Ordenar](backend/orden.md) | `?sort=` y `?dir=` con una lista de campos permitidos |
| [Búsqueda en el servidor](backend/busqueda.md) | `?q=` sin mayúsculas ni tildes, en nombre, apellidos y DNI |
| [Citas con doctor y paciente](backend/populate-detalle.md) | `populate` y una segunda consulta para traer los nombres |
| [Resumen con aggregate](backend/resumen-aggregate.md) | Citas por estado y por doctor, calculadas en MongoDB |
| [Citas de un paciente](backend/citas-de-un-paciente.md) | `/api/pacientes/:id/citas`, una ruta anidada |
| [Índice único](backend/indice-unico.md) | Un doctor no repite fecha y hora, garantizado por MongoDB |
| [Límite por día](backend/limite-por-dia.md) | Máximo de citas de un doctor en un mismo día |
| [Horario y fines de semana](backend/horario-y-fines-de-semana.md) | Validar la hora y el día de la semana en el modelo |
| [Borrado en cascada](backend/borrado-en-cascada.md) | Borrar un paciente y sus citas a la vez |
| [Log de peticiones](backend/log-de-peticiones.md) | Un middleware que escribe cada petición en la consola |
| [Buscador](listas/buscador.md) | Buscar por texto mientras se escribe, sin mayúsculas ni tildes |
| [PDF](alertas-y-pdf/pdf-ficha.md) | Ficha individual de un doctor o paciente, apaisado y otras variantes |
| [Ruta con parámetro](pantallas/ruta-con-parametro.md) | `/citas-paciente/:dni` con `watch` y aviso si no existe |
| [Contador en el menú](pinia/contador-en-el-menu.md) | Número de citas pendientes junto a «Citas» |
| [Citas de hoy](pinia/citas-de-hoy.md) | Las citas del día en la portada, ordenadas por hora |
| [Props y emit](pantallas/componente-props-emit.md) | Tarjeta de doctor como componente hijo que avisa al padre |
| [Estado desde la tabla](listas/estado-desde-la-tabla.md) | Desplegable en la columna Estado que guarda al cambiar, con toast |
| [Aviso al borrar](alertas-y-pdf/aviso-al-borrar.md) | Avisar de cuántas citas tiene un paciente antes de eliminarlo |
| [Entidad nueva](datos/entidad-nueva.md) | CRUD completo de aseguradoras, de la base de datos al menú, y asignarlas a pacientes |
| [Ordenar y paginar](listas/ordenar-y-paginar.md) | Elegir el orden de una tabla y mostrarla de cinco en cinco |
| [Estadísticas](listas/estadisticas.md) | Totales de citas por estado y por doctor |
| [Validaciones](validacion/validaciones.md) | Las tres capas: HTML, JavaScript y servidor. Fecha no pasada y botón desactivado |
| [Alertas extra](alertas-y-pdf/alertas-extra.md) | Toast, alerta con temporizador, pedir un texto y confirmar |
| [Color por estado](estilos/color-por-estado.md) | Etiquetas de color en la celda de estado, y dónde cambiar el aspecto |
| [Selección con Pinia](pinia/pinia-seleccion.md) | Elegir un paciente o doctor en una página y usarlo en otra |

## Si algo falla

| Síntoma | Mira |
|---|---|
| `Network Error` | ¿Está arrancado el backend? Usa `npm start`, no `npm run dev` |
| El cambio en el backend no se ve | Hay que reiniciar `npm start`: el backend no recarga solo |
| La vista no cambia | Falta `.value` en el script, o el `v-for` sigue leyendo la lista sin filtrar |
| `400` con un mensaje | Un `required`, `match` o `validate` del schema no se cumple |
| `409` | Un valor repetido, como un DNI que ya existe |
| `503` | MongoDB no está conectado: `docker compose up -d` |
| Pantalla en blanco | Consola (F12): un import mal escrito o una variable que no existe |

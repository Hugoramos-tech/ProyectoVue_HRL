# Si te piden esto, usa esta receta

Busca la frase que más se parezca a lo que pide el enunciado. Si pide dos cosas, haz una receta y después la otra; si las dos tocan la misma línea `:filas=`, mira [Combinar filtros y orden](columnas-y-filtros/combinar.md).

## Columnas nuevas en una tabla

| Te piden | Receta |
|---|---|
| «Añade la edad del paciente» | [Columna calculada](columnas-y-filtros/columna-calculada.md) |
| «Nombre y apellidos en una sola columna» | [Columna calculada](columnas-y-filtros/columna-calculada.md), variante B |
| «Muestra la fecha como dd/mm/aaaa» | [Fecha en la tabla](como-el-profe/fecha-en-la-tabla.md) |
| «Muestra el teléfono del paciente en las citas» | [Columna de otra tabla](columnas-y-filtros/columna-de-otra-tabla.md) |
| «Cuántas citas tiene cada paciente (o doctor)» | [Columna contador](columnas-y-filtros/columna-contador.md), [Citas por doctor](pequenas-mejoras/citas-por-doctor.md) |
| «Cuándo es su próxima cita» | [Próxima cita](mejoras-de-la-clinica/proxima-cita-del-paciente.md) |
| «Marca si el doctor está ocupado ahora» | [Citas por doctor](pequenas-mejoras/citas-por-doctor.md) |
| «Pon el teléfono con espacios» | [Teléfono solo números](pequenas-mejoras/telefono-solo-numeros.md) |
| «Pinta en rojo / de otro color lo que cumpla…» | [Resaltar por valor](columnas-y-filtros/resaltar-por-valor.md), [Color por estado](estilos/color-por-estado.md) |
| «Marca a quien cumple años hoy» | [Contador y cumpleaños](pequenas-mejoras/contador-y-cumpleanos.md) |

## Filtros, orden y búsqueda

| Te piden | Receta |
|---|---|
| «Filtra las citas por estado o por doctor» | [Filtro en el cliente](listas/filtro-en-cliente.md) |
| «Filtra por especialidad, por día (hoy/futuras) o oculta las canceladas» | [Filtros en citas](columnas-y-filtros/filtro-citas-especialidad-y-fecha.md) |
| «Filtra los pacientes por provincia / municipio» | [Filtros en pacientes](columnas-y-filtros/filtro-pacientes.md), [En cascada](columnas-y-filtros/filtro-municipio-en-cascada.md) |
| «Filtra los pacientes por edad (mayores / menores)» | [Rango de edad](columnas-y-filtros/filtro-rango-de-edad.md) |
| «Añade un buscador» | [Buscador](listas/buscador.md) |
| «Ordena al pulsar el título de la columna» | [Ordenar por cabecera](columnas-y-filtros/ordenar-por-cabecera.md) |
| «Ordena con un desplegable y pagina» | [Ordenar y paginar](listas/ordenar-y-paginar.md) |
| «Que el filtro lo haga el servidor» | [Filtro en el backend](backend/filtro-en-backend.md), [Búsqueda](backend/busqueda.md), [Orden](backend/orden.md), [Paginación](backend/paginacion.md) |
| «Que el PDF solo traiga lo filtrado» | [Filtro en el cliente](listas/filtro-en-cliente.md), Paso 5 |
| «Muestra cuántos hay / el que más tiene» | [Contadores](columnas-y-filtros/contador-de-resultados.md), [Estadísticas](listas/estadisticas.md) |
| «Agrupa las citas por día» | [Agenda por días](pequenas-mejoras/agenda-por-dias.md) |

## Formularios y datos

| Te piden | Receta |
|---|---|
| «Añade un campo nuevo (alergias, sala…)» | [Campo nuevo](datos/campo-nuevo.md) |
| «Añade una entidad nueva (aseguradoras, salas…)» | [Entidad nueva](datos/entidad-nueva.md) |
| «Pide un tutor si es menor» | [Tutor si es menor](pequenas-mejoras/tutor-si-es-menor.md) |
| «Que la hora sea un desplegable con las libres» | [Horas libres](mejoras-de-la-clinica/horas-libres.md) |
| «Elegir la especialidad y luego el doctor» | [Especialidad y doctor](mejoras-de-la-clinica/especialidad-y-doctor-en-la-cita.md) |
| «Horario de cada doctor» | [Horario del doctor](pequenas-mejoras/horario-del-doctor.md) |
| «Al escribir el DNI, busca y carga al paciente» | [DNI con autocarga](como-el-profe/dni-autocarga.md) |
| «Solo números en el teléfono» | [Teléfono solo números](pequenas-mejoras/telefono-solo-numeros.md) |

## Validaciones y avisos

| Te piden | Receta |
|---|---|
| «No dejes poner una fecha pasada» | [Validaciones](validacion/validaciones.md) |
| «Avisa si el teléfono ya existe» | [Teléfono repetido](pequenas-mejoras/movil-repetido.md) |
| «Avisa si ya hay una cita a esa hora» | [Cita duplicada](pequenas-mejoras/cita-duplicada-antes-de-enviar.md), [Paciente sin dos citas](mejoras-de-la-clinica/paciente-sin-dos-citas-a-la-vez.md), [Índice único](backend/indice-unico.md) |
| «Máximo de citas por día» | [Límite por día](backend/limite-por-dia.md) |
| «Nada de fines de semana / solo en horario» | [Horario y fines de semana](backend/horario-y-fines-de-semana.md) |
| «Avisa antes de borrar a alguien con citas» | [Aviso al borrar](alertas-y-pdf/aviso-al-borrar.md) |
| «Al borrar un paciente, borra sus citas» | [Borrado en cascada](backend/borrado-en-cascada.md) |
| «Una alerta que se cierre sola / pida un texto» | [Alertas extra](alertas-y-pdf/alertas-extra.md) |

## Acciones sobre las citas

| Te piden | Receta |
|---|---|
| «Cambia el estado desde la tabla» | [Estado desde la tabla](listas/estado-desde-la-tabla.md) |
| «Cancelar pidiendo el motivo» | [Cancelar con motivo](mejoras-de-la-clinica/cancelar-con-motivo.md) |
| «Reprogramar una cita» | [Reprogramar](pequenas-mejoras/reprogramar-cita.md) |
| «Confirmar varias a la vez» | [Confirmar varias](pequenas-mejoras/confirmar-seleccionadas.md) |
| «Dar de baja a un paciente sin borrarlo» | [Dar de baja](mejoras-de-la-clinica/dar-de-baja-a-un-paciente.md) |

## Páginas, rutas y componentes

| Te piden | Receta |
|---|---|
| «Una página con el historial de un paciente» | [Ruta con parámetro](pantallas/ruta-con-parametro.md), [Citas de un paciente](backend/citas-de-un-paciente.md) |
| «Una tarjeta/componente reutilizable» | [Props y emit](pantallas/componente-props-emit.md) |
| «Las citas de hoy en la portada» | [Citas de hoy](pinia/citas-de-hoy.md) |
| «Un número en el menú» | [Contador en el menú](pinia/contador-en-el-menu.md) |
| «Recordar lo elegido en otra página» | [Selección con Pinia](pinia/pinia-seleccion.md) |
| «Saludo según la hora / reloj» | [Saludo y reloj](pequenas-mejoras/saludo-y-reloj.md) |
| «Anima las tarjetas de servicios» | [Animación de tarjetas](como-el-profe/animacion-tarjetas.md) |

## PDF y exportar

| Te piden | Receta |
|---|---|
| «Ficha en PDF de un doctor o paciente» | [PDF](alertas-y-pdf/pdf-ficha.md) |
| «Exportar a Excel (CSV)» | [Exportar a CSV](mejoras-de-la-clinica/exportar-a-csv.md) |

## Backend

| Te piden | Receta |
|---|---|
| «Un endpoint que devuelva las citas con los nombres» | [Citas con doctor y paciente](backend/populate-detalle.md) |
| «Un resumen de citas por estado/doctor» | [Resumen con aggregate](backend/resumen-aggregate.md) |
| «Registrar cada petición en la consola» | [Log de peticiones](backend/log-de-peticiones.md) |

## Si no está aquí

Mira [Cómo mejorarías la app](mejoras-de-la-clinica/README.md): trae ideas sin receta y cómo plantearlas. Y para decidir qué ficheros tocar, las [guías](../guias/).

# Estado de la adaptacion a mi proyecto

Esta wiki la escribio un companero para SU proyecto. Se esta adaptando al mio
(HugoRamosLope_VUE). Este indice dice de que ficheros me puedo fiar.

## Diferencias de fondo entre los dos proyectos

| El tenia | Yo tengo |
|---|---|
| `src/views/` | `src/components/` |
| Componente `<DataTable>` reutilizable | Tablas `<table>` escritas a mano |
| Componente `<AppButton>` | `<button class="btn-accion">` |
| La lista vive en Pinia, con `storeToRefs` | La lista es un `ref([])` local del componente |
| `citaStore` | Las citas son un `ref([])` dentro de `Citas.vue` |
| `utils/texto.js`, `fechas.js`, `tabla.js` | Funciones sueltas dentro de cada componente |
| `datosParaPdf(columnas, lista)` | `generarPDF({ titulo, cabeceras, filas, ... })` |
| Iconos de `lucide-vue-next` | Emojis y SVG escritos a mano |
| `src/router/routes.js` + menu automatico | Todo en `src/router/index.js`, menu a mano |

## Adaptados y comprobados (12)

Cada linea de "busca esto" esta verificada contra mi codigo real.

- [x] `funcionalidades/columnas-y-filtros/columna-calculada.md`
- [x] `funcionalidades/columnas-y-filtros/columna-contador.md`
- [x] `funcionalidades/columnas-y-filtros/columna-de-otra-tabla.md`
- [x] `funcionalidades/columnas-y-filtros/combinar.md`
- [x] `funcionalidades/columnas-y-filtros/contador-de-resultados.md`
- [x] `funcionalidades/columnas-y-filtros/filtro-citas-especialidad-y-fecha.md`
- [x] `funcionalidades/columnas-y-filtros/filtro-municipio-en-cascada.md`
- [x] `funcionalidades/columnas-y-filtros/filtro-pacientes.md`
- [x] `funcionalidades/columnas-y-filtros/filtro-rango-de-edad.md`
- [x] `funcionalidades/columnas-y-filtros/ordenar-por-cabecera.md`
- [x] `funcionalidades/columnas-y-filtros/resaltar-por-valor.md`
- [x] `funcionalidades/listas/buscador.md`

## Solo rutas y nombres (36)

Se les cambiaron rutas de fichero, URLs y nombres (doutor -> doctor,
src/views/ -> src/components/, etc.). No usaban piezas que yo no tenga,
asi que deberian valer, pero no estan revisados paso a paso.

- [ ] `README.md`
- [ ] `backend/api.md`
- [ ] `backend/mongodb.md`
- [ ] `backend/validaciones.md`
- [ ] `comprobar/checklist.md`
- [ ] `detalle/README.md`
- [ ] `funcionalidades/backend/busqueda.md`
- [ ] `funcionalidades/backend/citas-de-un-paciente.md`
- [ ] `funcionalidades/backend/horario-y-fines-de-semana.md`
- [ ] `funcionalidades/backend/indice-unico.md`
- [ ] `funcionalidades/backend/limite-por-dia.md`
- [ ] `funcionalidades/backend/log-de-peticiones.md`
- [ ] `funcionalidades/backend/orden.md`
- [ ] `funcionalidades/backend/paginacion.md`
- [ ] `funcionalidades/backend/populate-detalle.md`
- [ ] `funcionalidades/backend/resumen-aggregate.md`
- [ ] `funcionalidades/como-el-profe/animacion-tarjetas.md`
- [ ] `funcionalidades/como-el-profe/dni-autocarga.md`
- [ ] `funcionalidades/datos/campo-nuevo.md`
- [ ] `funcionalidades/listas/estadisticas.md`
- [ ] `funcionalidades/mejoras-de-la-clinica/README.md`
- [ ] `funcionalidades/mejoras-de-la-clinica/especialidad-y-doctor-en-la-cita.md`
- [ ] `funcionalidades/mejoras-de-la-clinica/paciente-sin-dos-citas-a-la-vez.md`
- [ ] `funcionalidades/pequenas-mejoras/agenda-por-dias.md`
- [ ] `funcionalidades/pequenas-mejoras/horario-del-doctor.md`
- [ ] `funcionalidades/pequenas-mejoras/movil-repetido.md`
- [ ] `funcionalidades/pequenas-mejoras/telefono-solo-numeros.md`
- [ ] `funcionalidades/pequenas-mejoras/tutor-si-es-menor.md`
- [ ] `funcionalidades/si-te-piden.md`
- [ ] `guias/campo-nuevo.md`
- [ ] `guias/endpoint-nuevo.md`
- [ ] `guias/pantalla-nueva.md`
- [ ] `guias/validacion-nueva.md`
- [ ] `proyecto/analisis-profe.md`
- [ ] `proyecto/modelos.md`
- [ ] `proyecto/paginas.md`

## SIN adaptar todavia (36)

**Cuidado**: estos todavia explican pasos con piezas que mi proyecto NO tiene
(`DataTable`, `AppButton`, `citaStore`, `datosParaPdf`...). Si sigo uno de estos
al pie de la letra, no va a funcionar.

- [ ] `comprobar/errores-tipicos.md`
- [ ] `detalle/01-listas-filtros-y-busqueda.md`
- [ ] `detalle/02-formularios-y-campos.md`
- [ ] `detalle/03-rutas-y-componentes.md`
- [ ] `funcionalidades/README.md`
- [ ] `funcionalidades/alertas-y-pdf/alertas-extra.md`
- [ ] `funcionalidades/alertas-y-pdf/aviso-al-borrar.md`
- [ ] `funcionalidades/alertas-y-pdf/pdf-ficha.md`
- [ ] `funcionalidades/backend/borrado-en-cascada.md`
- [ ] `funcionalidades/backend/filtro-en-backend.md`
- [ ] `funcionalidades/como-el-profe/fecha-en-la-tabla.md`
- [ ] `funcionalidades/datos/entidad-nueva.md`
- [ ] `funcionalidades/estilos/color-por-estado.md`
- [ ] `funcionalidades/listas/estado-desde-la-tabla.md`
- [ ] `funcionalidades/listas/filtro-en-cliente.md`
- [ ] `funcionalidades/listas/ordenar-y-paginar.md`
- [ ] `funcionalidades/mejoras-de-la-clinica/cancelar-con-motivo.md`
- [ ] `funcionalidades/mejoras-de-la-clinica/dar-de-baja-a-un-paciente.md`
- [ ] `funcionalidades/mejoras-de-la-clinica/exportar-a-csv.md`
- [ ] `funcionalidades/mejoras-de-la-clinica/horas-libres.md`
- [ ] `funcionalidades/mejoras-de-la-clinica/proxima-cita-del-paciente.md`
- [ ] `funcionalidades/pantallas/componente-props-emit.md`
- [ ] `funcionalidades/pantallas/ruta-con-parametro.md`
- [ ] `funcionalidades/pequenas-mejoras/cita-duplicada-antes-de-enviar.md`
- [ ] `funcionalidades/pequenas-mejoras/citas-por-doctor.md`
- [ ] `funcionalidades/pequenas-mejoras/confirmar-seleccionadas.md`
- [ ] `funcionalidades/pequenas-mejoras/contador-y-cumpleanos.md`
- [ ] `funcionalidades/pequenas-mejoras/reprogramar-cita.md`
- [ ] `funcionalidades/pequenas-mejoras/saludo-y-reloj.md`
- [ ] `funcionalidades/pinia/citas-de-hoy.md`
- [ ] `funcionalidades/pinia/contador-en-el-menu.md`
- [ ] `funcionalidades/pinia/pinia-seleccion.md`
- [ ] `funcionalidades/validacion/validaciones.md`
- [ ] `guias/aspecto.md`
- [ ] `guias/filtro-nuevo.md`
- [ ] `proyecto/mapa.md`

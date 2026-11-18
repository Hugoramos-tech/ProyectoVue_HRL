# Estado de la wiki

Esta wiki la escribió un compañero para **su** proyecto. Está adaptada al mío,
`HugoRamosLope_VUE`: los 85 ficheros de `.md` están revisados y el código que traen se puede
copiar y pegar en mi proyecto.

## Qué significa «adaptada»

Las recetas dicen cosas como «busca la línea `X` y pega esto justo debajo». Cada una de esas
líneas se ha comprobado una por una contra `src/` y `backend/` de mi proyecto: existen y son
únicas. Si una receta nombra un fichero, una función o un campo, es uno que tengo.

Lo que **no** garantiza: que el código pegado haga exactamente lo que yo quiero sin leerlo.
Las recetas explican lo que hacen, y conviene leer el «Qué deberías ver» antes de dar algo
por bueno.

## Diferencias de fondo entre los dos proyectos

Esto es lo que había que traducir en cada fichero. Si alguna vez encuentro un resto sin
adaptar, es por aquí:

| El compañero tenía | Yo tengo |
|---|---|
| `src/views/` para las pantallas | `src/components/`, todo junto |
| Componente `<DataTable>` reutilizable | Tablas `<table>` escritas a mano, con `<th>` y `<td>` |
| Componentes `<AppButton>`, `<FormField>`, `<RowActions>`, `<AppSection>` | `<button>`, `<label>` y `<input>` a pelo, con clases de `style.css` |
| Las listas en Pinia, con `storeToRefs` | Las listas son un `ref([])` local de cada componente |
| `citaStore`, `especialidadStore`, `municipioStore` | Solo `pacienteStore` y `doctorStore`, y solo para la **selección** |
| `useFormulario()` y `useCargaInicial()` en `composables/` | El formulario es un `reactive` en cada componente |
| `utils/texto.js`, `fechas.js`, `tabla.js`, `errores.js` | Solo `utils/alertas.js` y `utils/pdf.js` |
| `datosParaPdf(columnas, lista)` | `generarPDF({ titulo, cabeceras, filas, ... })` |
| Iconos de `lucide-vue-next` | Emojis y SVG escritos a mano |
| `src/router/routes.js` y menú automático con `meta.menu` | Todo en `src/router/index.js`, y el menú enlace por enlace en `NavBar.vue` |
| `obtenerCitas`, `obtenerDoctores`… | `getCitas`, `getDoctores`, `savePaciente`, `modifyDoctor`… |
| Tokens de color con `@theme` | Colores escritos en las clases: `bg-[#14543a]` |
| Textos en gallego | Castellano (quedan dos «Non hai … cargados.») |

## Lo que hay que saber de mi proyecto

Cinco cosas que explican la mitad de los fallos:

1. **El paciente se identifica por su DNI; el doctor, por su `_id`.** Las rutas son
   `/api/pacientes/:dni` y `/api/doctores/:id`, y las citas guardan `pacienteDNI` y
   `doctorId`. Confundirlos da `404` o `CastError`.

2. **Hace falta un `.env`** en la raíz, con `PORT` y `MONGO_URI`. Está en el `.gitignore`, así
   que no viaja con el repositorio: hay un `.env.example` para copiarlo. Sin él, el servidor
   arranca igual pero todas las rutas de datos responden **`503`** y las tres pantallas salen
   vacías.

3. **El backend no recarga solo.** Cualquier cambio en `backend/` necesita Ctrl+C y
   `npm start`.

4. **`XestionPacientes.vue` no importa `computed`.** Solo `ref`, `reactive` y `onMounted`.

5. **En `Citas.vue` el paciente y el doctor vienen de Pinia**, y sus desplegables están
   `disabled`: se eligen en sus pantallas.

## Por dónde empezar

| Quiero… | Voy a |
|---|---|
| Buscar la frase del enunciado | [Si te piden esto…](funcionalidades/si-te-piden.md) |
| Ver la lista completa de recetas | [Funcionalidades](funcionalidades/README.md) |
| Entender cómo encaja el proyecto | [Mapa del proyecto](proyecto/mapa.md) |
| Repasar un tema a fondo | [Listas y filtros](detalle/01-listas-filtros-y-busqueda.md) · [Formularios](detalle/02-formularios-y-campos.md) · [Rutas y componentes](detalle/03-rutas-y-componentes.md) |
| Comprobar que todo arranca | [Checklist](comprobar/checklist.md) |
| Arreglar algo que falla | [Errores típicos](comprobar/errores-tipicos.md) |

## Qué hay en cada carpeta

| Carpeta | Ficheros | Qué es |
|---|---|---|
| `funcionalidades/` | 64 | Las recetas: pasos para copiar y pegar |
| `guias/` | 6 | Resúmenes cortos por tipo de tarea |
| `detalle/` | 4 | Apuntes a fondo por tema, con el porqué |
| `proyecto/` | 4 | Mapa, páginas y análisis del repo del profe |
| `comprobar/` | 2 | Checklist y errores típicos |
| `backend/` | 3 | MongoDB, la API y el `.env` |

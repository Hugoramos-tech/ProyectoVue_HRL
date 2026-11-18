# El repo del profe (`vue26267`)

Qué ha hecho el profe, en qué orden, y qué pistas da sobre lo que puede pedir. Sale de sus 49 commits (del 14/09 al 18/11/2026).

## Cronología

| Fechas | Qué hizo |
|---|---|
| 14-18 sep | Proyecto base, diseño de «Xestión pacientes» |
| 21-23 sep | Router y municipios |
| 25-30 sep | Backend (Express + Mongoose), Vue guarda y muestra |
| 1-5 oct | Pacientes completo |
| 6-15 oct | Doctores y SweetAlert2 |
| 20-26 oct | Citas y PDFs |
| 1-5 nov | Informes, Pinia, doctores terminados |
| 9-11 nov | Citas con Pinia |
| **12 nov** | **«preparando para el examen»**: páginas de servicios, DNI que carga al paciente |
| 16 nov | «listo para examen»: limpieza de lint en todas las vistas |
| **18 nov** | **«preparando para el examen»**: fecha `dd/mm/aaaa` en citas y ajustes de estilo |

## Lo que añadió en sus últimos commits

Los commits con «preparando para el examen» son la mejor pista de lo que él considera que pueden pedir:

| Cambio del profe | Receta |
|---|---|
| Al validar un DNI, buscar si ya existe y cargar al paciente con un aviso («Atención: Paciente Existe en Base de Datos») | [DNI con autocarga](../funcionalidades/como-el-profe/dni-autocarga.md) |
| Aviso de error «Paciente no Encontrado» en la búsqueda por DNI | Ya existe en esta web, como texto bajo el DNI |
| Fecha `dd/mm/aaaa` en la tabla de citas (`formatearFecha`) | [Fecha en la tabla](../funcionalidades/como-el-profe/fecha-en-la-tabla.md) |
| Página de servicios con tarjetas, fotos y animación CSS escalonada | [Animación de tarjetas](../funcionalidades/como-el-profe/animacion-tarjetas.md) |
| Centrar el texto del campo de fecha en pacientes | `class="text-center"` en el input (ya está) |
| Quitar `unique` del DNI en el modelo de paciente | Ver «Ojo» más abajo |

## Lo que se repite en todo el proyecto

- **Tabla de cada entidad con acciones** (editar, eliminar) y exportación a PDF.
- **Filtro de doctores por especialidad** desde el desplegable del formulario.
- **Citas** con paciente por DNI, doctor por id y especialidad mostrada en la tabla.
- **Validaciones:** DNI/NIE, móvil, correo, capitalizar nombres al salir del campo.
- **SweetAlert2** para todo aviso, y un botón «Limpar» que vacía el formulario.
- **Cascada** provincia → municipio en pacientes.

## Qué se saca de ahí

1. Lo que añade en esos commits es pequeño y concreto: una comprobación, un formato, un efecto. Es el tamaño de lo que probablemente pida.
2. La mayoría son cambios en una sola vista (`XestionPacientes`, `XestionCitas`, `Servizos`), no en la arquitectura.
3. El día 16 hizo una pasada entera de **lint** (formato de las vistas). Conviene pasar `npm run lint` antes de entregar.
4. Los cambios visibles tienen aviso con SweetAlert2: `alertaExito` o `alertaError`.

## Ojo

En el último cambio del modelo, el profe quitó `unique: true` del DNI del paciente. En esta web sigue activo, así que dos pacientes con el mismo DNI dan error `409`. Es lo correcto: si piden «dar de alta a un paciente con el mismo DNI», habría que decidir con el profe cuál se espera. Si hiciera falta quitarlo, es una sola línea en `backend/modelos/Paciente.js`.

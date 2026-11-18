# Columna «Próxima cita» en la tabla de pacientes

Una columna nueva en la tabla de pacientes con la fecha y hora de su próxima cita (la primera que tenga de hoy en adelante, sin contar las canceladas ni las realizadas). Si no tiene ninguna, sale un guion.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Crea alguna cita futura para algún paciente.

## La idea

La página de pacientes no tiene las citas, así que se piden todas una vez. La API las devuelve ya ordenadas por fecha y hora, por lo que la próxima de un paciente es la primera que cumple las condiciones.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | Pedir las citas, la función y la columna |

## Paso 1 · El import

En `src/components/XestionPacientes.vue`, busca la línea `import { datosParaPdf } from "../utils/tabla.js";` y pega esto **justo debajo**:

```js
// La función que pide las citas al servidor
import { obtenerCitas } from "../api/citas.js";
```

## Paso 2 · La función

Busca la línea `// Columnas de la tabla (y del PDF).` y pega esto **justo encima**:

```js
// Todas las citas, solo para buscar la próxima de cada paciente
const todasLasCitas = ref([]);

// La fecha de hoy como texto "aaaa-mm-dd" (getMonth() cuenta desde 0: de ahí el +1; padStart añade el 0 delante)
const ahora = new Date();
const hoyTexto = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;

// La API devuelve las citas ya ordenadas por fecha y hora, así que la PRIMERA que cumpla las
// condiciones es la próxima. find devuelve la primera que cumple, o undefined si no hay ninguna.
function proximaCita(paciente) {
  const cita = todasLasCitas.value.find(
    (c) =>
      c.pacienteDNI === paciente.dnipac && // es de este paciente
      c.fecha >= hoyTexto &&               // es de hoy o posterior (los textos aaaa-mm-dd se comparan bien)
      c.estado !== "cancelada" &&
      c.estado !== "realizada"
  );
  if (!cita) return "—";
  // Se escribe la fecha como dd/mm/aaaa y se le añade la hora
  const [anyo, mes, dia] = cita.fecha.split("-");
  return `${dia}/${mes}/${anyo} ${cita.hora}`;
}
```

## Paso 3 · La columna

Busca la línea `{ clave: "munipac", titulo: "Municipio" },` y pega esto **justo debajo**:

```js
  // Columna inventada: no existe en MongoDB; `formato` calcula el texto de cada fila (p = paciente)
  { clave: "proxima", titulo: "Próxima cita", formato: (p) => proximaCita(p) },
```

## Paso 4 · Cargar las citas

Busca la línea `Promise.all([pacienteStore.cargarPacientes(), municipioStore.cargarMunicipios()])` y **sustitúyela** por:

```js
  // Promise.all lanza las tres peticiones a la vez; la última guarda las citas en `todasLasCitas`
  Promise.all([
    pacienteStore.cargarPacientes(),
    municipioStore.cargarMunicipios(),
    obtenerCitas().then((citas) => (todasLasCitas.value = citas)),
  ])
```

Si ya hiciste la receta «Columna contador», ya tienes `todasLasCitas` y este bloque: salta los Pasos 1 y 4, y no repitas `todasLasCitas` del Paso 2.

## Qué deberías ver

1. Una columna «Próxima cita» con algo como `23/11/2026 11:00`.
2. Un guion para quien no tiene ninguna futura.
3. Las citas pasadas, canceladas o realizadas no cuentan.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Todo sale «—» | El Paso 4 no está, o `pacienteDNI` no coincide con el DNI del paciente |
| Sale una cita ya pasada | La comparación `c.fecha >= hoyTexto` no está, o `hoyTexto` no tiene formato `aaaa-mm-dd` |
| Sale una cita cancelada | Falta la condición del estado |
| `proximaCita is not defined` | El Paso 2 quedó dentro de otra función |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `Array.find` | La primera que cumple la condición | `03_lecciones/vue/03_v_for.md` |
| Columnas con `formato` | La celda muestra lo que devuelve la función | `03_lecciones/06_pdf.md §7` |
| `Promise.all` | Pedir varias cosas a la vez | `03_lecciones/03_crud_api_rest.md §5` |

## Guías relacionadas

- [Columna contador](../columnas-y-filtros/columna-contador.md)
- [Columna calculada](../columnas-y-filtros/columna-calculada.md)

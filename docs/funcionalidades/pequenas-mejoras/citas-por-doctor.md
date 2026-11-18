# Columnas de citas en la tabla de doctores: total, hoy y «ocupado ahora»

Tres datos nuevos en la tabla de doctores: cuántas citas tiene cada uno, cuántas son de hoy y si ahora mismo está ocupado (tiene una cita que empezó hace menos de media hora).

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Doctores** (`/xestionDoctores`). Crea alguna cita para algún doctor, y una de hoy para ver las dos últimas columnas.

## La idea

La página de doctores no tiene las citas, así que se piden todas una vez y se cuentan. «Ocupado ahora» compara la hora actual con la de las citas de hoy: se supone que cada cita dura 30 minutos.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionDoctores.vue` | Pedir las citas, las funciones y las columnas |

## Paso 1 · El import

En `src/components/XestionDoctores.vue`, busca la línea `import { datosParaPdf } from "../utils/tabla.js";` y pega esto **justo debajo**:

```js
// La función que pide las citas al servidor
import { obtenerCitas } from "../api/citas.js";
```

## Paso 2 · Las funciones

Busca la línea `// Columnas de la tabla (y del PDF). El doctor guarda el nombre de la especialidad.` y pega esto **justo encima**:

```js
// Todas las citas, solo para contarlas. ref([]) = caja vigilada que empieza vacía.
const todasLasCitas = ref([]);

// Fecha de hoy "aaaa-mm-dd" y minutos transcurridos desde las 00:00 (horas * 60 + minutos)
const ahora = new Date();
const hoyTexto = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;
const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

// Las citas de un doctor que no están canceladas
function citasDe(doctor) {
  return todasLasCitas.value.filter((c) => c.doctorId === doctor.id && c.estado !== "cancelada");
}

function citasDeHoy(doctor) {
  return citasDe(doctor).filter((c) => c.fecha === hoyTexto).length;
}

// Se supone que cada cita dura 30 minutos. some devuelve true si ALGUNA cita cumple la condición:
// que sea de hoy y que ahora caiga entre su hora de inicio y su hora de inicio + 30 minutos.
function ocupadoAhora(doctor) {
  return citasDe(doctor).some((c) => {
    if (c.fecha !== hoyTexto) return false;
    const [h, m] = c.hora.split(":").map(Number); // "10:30" -> [10, 30]
    const inicio = h * 60 + m;
    return minutosAhora >= inicio && minutosAhora < inicio + 30;
  });
}
```

## Paso 3 · Las columnas

Busca la línea `{ clave: "espedoc", titulo: "Especialidade" },` y pega esto **justo debajo**:

```js
  // Tres columnas inventadas: `formato` calcula el texto de cada fila (d = el doctor)
  { clave: "ncitas", titulo: "Citas", formato: (d) => citasDe(d).length },
  { clave: "hoxe", titulo: "Hoxe", formato: (d) => citasDeHoy(d) },
  { clave: "ocupado", titulo: "Agora", formato: (d) => (ocupadoAhora(d) ? "Ocupado" : "Libre") },
```

## Paso 4 · Cargar las citas

Busca la línea `Promise.all([especialidadStore.cargarEspecialidades(), doctorStore.cargarDoctores()])` y **sustitúyela** por:

```js
  // Se piden a la vez las especialidades, los doctores y todas las citas (Promise.all espera a las tres)
  Promise.all([
    especialidadStore.cargarEspecialidades(),
    doctorStore.cargarDoctores(),
    obtenerCitas().then((citas) => (todasLasCitas.value = citas)),
  ])
```

## Qué deberías ver

1. Tres columnas nuevas: «Citas», «Hoxe» y «Agora».
2. El total cuenta las citas no canceladas de cada doctor.
3. «Ocupado» solo sale si el doctor tiene una cita de hoy que empezó hace menos de 30 minutos. El resto del tiempo, «Libre».

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Todo sale 0 y «Libre» | Falta el Paso 4, o `c.doctorId` no coincide con `doctor.id` |
| «Ocupado» no sale nunca | Prueba con una cita de hoy cuya hora sea hace 10 minutos |
| La tabla de doctores cambia con el filtro de especialidad | Es normal: las citas se cuentan para los doctores que se ven |
| `citasDe is not defined` | El Paso 2 quedó dentro de otra función |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Columnas con `formato` | La celda muestra lo que devuelve la función | `03_lecciones/06_pdf.md §7` |
| `Promise.all` | Pedir varias cosas a la vez | `03_lecciones/03_crud_api_rest.md §5` |
| `filter` y `some` | Contar los que cumplen algo, o saber si alguno lo cumple | `03_lecciones/vue/03_v_for.md` |

## Guías relacionadas

- [Columna contador](../columnas-y-filtros/columna-contador.md)

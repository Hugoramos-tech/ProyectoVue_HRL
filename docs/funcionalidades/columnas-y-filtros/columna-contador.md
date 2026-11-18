# Columna con un contador: citas por paciente

Una columna «Citas» en la tabla de pacientes con cuántas citas tiene cada uno.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Crea alguna cita para algún paciente.

## La idea

La página de pacientes no tiene las citas. Se piden todas una vez al abrir la pantalla y, para cada paciente, se cuentan las que llevan su DNI con `filter(...).length`.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | Pedir las citas, contarlas y añadir la columna |

## Paso 1 · El import

En `src/components/XestionPacientes.vue`, busca la línea `import { generarPDF } from "../utils/pdf.js";` y pega esto **justo debajo**:

```js
// La funcion que pide las citas al servidor (usa axios por dentro).
// En este proyecto se llama getCitas, no obtenerCitas.
import { getCitas } from "../api/citas.js";
```

## Paso 2 · La caja de citas y el contador

Busca la línea `const pacienteStore = usepacienteStore();` y pega esto **justo debajo**:

```js
// Todas las citas, solo para contarlas. ref([]) = una caja vigilada que empieza vacia;
// cuando lleguen las citas se rellena y la tabla se repinta sola.
const todasLasCitas = ref([]);

// Cuantas citas tiene un paciente: se quedan las que llevan su DNI y se cuentan con .length.
// El DNI se normaliza (sin espacios y en mayusculas) porque puede venir escrito de varias formas.
function citasDe(paciente) {
  const dni = String(paciente.dnipac ?? "").trim().toUpperCase();
  return todasLasCitas.value.filter(
    (c) => String(c.pacienteDNI ?? "").trim().toUpperCase() === dni
  ).length;
}
```

## Paso 3 · Cargarlas al abrir la página

Dentro de `onMounted`, busca estas líneas:

```js
  const [resultadoPacientes, resultadoProvincias] = await Promise.allSettled([
    getPacientes(),
    obtenerProvincias(),
  ]);
```

y **sustitúyelas** por:

```js
  // Promise.allSettled lanza las tres peticiones a la vez y espera a todas,
  // aunque alguna falle (por eso "allSettled" y no "all").
  const [resultadoPacientes, resultadoProvincias, resultadoCitas] = await Promise.allSettled([
    getPacientes(),
    obtenerProvincias(),
    getCitas(),
  ]);

  // Si las citas no llegan, la lista se queda vacia y los contadores saldran a 0.
  todasLasCitas.value = resultadoCitas.status === "fulfilled" ? resultadoCitas.value : [];
```

## Paso 4 · La cabecera

En el `<thead>`, busca la línea `<th>Provincia</th>` y pega esto **justo debajo**:

```vue
            <th>Citas</th>
```

## Paso 5 · La celda

En el `<tbody>`, busca la línea `<td>{{ u.propac }}</td>` y pega esto **justo debajo**:

```vue
            <!-- u es el paciente de esta fila; citasDe cuenta sus citas -->
            <td class="centrado">{{ citasDe(u) }}</td>
```

## Variante · Que salga también en el PDF

Dentro de `exportarPacientes()`, añade `"Citas"` al final de `cabeceras` y `citasDe(paciente)` al final de cada fila del `map`. Los dos tienen que tener el mismo número de elementos.

## Qué deberías ver

1. Una columna «Citas» después de «Provincia», con un número por paciente (0 si no tiene).
2. Si creas una cita y recargas la página de pacientes, el número sube.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Todo sale 0 | Falta el Paso 3, o el `pacienteDNI` de las citas no coincide con el DNI del paciente |
| `getCitas is not defined` | Falta el Paso 1 |
| `resultadoCitas is not defined` | Hiciste el Paso 3 a medias: hay que sustituir las dos partes |
| La tabla se descoloca | Pusiste el `<th>` pero no el `<td>`, o al revés |
| El número no cambia al borrar una cita desde otra pantalla | Esta pantalla solo pide las citas al abrirse: recarga la página |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `ref` | La caja vigilada que guarda las citas |
| `Promise.allSettled` | Lanzar varias peticiones a la vez y esperar a todas, fallen o no |
| `filter(...).length` | Contar cuántos elementos cumplen una condición |

## Guías relacionadas

- [Guía: campo nuevo](../../guias/campo-nuevo.md)

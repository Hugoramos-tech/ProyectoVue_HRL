# Columna «Próxima cita» en la tabla de pacientes

Una columna nueva en la tabla de pacientes con la fecha y la hora de su próxima cita: la primera que tenga de hoy en adelante, sin contar las canceladas ni las realizadas. Si no tiene ninguna, sale un guion.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Crea alguna cita futura para algún paciente.

## La idea

La pantalla de pacientes no tiene las citas: solo pide pacientes y provincias. Así que hay que pedir todas las citas una vez, al montar.

El backend las devuelve **ya ordenadas** por fecha y hora (`.sort({ fecha: 1, hora: 1 })` en `citas.rutas.js`), así que la próxima de un paciente es simplemente **la primera** que cumple las condiciones. No hay que ordenar nada.

> Esta pantalla **no tiene componente de tabla**: la cabecera y las filas están escritas a mano. Añadir una columna son dos cosas, un `<th>` y un `<td>`, y las dos en la misma posición.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | El import, la función, la carga y la columna |

## Paso 1 · El import

Busca la línea `import { generarPDF } from "../utils/pdf.js";` y pega esto **justo debajo**:

```js
// Esta pantalla no pedia citas: hace falta para buscar la proxima de cada paciente.
import { getCitas } from "../api/citas.js";
```

## Paso 2 · La función

Busca la línea `const pacienteStore = usepacienteStore();` y pega esto **justo debajo**:

```js
// Todas las citas, solo para buscar la proxima de cada paciente.
const todasLasCitas = ref([]);

// La fecha de hoy como texto "aaaa-mm-dd", el formato en que se guarda cita.fecha.
const ahoraProxima = new Date();
const hoyTexto = `${ahoraProxima.getFullYear()}-${String(ahoraProxima.getMonth() + 1).padStart(2, "0")}-${String(ahoraProxima.getDate()).padStart(2, "0")}`;

// El backend ya devuelve las citas ordenadas por fecha y hora, asi que la PRIMERA
// que cumpla las condiciones es la proxima. find devuelve la primera, o undefined.
function proximaCita(paciente) {
  const dni = String(paciente.dnipac ?? "").trim().toUpperCase();

  const cita = todasLasCitas.value.find(
    (item) =>
      // Es de este paciente. El backend guarda los DNI en mayusculas, pero se
      // normalizan los dos lados por si acaso.
      String(item.pacienteDNI ?? "").trim().toUpperCase() === dni &&
      // Es de hoy o posterior. Los textos aaaa-mm-dd se comparan en orden cronologico.
      item.fecha >= hoyTexto &&
      item.estado !== "cancelada" &&
      item.estado !== "realizada"
  );

  if (!cita) {
    return "—";
  }

  // Se escribe la fecha como dd/mm/aaaa y se le anade la hora.
  const [anyo, mes, dia] = String(cita.fecha).split("-");
  return `${dia}/${mes}/${anyo} ${cita.hora}`;
}
```

## Paso 3 · Cargar las citas

El `onMounted` de esta pantalla pide dos cosas a la vez. Vamos a pedir una tercera.

**3.1** Busca la línea `  const [resultadoPacientes, resultadoProvincias] = await Promise.allSettled([` y **sustitúyela** por:

```js
  const [resultadoPacientes, resultadoProvincias, resultadoCitas] = await Promise.allSettled([
```

**3.2** Busca la línea `    obtenerProvincias(),` y **sustitúyela** por:

```js
    obtenerProvincias(),
    getCitas(),
```

**3.3** Busca la línea `  if (resultadoPacientes.status === "fulfilled") {` y pega esto **justo encima**:

```js
  // status es "fulfilled" o "rejected". Si las citas fallan no se avisa: la columna
  // saldra con guiones, pero la pantalla de pacientes sigue funcionando.
  if (resultadoCitas.status === "fulfilled") {
    todasLasCitas.value = resultadoCitas.value;
  }
```

`Promise.allSettled` espera a las tres y **no se rompe si una falla**: por eso cada resultado trae su propio `status`. Con `Promise.all`, un fallo de la API de citas dejaría la tabla de pacientes vacía.

## Paso 4 · La cabecera de la columna

En el `<template>`, busca la línea `<th>Correo</th>` y pega esto **justo debajo**:

```vue
            <th>Próxima cita</th>
```

## Paso 5 · La celda

Busca la línea `<td>{{ u.mailpac }}</td>` y pega esto **justo debajo**:

```vue
            <!-- Columna calculada: no existe en MongoDB, la monta proximaCita() -->
            <td class="centrado">{{ proximaCita(u) }}</td>
```

El `<th>` y el `<td>` van en la misma posición, entre Correo y Provincia. Si falta uno, la tabla se descuadra.

## Variante · Resaltar las de hoy

Cambia el Paso 5 por:

```vue
            <td class="centrado">
              <span :class="{ 'font-bold text-[#b3261e]': proximaCita(u).startsWith(hoyTexto.slice(8, 10) + '/') }">
                {{ proximaCita(u) }}
              </span>
            </td>
```

Más legible es devolver también la fecha cruda desde la función, pero para una celda puntual esto sirve.

## Variante · Que salga en el PDF

Dentro de `exportarPacientes()`, busca `cabeceras: ["DNI", "Apellidos", "Nombre", "Móvil"],` y **sustitúyela** por:

```js
      cabeceras: ["DNI", "Apellidos", "Nombre", "Móvil", "Próxima cita"],
```

Y busca `paciente.movilpac ?? "",` y **sustitúyela** por:

```js
        paciente.movilpac ?? "",
        proximaCita(paciente),
```

Las cabeceras y cada fila tienen que tener el mismo número de elementos.

## Qué deberías ver

1. Una columna «Próxima cita» con algo como `23/11/2026 11:00`.
2. Un guion para quien no tiene ninguna cita futura.
3. Las citas pasadas, canceladas o realizadas no cuentan.
4. Si MongoDB está caído, la columna sale con guiones pero la pantalla no se rompe.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| Todo sale «—» | Falta el Paso 3: `todasLasCitas` sigue vacío |
| Todo sale «—» y hay citas | El DNI de la cita no coincide: el backend los guarda en mayúsculas |
| Sale una cita ya pasada | Falta `item.fecha >= hoyTexto`, o `hoyTexto` no tiene formato `aaaa-mm-dd` |
| Sale una cita cancelada | Faltan las dos condiciones del estado |
| `resultadoCitas is not defined` | Falta el Paso 3.1: hay que añadirlo a la desestructuración |
| La tabla se descuadra | Falta el `<th>` del Paso 4 o el `<td>` del Paso 5 |
| `proximaCita is not defined` | El Paso 2 quedó dentro de otra función |
| La tabla de pacientes se queda vacía | Cambiaste `allSettled` por `all`: con `all`, un fallo tumba las tres |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `find` | La primera que cumple la condición, o `undefined` |
| Columna calculada | Una celda que no existe en la base de datos |
| `Promise.allSettled` | Varias peticiones a la vez, cada una con su propio resultado |
| Fechas como texto | `aaaa-mm-dd` se compara con `>=` sin convertir a `Date` |

## Guías relacionadas

- [Columna contador](../columnas-y-filtros/columna-contador.md)
- [Columna calculada: la edad](../columnas-y-filtros/columna-calculada.md)
- [Columna de otra tabla](../columnas-y-filtros/columna-de-otra-tabla.md)

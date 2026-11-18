# Columna calculada: edad, nombre completo y fecha bonita

Una columna nueva en la tabla de pacientes que no existe en la base de datos, sino que se calcula con otros datos: la **edad** a partir de la fecha de nacimiento. Al final, dos variantes: **nombre completo** en una sola columna y la fecha como `dd/mm/aaaa`.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Necesitas algún paciente con fecha de nacimiento (`nacipac`).

## La idea

En este proyecto la tabla está escrita a mano: una cabecera `<th>` en el `<thead>` y una celda `<td>` en el `<tr>` del `<tbody>`. Para una columna calculada no hace falta tocar la base de datos: basta una función que reciba el paciente y devuelva el texto. El PDF es aparte, en `exportarPacientes()`, así que la columna se añade también allí si la quieres en el informe.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/utils/fechas.js` | **Nuevo.** Las funciones que calculan |
| `src/components/XestionPacientes.vue` | El import, la cabecera, la celda y el PDF |

## Paso 1 · Las funciones

Crea `src/utils/fechas.js` (al lado de `pdf.js` y `alertas.js`):

```js
// Edad en anyos a partir de una fecha "aaaa-mm-dd".
// Si todavia no ha cumplido anyos este anyo, resta uno.
export function calcularEdad(fecha) {
  // Si el paciente no tiene fecha de nacimiento, no se puede calcular nada
  if (!fecha) return "—";
  // "2000-05-10".split("-") -> ["2000","05","10"]; .map(Number) los pasa a numero
  const [anyo, mes, dia] = fecha.split("-").map(Number);
  const hoy = new Date();
  // Primero se restan los anyos sin mirar el mes: 2026 - 2000 = 26
  let edad = hoy.getFullYear() - anyo;
  // getMonth() cuenta los meses desde 0 (enero = 0), por eso se le suma 1
  const yaCumplio =
    hoy.getMonth() + 1 > mes || (hoy.getMonth() + 1 === mes && hoy.getDate() >= dia);
  // Si su cumpleanyos de este anyo aun no llego, tiene un anyo menos
  if (!yaCumplio) edad--;
  return edad;
}

// "2000-05-10" -> "10/05/2000". Solo cambia lo que se VE: en Mongo sigue como aaaa-mm-dd.
export function formatearFecha(fecha) {
  if (!fecha) return "—";
  const [anyo, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anyo}`;
}
```

## Paso 2 · El import

En `src/components/XestionPacientes.vue`, busca la línea `import { generarPDF } from "../utils/pdf.js";` y pega esto **justo debajo**:

```js
// Trae las dos funciones del fichero nuevo para usarlas en la tabla y en el PDF
import { calcularEdad, formatearFecha } from "../utils/fechas.js";
```

## Paso 3 · La cabecera de la columna

En el `<thead>`, busca la línea `<th>Provincia</th>` y pega esto **justo debajo**:

```vue
            <th>Idade</th>
```

## Paso 4 · La celda

En el `<tbody>`, busca la línea `<td>{{ u.propac }}</td>` y pega esto **justo debajo**:

```vue
            <!-- u es el paciente de esta fila, el que reparte el v-for.
                 El valor no esta en Mongo: lo calcula la funcion con su fecha de nacimiento. -->
            <td class="centrado">{{ calcularEdad(u.nacipac) }}</td>
```

> Importante: en el `<template>` se escribe `calcularEdad(...)` tal cual. El `.value` solo hace falta dentro del `<script>`.

## Paso 5 · Que salga también en el PDF (opcional)

Dentro de `exportarPacientes()`, busca:

```js
      cabeceras: ["DNI", "Apellidos", "Nombre", "Móvil"],
```

y **sustitúyela** por:

```js
      cabeceras: ["DNI", "Apellidos", "Nombre", "Móvil", "Edad"],
```

Después busca:

```js
        paciente.movilpac ?? "",
```

y **sustitúyela** por:

```js
        paciente.movilpac ?? "",
        calcularEdad(paciente.nacipac),
```

> Las cabeceras y las filas tienen que llevar **el mismo número de elementos y en el mismo orden**, o el PDF saldrá descolocado.

## Variante A · Fecha como dd/mm/aaaa

La tabla de pacientes no muestra hoy la fecha de nacimiento. Si quieres añadirla ya formateada, un `<th>Nacemento</th>` y esta celda:

```vue
            <td class="centrado">{{ formatearFecha(u.nacipac) }}</td>
```

## Variante B · Nombre completo en una columna

En el `<thead>`, sustituye estas dos líneas:

```vue
            <th>Nome</th>
            <th>Apellidos</th>
```

por esta:

```vue
            <th>Nome completo</th>
```

Y en el `<tbody>`, sustituye estas dos:

```vue
            <td>{{ u.nomepac }}</td>
            <td>{{ u.apelpac }}</td>
```

por esta (la plantilla `${...}` mete los dos datos en el mismo texto):

```vue
            <td>{{ `${u.nomepac} ${u.apelpac}` }}</td>
```

> Si quitas una cabecera tienes que quitar también su celda, o la tabla queda descuadrada.

## Qué deberías ver

1. Una columna «Idade» después de «Provincia», con un número (o «—» si el paciente no tiene fecha).
2. Con el Paso 5, el PDF de pacientes lleva también la edad.
3. Con la variante A, la fecha sale `10/05/2000`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| `calcularEdad is not defined` | Falta el Paso 2, o la ruta del import está mal (`../utils/fechas.js`) |
| La columna sale vacía | El `<td>` quedó fuera del `<tr>` del `v-for` |
| La tabla se descoloca | Hay más `<th>` que `<td>`, o al revés |
| Sale `NaN` | La fecha no está en formato `aaaa-mm-dd` |
| La edad está un año de más | Falta el `if (!yaCumplio) edad--` |
| El PDF sale descuadrado | `cabeceras` y `filas` no tienen el mismo número de columnas |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Dato derivado | Un valor que se calcula a partir de otros, no se guarda |
| Funciones en el `<template>` | Se pueden llamar directamente dentro de `{{ }}` |
| `split` y plantillas `${}` | Partir un texto y volver a juntarlo en otro orden |

## Guías relacionadas

- [Guía: campo nuevo](../../guias/campo-nuevo.md)

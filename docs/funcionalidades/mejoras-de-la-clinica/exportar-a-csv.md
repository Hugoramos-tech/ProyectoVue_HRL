# Exportar la tabla de citas a CSV

Un botón «CSV» junto al de PDF que descarga las citas en un fichero que se abre en Excel o LibreOffice, con las mismas columnas que la tabla.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

Un CSV es un texto plano: una fila por línea y las celdas separadas por `;`. Se construye ese texto, se mete en un `Blob` (un «fichero en memoria»), y se simula un clic en un enlace invisible que lo descarga. No hace falta ninguna librería: es todo JavaScript del navegador.

En este proyecto no hay ninguna lista de columnas compartida: cada `exportar...()` escribe sus `cabeceras` y sus `filas` a mano. El CSV hará lo mismo, con las mismas columnas que el PDF de citas.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/utils/csv.js` | Fichero **nuevo**: la función que descarga |
| `src/components/Citas.vue` | El import, la función y el botón |

## Paso 1 · La función que descarga

Crea el fichero `src/utils/csv.js` con este contenido:

```js
// Descarga una tabla como CSV. cabeceras es una lista de textos;
// filas, una lista de listas, igual que las que recibe generarPDF.
export function descargarCSV({ nombreArchivo, cabeceras, filas }) {
  // Cada valor va entre comillas, para que un punto y coma o un salto de linea
  // dentro del texto no rompa la columna. Y las comillas que contenga se
  // duplican: es la regla del formato CSV.
  const celda = (valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`;

  // Una linea por fila, con las celdas separadas por ";".
  // Excel en espanol espera el punto y coma, no la coma.
  const texto = [cabeceras, ...filas]
    .map((fila) => fila.map(celda).join(";"))
    .join("\n");

  // Un Blob es un fichero en memoria. El "﻿" del principio es la marca BOM:
  // sin ella, Excel ensena las tildes y la ñ mal.
  const blob = new Blob(["﻿" + texto], { type: "text/csv;charset=utf-8" });

  // Se crea una URL temporal para ese fichero y un enlace que se "pulsa" solo.
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();

  // Se libera la memoria del Blob: si no, se queda reservada hasta recargar.
  URL.revokeObjectURL(url);
}
```

Fíjate en que recibe **un objeto**, igual que `generarPDF`. Así las dos funciones se usan del mismo modo y no hay que recordar el orden de los argumentos.

## Paso 2 · El import

En `src/components/Citas.vue`, busca la línea `import { generarPDF } from "../utils/pdf.js"` y pega esto **justo debajo**:

```js
import { descargarCSV } from "../utils/csv.js"
```

## Paso 3 · La función de la pantalla

Busca la línea `async function guardarCita() {` y pega esto **justo encima**:

```js
// Descarga las citas de la tabla en un CSV, con las mismas columnas que el PDF.
// No es async: no hay nada que esperar, todo pasa en el navegador.
function exportarCitasCsv() {
  descargarCSV({
    nombreArchivo: "citas.csv",
    cabeceras: ["Fecha", "Hora", "Paciente", "Doctor", "Motivo", "Estado", "Observaciones"],
    filas: citas.value.map((item) => [
      item.fecha ?? "",
      item.hora ?? "",
      nombrePaciente(item.pacienteDNI),
      nombreDoctor(item.doctorId),
      item.motivo ?? "",
      etiquetaEstado(item.estado),
      item.observacions ?? "",
    ]),
  })
}
```

`nombrePaciente`, `nombreDoctor` y `etiquetaEstado` ya existen en este fichero: son las mismas que usa la tabla, así que el CSV sale con los nombres y no con los identificadores.

## Paso 4 · El botón

En el `<template>`, busca la línea `<!-- Actualiza las citas del paciente seleccionado y el catalogo de doctores. -->` y pega esto **justo encima**:

```vue
        <button
          class="citas-boton-informe"
          type="button"
          title="Exportar a CSV"
          aria-label="Exportar a CSV"
          :disabled="cargando || citas.length === 0"
          @click="exportarCitasCsv"
        >
          CSV
        </button>
```

Queda entre el botón del PDF y el de actualizar.

## Variante · Que el CSV lleve solo lo filtrado

Si hiciste alguna receta de filtros, cambia `citas.value` del Paso 3 por la última lista de la cadena (`citasFiltradas.value`, `citasOrdenadas.value`, la que sea), y lo mismo en el `:disabled` del botón.

## Variante · CSV de pacientes

En `src/components/XestionPacientes.vue`, el import es el mismo y la función va encima de `async function exportarPacientes() {`:

```js
function exportarPacientesCsv() {
  descargarCSV({
    nombreArchivo: "pacientes.csv",
    cabeceras: ["DNI", "Apellidos", "Nombre", "Correo", "Móvil", "Provincia", "Municipio"],
    filas: pacientes.value.map((paciente) => [
      paciente.dnipac ?? "",
      paciente.apelpac ?? "",
      paciente.nomepac ?? "",
      paciente.mailpac ?? "",
      paciente.movilpac ?? "",
      paciente.propac ?? "",
      paciente.munipac ?? "",
    ]),
  })
}
```

## Qué deberías ver

1. Un botón «CSV» entre el de exportar PDF y el de actualizar.
2. Al pulsarlo se descarga `citas.csv` sin abrir ninguna ventana.
3. En Excel o LibreOffice, una columna por dato, con las tildes y la ñ bien.
4. Con la tabla vacía, el botón está apagado.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| No se descarga nada | Mira la consola (F12): suele ser un fallo dentro de la función |
| Todo sale en una sola columna | Tu Excel espera otro separador: cambia `";"` por `","` |
| Las tildes salen como símbolos raros | Falta el `"﻿"` del principio del `Blob` |
| `descargarCSV is not defined` | Falta el Paso 2, o en el Paso 1 se olvidó el `export` |
| Salen identificadores en vez de nombres | Usa `nombrePaciente(...)` y `nombreDoctor(...)`, no `item.pacienteDNI` a secas |
| Una celda parte la fila en dos | Un texto con salto de línea: el entrecomillado del Paso 1 es justo lo que lo evita |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `Blob` | Un fichero en memoria, sin pasar por el servidor |
| `URL.createObjectURL` | Una dirección temporal para ese fichero |
| Enlace que se pulsa solo | La forma de lanzar una descarga desde JavaScript |
| BOM `﻿` | La marca que hace que Excel lea el fichero como UTF-8 |
| Entrecomillado CSV | Comillas alrededor y comillas dobladas dentro |

## Guías relacionadas

- [PDF: ficha individual de un doctor](../alertas-y-pdf/pdf-ficha.md)
- [Filtros en la tabla de citas](../columnas-y-filtros/filtro-citas-especialidad-y-fecha.md)

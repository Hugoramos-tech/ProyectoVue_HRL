# Exportar la tabla de citas a CSV

Un botón «CSV» junto al de PDF que descarga las citas en un fichero que se abre en Excel o LibreOffice, con las mismas columnas que la tabla.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Citas** (`/citas`).

## La idea

Un CSV es un texto con una fila por línea y las celdas separadas por `;`. Se construye ese texto, se mete en un `Blob` (un «fichero en memoria»), y se simula un clic en un enlace que lo descarga. Las columnas salen de la misma lista que usa el PDF, así que si la tabla está filtrada, el CSV también.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/utils/csv.js` | **Nuevo.** La función que descarga |
| `src/components/Citas.vue` | El import, la función y el botón |

## Paso 1 · La función

Crea `src/utils/csv.js`:

```js
// Descarga un CSV. `cabeceras` es una lista de textos; `filas`, una lista de listas.
export function descargarCSV(nombreFichero, cabeceras, filas) {
  // Cada valor va entre comillas (para que una coma o un punto y coma dentro no rompa la columna),
  // y las comillas que contenga se duplican: es la regla del formato CSV.
  const celda = (valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`;
  // Una línea por fila, con las celdas separadas por ";" (el separador que espera Excel en español)
  const texto = [cabeceras, ...filas].map((fila) => fila.map(celda).join(";")).join("\n");
  // Un Blob es un "fichero en memoria". El "\uFEFF" del principio hace que Excel muestre bien las tildes.
  const blob = new Blob(["\uFEFF" + texto], { type: "text/csv;charset=utf-8" });
  // Se crea una URL temporal para ese fichero y un enlace invisible que, al "pulsarlo", lo descarga
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreFichero;
  enlace.click();
  URL.revokeObjectURL(url); // se libera la memoria
}
```

## Paso 2 · El import

En `src/components/Citas.vue`, busca la línea `import { datosParaPdf } from "../utils/tabla.js";` y pega esto **justo debajo**:

```js
import { descargarCSV } from "../utils/csv.js";
```

## Paso 3 · La función de la página

Busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega esto **justo encima**:

```js
// Descarga las citas de la tabla en un CSV, con las mismas columnas que el PDF
function descargarCsv() {
  // datosParaPdf da las cabeceras y las filas ya calculadas (con los formatos de cada columna)
  const { cabeceras, filas } = datosParaPdf(columnas, citas.value);
  descargarCSV("citas.csv", cabeceras, filas);
}
```

## Paso 4 · El botón

Busca estas dos líneas y **sustitúyelas** por el bloque de debajo:

```vue
        <FileDown :size="14" /> PDF
      </AppButton>
```

```vue
        <FileDown :size="14" /> PDF
      </AppButton>
      <AppButton
        v-if="citas.length > 0"
        @click="descargarCsv"
      >
        <FileDown :size="14" /> CSV
      </AppButton>
```

## Variante · Que el CSV lleve solo lo filtrado

Si tienes una lista filtrada (receta «Filtros en citas»), usa `citasFiltradas.value` en lugar de `citas.value` en el Paso 3.

## Qué deberías ver

1. Un botón «CSV» al lado del de PDF.
2. Al pulsarlo se descarga `citas.csv`. En Excel o LibreOffice, una columna por dato, con las tildes bien.
3. La primera columna es `#` y las demás son las de la tabla.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| No se descarga nada | Mira la consola (F12): un error en la función |
| Todo sale en una sola columna | El programa espera otro separador: cambia `";"` por `","` |
| Las tildes salen mal | Falta el `"\uFEFF"` del principio |
| `descargarCSV is not defined` | Falta el Paso 2 |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Exportar las columnas de la tabla | La misma lista para PDF y CSV | `03_lecciones/06_pdf.md §7` |
| Funciones de ayuda | Un fichero en `utils/` que se importa | `03_lecciones/07_pinia.md` |

## Guías relacionadas

- [PDF: ficha individual](../alertas-y-pdf/pdf-ficha.md)
- [Filtros en citas](../columnas-y-filtros/filtro-citas-especialidad-y-fecha.md)

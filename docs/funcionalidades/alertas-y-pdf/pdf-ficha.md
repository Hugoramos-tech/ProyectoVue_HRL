# PDF: ficha individual de un doctor

Un botón en cada fila de la tabla de doctores que descarga un PDF con los datos de ese doctor en pares campo y valor (no como listado), con el nombre de fichero `doctor_<apellidos>.pdf`.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Doctores** (`/xestionDoctores`).

## La idea

Todos los PDF de la web pasan por una función, `generarPDF`, en `src/utils/pdf.js`. Recibe un título, las cabeceras, las filas y el nombre del fichero. Para una ficha, las cabeceras son `["Campo", "Valor"]` y cada fila es un par. **No hace falta tocar `pdf.js`** ni importar `jsPDF` en la vista.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionDoctores.vue` | La función de la ficha y el botón |

## Paso 1 · La función

En `src/components/XestionDoctores.vue`, busca la línea `async function descargarPdf() {` y pega esto **justo encima**:

```js
// Descarga la ficha de un doctor: una tabla de dos columnas, campo y valor.
// `d` es el doctor de la fila. generarPDF(título, cabeceras, filas, nombreFichero) crea y descarga el PDF.
async function descargarFicha(d) {
  try {
    await generarPDF(
      "Ficha de doctor",
      ["Campo", "Valor"], // cabeceras de las dos columnas
      [
        // Cada fila es una lista [campo, valor]. `${...}` mete datos dentro de un texto.
        ["Nome", `${d.nomedoc} ${d.apeldoc}`],
        ["Nº colexiado", d.coledoc],
        ["Especialidade", d.espedoc],
        ["Teléfono", d.movildoc],
        ["Correo", d.maildoc || "—"], // `||` = si no hay correo, un guion
      ],
      // Nombre del fichero: replace(/\s+/g, "_") cambia los espacios de los apellidos por guiones bajos
      `doctor_${d.apeldoc.replace(/\s+/g, "_")}.pdf`
    );
  } catch (e) {
    alertaError("Non se puido xerar o PDF.");
    console.error(e);
  }
}
```

Qué hace: `replace(/\s+/g, "_")` cambia los espacios de los apellidos por guiones bajos para el nombre del fichero. `generarPDF` y `alertaError` ya están importados en ese fichero.

## Paso 2 · El botón en cada fila

En `src/components/XestionDoctores.vue`, busca el bloque `<RowActions` que contiene la línea `@editar="editarDoctor(fila)"` (son cuatro líneas, hasta el `/>`) y **sustitúyelo** por:

```vue
        <RowActions
          @editar="editarDoctor(fila)"
          @eliminar="eliminarDoctorPorId(fila)"
        >
          <!-- Botón extra dentro de RowActions: sale antes de editar y eliminar -->
          <AppButton
            variante="fantasma"
            icono
            title="Ficha en PDF"
            aria-label="Ficha en PDF"
            @click="descargarFicha(fila)"
          >
            <FileDown :size="16" />
          </AppButton>
        </RowActions>
```

Qué hace: lo que va dentro de `<RowActions>` se pinta antes de los botones de editar y eliminar. `FileDown` y `AppButton` ya están importados en ese fichero.

## Qué deberías ver

1. Un icono de descarga en cada fila de doctores.
2. Al pulsarlo se descarga `doctor_Barreiro_Seoane.pdf` (con los apellidos del doctor).
3. El PDF tiene el título «Ficha de doctor», la fecha, una tabla con dos columnas y el pie con el número de página.

## Variantes

- **Ficha de un paciente:** igual, con `dnipac`, `nomepac`, `apelpac`, `nacipac`, `movilpac`... en `XestionPacientes.vue`.
- **PDF apaisado** (muchas columnas): añade `{ horizontal: true }` como quinto argumento de `generarPDF`.
- **Cambiar el aspecto del PDF** (colores, tipos de letra): `src/utils/pdf.js`, dentro de `autoTable(...)`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| No se descarga nada | Mira la consola (F12): un campo `undefined` rompe `.replace`; los doctores tienen siempre `apeldoc` |
| El botón no aparece | El bloque `<RowActions` no se sustituyó entero, o quedó un `/>` suelto |
| `FileDown is not defined` | El import de iconos del fichero no lo incluye (debería: `import { Stethoscope, ClipboardList, Save, FileDown, Eraser }`) |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Ficha de un solo registro | Tabla de campo y valor en vez de un listado | `03_lecciones/06_pdf.md §8` |
| `autoTable` y `.map()` | De una lista de objetos a las filas de la tabla del PDF | `03_lecciones/06_pdf.md §3 y §4` |

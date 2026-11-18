# PDF: ficha individual de un doctor

Un botón en cada fila de la tabla de doctores que descarga un PDF con los datos de ese doctor en pares **campo y valor** (no como listado), con el nombre de fichero `doctor_<apellidos>.pdf`.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Doctores** (`/xestionDoctores`).

## La idea

Todos los PDF de la aplicación pasan por una sola función, `generarPDF`, en `src/utils/pdf.js`. Para una ficha, las cabeceras son `["Campo", "Valor"]` y cada fila es un par. **No hace falta tocar `pdf.js`** ni importar `jsPDF` en la pantalla.

**Lo más importante de esta receta:** `generarPDF` recibe **un objeto**, no una lista de argumentos en orden. Se llama así:

```js
await generarPDF({
  titulo: "...",
  cabeceras: [...],
  filas: [...],
  nombreArchivo: "...",
  descripcion: "...",      // opcional
  orientacion: "landscape" // opcional, por defecto "portrait"
})
```

Si lo llamas con argumentos sueltos (`generarPDF("titulo", cabeceras, filas, "fichero.pdf")`) **no dará error, pero saldrá un PDF en blanco**, porque la función intentará leer `titulo` dentro del primer argumento y encontrará un texto. Es el fallo más fácil de cometer aquí.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionDoctores.vue` | La función de la ficha y el botón |

## Paso 1 · La función

Busca la línea `async function exportarDoctores() {` y pega esto **justo encima**:

```js
// Descarga la ficha de un doctor: una tabla de dos columnas, campo y valor.
// doctor es el registro de la fila. generarPDF recibe UN OBJETO con las opciones.
async function exportarFichaDoctor(doctor) {
  try {
    await generarPDF({
      titulo: "Ficha de doctor",
      descripcion: `${doctor.nomedoc} ${doctor.apeldoc} — ${doctor.espedoc}`,
      // Solo dos columnas: el nombre del campo y su valor.
      cabeceras: ["Campo", "Valor"],
      // Cada fila es una lista de dos elementos. Tiene que haber tantos
      // elementos por fila como cabeceras, o autoTable deja huecos.
      filas: [
        ["ID", doctor._id ?? ""],
        ["Nombre", `${doctor.nomedoc} ${doctor.apeldoc}`],
        ["Colegiado", doctor.coledoc ?? ""],
        ["Especialidad", doctor.espedoc ?? ""],
        ["Móvil", doctor.movildoc ?? ""],
        // || "—" pone un guion cuando el correo esta vacio, porque es opcional.
        ["Correo", doctor.maildoc || "—"],
      ],
      // replace(/\s+/g, "_") cambia los espacios de los apellidos por guiones bajos,
      // para que el nombre del fichero no lleve espacios.
      nombreArchivo: `doctor_${String(doctor.apeldoc ?? "sen_nome").replace(/\s+/g, "_")}.pdf`,
    });
  } catch (error) {
    alertaError(mensaxeDoErro(error, "No se pudo generar la ficha del doctor."));
  }
}
```

> `generarPDF`, `alertaError` y `mensaxeDoErro` ya están en este fichero: no hay que importar nada.

## Paso 2 · El botón en cada fila

En el `<template>`, busca la línea `<td class="celda-acciones">` y pega esto **justo debajo**:

```vue
              <button
                class="btn-accion"
                type="button"
                title="Ficha en PDF"
                aria-label="Ficha en PDF"
                @click="exportarFichaDoctor(doctor)"
              >
                📄
              </button>
```

El botón queda a la izquierda de ✏️ y 🗑️, en la misma celda de acciones.

## Variante · La ficha de un paciente

Igual, pero en `src/components/XestionPacientes.vue`. Ahí la fila del `v-for` se llama `u`, y los botones de esa tabla reciben el **índice**, no el objeto, así que el botón se escribe `@click="exportarFichaPaciente(u)"` pasando el objeto directamente.

La función, encima de `async function exportarPacientes() {`:

```js
async function exportarFichaPaciente(paciente) {
  try {
    await generarPDF({
      titulo: "Ficha de paciente",
      descripcion: `${paciente.nomepac} ${paciente.apelpac} — ${paciente.dnipac}`,
      cabeceras: ["Campo", "Valor"],
      filas: [
        ["DNI", paciente.dnipac ?? ""],
        ["Nombre", `${paciente.nomepac} ${paciente.apelpac}`],
        ["Fecha de nacimiento", paciente.nacipac ?? ""],
        ["Correo", paciente.mailpac || "—"],
        ["Móvil", paciente.movilpac ?? ""],
        ["Dirección", paciente.dirpac ?? ""],
        ["Provincia", paciente.propac ?? ""],
        ["Municipio", paciente.munipac ?? ""],
      ],
      nombreArchivo: `paciente_${paciente.dnipac}.pdf`,
    });
  } catch (error) {
    alertaError(mensaxeDoErro(error, "No se pudo generar la ficha del paciente."));
  }
}
```

## Variante · PDF apaisado

Cuando hay muchas columnas, se añade una opción más al objeto:

```js
      orientacion: "landscape",
```

`portrait` es vertical (el valor por defecto) y `landscape` horizontal. `exportarDoctores()` y `exportarCitas()` ya la usan.

## Variante · Cambiar el aspecto del PDF

Los colores, el tamaño de letra y el pie de página están en `src/utils/pdf.js`, dentro de la llamada a `autoTable(...)`. La constante `COLOR_PRIMARIO` del principio es el verde de la cabecera de las tablas, y está en formato `[R, G, B]` porque es lo que espera jsPDF.

## Qué deberías ver

1. Un icono 📄 en cada fila de doctores.
2. Al pulsarlo se descarga `doctor_Barreiro_Seoane.pdf`, con los apellidos de ese doctor.
3. El PDF tiene el título «Ficha de doctor», la fecha de generación, el nombre y la especialidad como descripción, una tabla de dos columnas y el pie con el número de página.
4. Si el doctor no tiene correo, en esa fila sale un guion.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El PDF sale en blanco o sin tabla | Llamaste a `generarPDF` con argumentos sueltos: tiene que ser **un objeto** |
| No se descarga nada | Mira la consola (F12): un `undefined` en `.replace` lo rompe, de ahí el `String(... ?? "")` |
| `exportarFichaDoctor is not defined` | El Paso 1 quedó dentro de otra función |
| El botón no aparece | El Paso 2 tiene que ir dentro del `<td class="celda-acciones">` |
| El nombre del fichero lleva espacios | Falta el `.replace(/\s+/g, "_")` |
| La tabla sale descuadrada | Alguna fila tiene más o menos de dos elementos: deben coincidir con las cabeceras |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Ficha de un solo registro | Tabla de campo y valor en vez de un listado |
| Parámetros por objeto | El orden da igual y se pueden omitir los opcionales |
| `??` y `||` | Valor por defecto cuando el campo falta o está vacío |
| `autoTable` | Dibuja la tabla y reparte los saltos de página |

## Guías relacionadas

- [Exportar a CSV](../mejoras-de-la-clinica/exportar-a-csv.md)
- [Columna calculada](../columnas-y-filtros/columna-calculada.md)

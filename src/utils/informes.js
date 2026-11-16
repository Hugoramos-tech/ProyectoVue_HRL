// ===========================================================================
//  src/utils/informes.js   (UD7 - Generación de informes PDF con Vue)
//
//  Genera un PDF con una tabla a partir de los datos que hay en pantalla.
//
//  Librerías instaladas con:  npm install jspdf jspdf-autotable
//    - jspdf           -> crea el documento PDF
//    - jspdf-autotable -> dibuja tablas dentro de ese documento
// ===========================================================================

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Crea y descarga un PDF con un título y una tabla.
 *
 * @param {string}     titulo        Título que sale arriba del documento.
 * @param {string[]}   columnas      Cabeceras de la tabla. Ej: ["DNI", "Nome"]
 * @param {string[][]} filas         Datos: un array por cada fila de la tabla.
 * @param {string}     nombreFichero Nombre del archivo que se descarga.
 *
 * Ejemplo de uso desde un componente:
 *
 *   exportarTablaPDF({
 *     titulo: 'Listaxe de pacientes',
 *     columnas: ['DNI', 'Apelidos', 'Nome'],
 *     filas: pacientes.value.map(p => [p.dnipac, p.apelpac, p.nomepac]),
 *     nombreFichero: 'pacientes.pdf'
 *   })
 */
export function exportarTablaPDF({
    titulo = 'Informe',
    columnas = [],
    filas = [],
    nombreFichero = 'informe.pdf'
} = {}) {

    // 1) Creamos el documento: horizontal (landscape) para que quepan bien
    //    todas las columnas, unidades en mm y tamaño A4.
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    // 2) Título del informe.
    doc.setFontSize(16)
    doc.text(titulo, 14, 18)

    // 3) Subtítulo con la fecha y la hora en que se generó el informe.
    doc.setFontSize(10)
    doc.text(`Xerado o ${new Date().toLocaleString('es-ES')}`, 14, 25)

    // 4) La tabla: autoTable se encarga solo de los saltos de página.
    autoTable(doc, {
        head: [columnas],   // una sola fila de cabecera
        body: filas,        // el resto de filas (los datos)
        startY: 30,         // empieza por debajo del título
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [27, 101, 52] },          // verde corporativo (RGB)
        alternateRowStyles: { fillColor: [245, 245, 245] } // filas cebreadas
    })

    // 5) Pie de página con la numeración "Páxina X de Y".
    const totalPaxinas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPaxinas; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
            `Páxina ${i} de ${totalPaxinas} - XestiónApp Sanidade Teis`,
            14,
            doc.internal.pageSize.getHeight() - 8
        )
    }

    // 6) save() lanza la descarga del fichero en el navegador.
    doc.save(nombreFichero)
}

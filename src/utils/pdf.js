// Genera un informe en PDF con titulo y tabla a partir de los datos recibidos.
// jspdf crea el documento y jspdf-autotable dibuja la tabla.
// jsPDF espera el color descompuesto en [R, G, B]; es el verde primario de la interfaz.
const COLOR_PRIMARIO = [20, 84, 58];

// Los parametros van en un objeto, asi el orden es indiferente y se pueden omitir.
export async function generarPDF({
  titulo,
  cabeceras,
  filas,
  nombreArchivo,
  descripcion = "",
  orientacion = "portrait",
}) {
  // Import dinamico: las librerias se descargan al pedir el informe, no al abrir la app.
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  // portrait es vertical y landscape horizontal, util cuando hay muchas columnas.
  const doc = new jsPDF(orientacion);
  const fecha = new Date().toLocaleDateString("es-ES");

  // Titulo y fecha del informe; doc.text situa el texto en milimetros desde la esquina.
  doc.setFontSize(18);
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.text(titulo, 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Fecha de generación: ${fecha}`, 14, 28);

  // Altura donde arranca la tabla; baja un poco mas si hay descripcion por encima.
  let inicioTabla = 35;
  if (descripcion) {
    const lineasDescripcion = doc.splitTextToSize(
      descripcion,
      doc.internal.pageSize.getWidth() - 28,
    );
    doc.text(lineasDescripcion, 14, inicioTabla);
    inicioTabla += lineasDescripcion.length * 5 + 2;
  }

  // autoTable reparte las filas y resuelve por su cuenta los saltos de pagina.
  autoTable(doc, {
    startY: inicioTabla,
    head: [cabeceras],
    body: filas,
    margin: { left: 14, right: 14, bottom: 18 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: COLOR_PRIMARIO,
    },
    // Se ejecuta al cerrar cada pagina y escribe el pie con su numero.
    didDrawPage: () => {
      const anchoPagina = doc.internal.pageSize.getWidth();
      const altoPagina = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("Informe generado desde la aplicación", 14, altoPagina - 8);
      doc.text(
        `Página ${doc.internal.getCurrentPageInfo().pageNumber}`,
        anchoPagina - 14,
        altoPagina - 8,
        { align: "right" },
      );
    },
  });

  // save lanza la descarga y cierra el documento: tiene que ser la ultima instruccion.
  doc.save(nombreArchivo);
}

<template>
  <!-- ======================= ZONA TEMPLATE ===========================
       Página estática con la política de privacidad.
       Se abre desde el enlace del formulario de pacientes y de doctores
       (con target="_blank", en una pestaña nueva) y desde el pie de página.
  ================================================================== -->
  <div class="politica-privacidad">
    <h4>Política de privacidad y confidencialidad</h4>

    <h5>Protección de datos y confidencialidad</h5>
    <p>
      Para poder registrar y gestionar sus datos como paciente, es necesario
      aceptar las condiciones de confidencialidad y protección de datos.
    </p>
    <p>
      Sus datos personales y sanitarios serán tratados de forma confidencial
      y utilizados únicamente para las finalidades relacionadas con la gestión
      de su atención sanitaria y los servicios proporcionados por Sanidade Teis.
    </p>

    <h5>¿Qué datos se recopilan?</h5>
    <p>
      Para la gestión del paciente pueden solicitarse datos identificativos y
      de contacto, como nombre, apellidos, DNI/NIE, fecha de nacimiento,
      teléfono, correo electrónico y datos de domicilio.
    </p>

    <h5>Confidencialidad</h5>
    <p>
      La información facilitada por el paciente será tratada de manera
      confidencial y no será utilizada para fines distintos de los relacionados
      con la gestión y atención sanitaria.
    </p>

    <h5>Protección de la información</h5>
    <p>
      Se aplicarán las medidas necesarias para proteger los datos frente a
      accesos, modificaciones o usos no autorizados.
    </p>

    <h5>Derechos del paciente</h5>
    <p>
      El paciente puede ejercer sus derechos de acceso, rectificación,
      supresión, oposición y demás derechos reconocidos por la normativa
      vigente en materia de protección de datos.
    </p>

    <h5>Aceptación</h5>
    <p>
      Al marcar la casilla de aceptación, el paciente declara haber leído y
      comprendido esta información y acepta el tratamiento de sus datos de
      acuerdo con las condiciones indicadas.
    </p>

    <p class="aviso">
      <strong>Importante:</strong> Este texto tiene carácter informativo y forma
      parte de un proyecto didáctico. No sustituye una política de privacidad
      legal ni el asesoramiento de un profesional en materia de protección de
      datos.
    </p>

    <!-- Enlace de vuelta: router-link no recarga la página -->
    <router-link class="volver" to="/">⬅ Volver ao inicio</router-link>
  </div>
</template>

<style scoped>
/* scoped = estos estilos solo afectan a este componente */
.politica-privacidad {
  max-width: 900px;      /* línea de texto no demasiado larga: se lee mejor */
  margin: 0 auto;        /* centrado */
  padding: 1.5rem;
  text-align: left;
  line-height: 1.6;      /* interlineado cómodo para leer */
  background: white;
}

.politica-privacidad h4 {
  background-color: #1b6534;
  color: white;
  padding: 0.6rem;
  text-align: center;
}

.politica-privacidad h5 {
  margin-top: 1.5rem;
  margin-bottom: 0.3rem;
  color: #1b6534;
}

.politica-privacidad p {
  margin-bottom: 0.8rem;
}

/* Aviso destacado con un borde lateral amarillo */
.aviso {
  margin-top: 1.5rem;
  padding: 0.8rem;
  background-color: #fff8e1;
  border-left: 4px solid #f9d342;
}

.volver {
  display: inline-block;
  margin-top: 1.5rem;
  color: #1b6534;
  font-weight: 600;
}

/* Responsive: menos padding en pantallas pequeñas */
@media (max-width: 768px) {
  .politica-privacidad {
    padding: 1rem;
  }
}
</style>

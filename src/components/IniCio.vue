<template>
  <main class="inicio">
    <!-- Cabecera de bienvenida: título principal + párrafo explicativo -->
    <section class="hero">
      <h1>Benvido/a a XestiónApp</h1>
      <p class="intro">
        Aplicación de xestión da clínica <strong>Sanidade Teis</strong>, feita con Vue 3.
        Desde aquí podes administrar os <strong>pacientes</strong>, o cadro de
        <strong>doutores</strong> e a axenda de <strong>citas</strong> do centro.
      </p>

      <!--
        Imagen de portada. Se importa como ruta relativa desde /src/assets,
        por lo que Vite la procesa y la incluye en el build.
        El atributo alt describe la imagen para lectores de pantalla.
      -->
      <img
        src="../assets/hero.png"
        alt="Ilustración dunha clínica médica coa equipa sanitaria"
        class="hero-img"
      />
    </section>

    <!--
      Tres tarjetas de acceso rápido. Cada una es un <router-link>, así que
      toda la tarjeta es clicable y la navegación se hace sin recargar la página.
    -->
    <section class="tarxetas">
      <router-link to="/xestionpacientes" class="tarxeta">
        <h2>Pacientes</h2>
        <p>Consulta, engade, edita e elimina as fichas dos pacientes.</p>
      </router-link>

      <router-link to="/xestion-doctores" class="tarxeta">
        <h2>Doutores</h2>
        <p>Xestiona o persoal médico e as súas especialidades.</p>
      </router-link>

      <router-link to="/xestion-citas" class="tarxeta">
        <h2>Citas</h2>
        <p>Organiza a axenda de citas entre pacientes e doutores.</p>
      </router-link>
    </section>
  </main>
</template>

<style scoped>
.inicio {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
  text-align: center;
}

.hero h1 {
  color: #1b6534;
  margin-bottom: 0.5rem;
}

.intro {
  color: #333;
  line-height: 1.6;
  margin: 0 auto 1.5rem auto;
  max-width: 650px;
}

/* max-width: 100% evita que la imagen se salga de la pantalla en móvil */
.hero-img {
  max-width: 100%;
  height: auto;
  border-radius: 0.8rem;
}

/*
  Contenedor flexbox de las tarjetas: se reparten en una fila y,
  gracias a flex-wrap, saltan de línea si no caben.
*/
.tarxetas {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 2.5rem;
}

.tarxeta {
  flex: 1 1 250px;          /* crece, se encoge y parte de 250px de ancho */
  max-width: 300px;
  padding: 1.2rem;
  border: 0.15rem solid #1b6534;
  border-radius: 0.8rem;
  background: #ffffff;
  color: #1b6534;
  text-decoration: none;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

/* Efecto al pasar el ratón: fondo verde claro y pequeña elevación */
.tarxeta:hover {
  background: #07c751;
  color: #ffffff;
  transform: translateY(-0.2rem);
}

.tarxeta h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.tarxeta p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Responsive: en móvil las tarjetas se apilan en una sola columna */
@media (max-width: 768px) {
  .tarxetas {
    flex-direction: column;
    align-items: center;
  }

  .tarxeta {
    max-width: 100%;
    width: 100%;
  }
}
</style>

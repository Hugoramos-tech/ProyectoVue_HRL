<template>
  <main class="sobrenos">
    <h1>Sobre nós</h1>

    <!-- Descripción del proyecto y del centro ficticio -->
    <section class="bloque">
      <h2>O proxecto</h2>
      <p>
        <strong>XestiónApp</strong> é unha aplicación web de xestión clínica
        desenvolvida como exercicio académico para o módulo de
        <em>Deseño de Interfaces Web</em>. Permite administrar pacientes,
        doutores e citas médicas desde unha interface única e responsive.
      </p>
      <p>
        O centro <strong>Sanidade Teis</strong> é un centro de saúde
        <em>ficticio</em> situado no barrio de Teis (Vigo), empregado só como
        contexto para o exercicio. Ningún dato desta aplicación é real.
      </p>
    </section>

    <!-- Lista de tecnologías empleadas en el proyecto -->
    <section class="bloque">
      <h2>Tecnoloxías empregadas</h2>
      <ul class="tecnoloxias">
        <li>Vue 3 (Composition API con <code>script setup</code>)</li>
        <li>Vite como ferramenta de compilación</li>
        <li>Vue Router para a navegación entre vistas</li>
        <li>Pinia para a xestión do estado</li>
        <li>Axios para as peticións HTTP</li>
        <li>Express como servidor da API</li>
        <li>MongoDB con Mongoose</li>
        <li>Docker para a contedorización</li>
        <li>SweetAlert2 para as alertas e confirmacións</li>
        <li>jsPDF para a xeración de informes en PDF</li>
      </ul>
    </section>

    <!-- Datos del autor del trabajo -->
    <section class="bloque autor">
      <h2>Autor</h2>
      <p class="nome">Hugo Ramos López</p>
      <p>2º DAW — Deseño de Interfaces Web</p>
    </section>
  </main>
</template>

<style scoped>
.sobrenos {
  max-width: 850px;
  margin: 0 auto;
  padding: 1.5rem;
  line-height: 1.6;
  color: #333;
}

h1 {
  color: #1b6534;
  text-align: center;
}

h2 {
  color: #1b6534;
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
}

/* Cada bloque es una "tarjeta" con borde izquierdo verde */
.bloque {
  background: #ffffff;
  border-left: 0.3rem solid #07c751;
  border-radius: 0.5rem;
  padding: 1rem 1.2rem;
  margin-bottom: 1.2rem;
  box-shadow: 0 0.1rem 0.4rem rgba(0, 0, 0, 0.08);
}

.tecnoloxias {
  margin: 0;
  padding-left: 1.2rem;
}

.tecnoloxias li {
  margin-bottom: 0.3rem;
}

.autor {
  text-align: center;
  border-left: none;
  border-top: 0.3rem solid #1b6534;
}

.nome {
  font-weight: bold;
  font-size: 1.1rem;
  color: #1b6534;
  margin-bottom: 0.2rem;
}

/* Responsive: menos márgenes y texto algo menor en pantallas pequeñas */
@media (max-width: 768px) {
  .sobrenos {
    padding: 1rem 0.8rem;
    font-size: 0.95rem;
  }

  .bloque {
    padding: 0.8rem 1rem;
  }
}
</style>

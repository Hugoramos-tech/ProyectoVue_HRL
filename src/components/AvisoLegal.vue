<template>
  <main class="aviso">
    <h1>Aviso Legal</h1>

    <!-- Datos del titular (ficticio) del sitio web -->
    <section>
      <h2>1. Titular do sitio web</h2>
      <p>
        Este sitio web pertence a <strong>Sanidade Teis</strong>, centro de saúde
        ficticio con domicilio en Teis (Vigo, Pontevedra), creado unicamente con
        fins educativos no marco dun traballo académico.
      </p>
    </section>

    <!-- Para qué sirve el sitio -->
    <section>
      <h2>2. Finalidade</h2>
      <p>
        A finalidade de <strong>XestiónApp</strong> é demostrar o manexo de
        pacientes, doutores e citas médicas nunha aplicación web. Non se presta
        ningún servizo sanitario real nin se tramita ningunha cita verdadeira.
      </p>
    </section>

    <!-- Derechos sobre el contenido -->
    <section>
      <h2>3. Propiedade intelectual</h2>
      <p>
        Os textos, o deseño e o código desta aplicación son obra do seu autor.
        As bibliotecas de terceiros empregadas (Vue, Vite, Pinia, Axios e outras)
        están suxeitas ás súas respectivas licenzas de software libre.
      </p>
    </section>

    <!-- Limitación de responsabilidad -->
    <section>
      <h2>4. Responsabilidade</h2>
      <p>
        O autor non se responsabiliza do uso que se faga da información aquí
        amosada, xa que todos os datos son <em>inventados</em> e de proba.
        O sitio pode conter erros ou estar temporalmente indispoñible.
      </p>
    </section>

    <!-- Enlace interno a la política de privacidad -->
    <section>
      <h2>5. Protección de datos</h2>
      <p>
        Para coñecer como se tratan os datos nesta aplicación de proba, consulta a
        <router-link to="/politica-privacidad">política de privacidade</router-link>.
      </p>
    </section>

    <!-- Nota final destacada: proyecto académico sin validez legal -->
    <p class="nota">
      Nota: este aviso legal forma parte dun <strong>proxecto didáctico</strong>
      de 2º de DAW e <strong>non ten ningunha validez legal</strong>.
    </p>
  </main>
</template>

<style scoped>
.aviso {
  max-width: 800px;
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
  font-size: 1.05rem;
  margin-bottom: 0.3rem;
}

section {
  margin-bottom: 1.2rem;
}

a {
  color: #07c751;
  font-weight: 500;
}

/* Recuadro final destacado para el descargo académico */
.nota {
  background: #eaf7ee;
  border-left: 0.3rem solid #07c751;
  border-radius: 0.4rem;
  padding: 0.8rem 1rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .aviso {
    padding: 1rem 0.8rem;
    font-size: 0.95rem;
  }
}
</style>

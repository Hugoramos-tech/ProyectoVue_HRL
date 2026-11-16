<template>
  <!-- ======================= ZONA TEMPLATE ===========================
       Este es el componente RAÍZ: lo que se ve en todas las páginas.
       - NavBar      -> menú superior, siempre visible
       - router-view -> HUECO donde el router mete la página actual
       - FooTer      -> pie de página, siempre visible
  ================================================================== -->
  <div id="app">

    <main class="container">
      <NavBar />

      <!-- Aquí dentro se dibuja el componente de la ruta activa -->
      <router-view />

      <FooTer />
    </main>
  </div>
</template>

<script setup>
// ======================== ZONA SCRIPT ===============================
// Con <script setup> basta con importar los componentes: Vue los registra
// automáticamente y ya se pueden usar en el template de arriba.
import NavBar from './components/NavBar.vue';
import FooTer from './components/FooTer.vue';
</script>

<style>
/* ========================= ZONA STYLE ==============================
   Este <style> NO lleva "scoped" a propósito: son estilos de la
   estructura general (el contenedor que centra toda la aplicación).
================================================================== */
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* el footer se queda abajo del todo */
  width: 100%;
  height: 100%;
  max-width: 1400px;
  min-height: 100vh;              /* ocupa como mínimo toda la pantalla */
  margin: 0 auto;                 /* centra horizontalmente */
  padding: 1rem;
  padding-bottom: 0;
  box-sizing: border-box;         /* el padding no suma ancho extra */
}

/* Responsive: en pantallas pequeñas estrechamos el contenedor */
@media (max-width: 768px) {
  .container {
    width: 90vw;
  }
}
</style>

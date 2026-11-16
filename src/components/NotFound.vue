<template>
  <!-- ======================= ZONA TEMPLATE ===========================
       Página de error 404. El router la muestra cuando la URL escrita
       no coincide con ninguna ruta (ver la ruta comodín :pathMatch).
  ================================================================== -->
  <div class="non-atopada">
    <h2>A páxina non se atopa</h2>

    <!-- La imagen vive en src/assets, por eso la ruta empieza por ../ .
         El alt es obligatorio para accesibilidad (lectores de pantalla). -->
    <img src="../assets/404.png" alt="Erro 404: páxina non atopada" />

    <p>Comproba o enderezo ou volve ao inicio.</p>

    <!-- router-link navega SIN recargar la página (es una SPA) -->
    <router-link class="btn-volver" to="/">⬅ Volver ao inicio</router-link>
  </div>
</template>

<style scoped>
/* scoped = estos estilos solo afectan a ESTE componente */
.non-atopada {
  text-align: center;
  padding: 2rem 1rem;
}

.non-atopada img {
  max-width: 100%;   /* nunca se sale de la pantalla en el móvil */
  height: auto;      /* mantiene la proporción de la imagen */
  margin: 1rem auto;
}

.btn-volver {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #1b6534;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.btn-volver:hover {
  background-color: #07c751;
}
</style>

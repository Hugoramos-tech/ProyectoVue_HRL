<template>
  <nav class="navbar">
    <div class="logo">XestiónApp</div>

    <!--
      Botón "hamburguesa": solo se ve en pantallas pequeñas (ver media query).
      Al hacer click invertimos el valor de isOpen (true -> false, false -> true),
      por eso se abre y se cierra con el mismo botón.
    -->
    <button class="hamburger" @click="isOpen = !isOpen">☰</button>

    <!--
      :class dinámico: siempre aplica la clase "menu" y añade la clase "open"
      únicamente cuando isOpen vale true. En móvil, .menu está oculto
      (display: none) y .menu.open lo muestra (display: flex).
    -->
    <ul :class="['menu', { open: isOpen }]">
      <!--
        Al pulsar cualquier enlace ponemos isOpen = false para que el menú
        desplegable se cierre solo después de navegar en móvil.
      -->
      <li><RouterLink to="/" @click="isOpen = false">Inicio</RouterLink></li>
      <li><RouterLink to="/servizos-medicos" @click="isOpen = false">Servizos médicos</RouterLink></li>
      <li><RouterLink to="/xestionpacientes" @click="isOpen = false">Pacientes</RouterLink></li>
      <li><RouterLink to="/xestion-doctores" @click="isOpen = false">Doctores</RouterLink></li>
      <li><RouterLink to="/xestion-citas" @click="isOpen = false">Citas</RouterLink></li>
      <li><RouterLink to="/sobrenos" @click="isOpen = false">Sobre nós</RouterLink></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from "vue"

/*
  isOpen es una variable reactiva (ref) de tipo booleano que guarda el estado
  del menú: false = menú cerrado (valor inicial), true = menú abierto.
  Al ser un ref, cuando cambia su valor Vue vuelve a pintar la plantilla
  y se actualiza automáticamente el :class del <ul>.
*/
const isOpen = ref(false)
</script>

<style scoped>
.navbar {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #1b6534;
  color: white;
}

.logo {
  font-weight: bold;
  font-size: 1rem;
}

/* En escritorio el menú es una fila horizontal de enlaces */
.menu {
  display: flex;
  gap: 0.8rem;
  list-style: none;
}

.menu a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

/* Vue Router añade esta clase al enlace de la página activa */
.menu a.router-link-active {
  border-bottom: 0.2rem solid #ffe66d;
}

/* El botón hamburguesa está oculto en escritorio */
.hamburger {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

/*
  Media query responsive: por debajo de 768px (móvil/tablet)
  mostramos el botón hamburguesa y convertimos el menú en un panel
  vertical flotante que solo aparece si tiene la clase .open.
*/
@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  .menu {
    display: none;
    position: absolute;
    top: 50px;
    right: 0;
    flex-direction: column;
    background: #1b4965;
    padding: 1rem;
    z-index: 10;
  }

  .menu.open {
    display: flex;
  }
}
</style>

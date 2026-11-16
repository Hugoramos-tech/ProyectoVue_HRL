<template>
  <footer class="footer-content footer">
    <!--
      Lista de enlaces legales. Antes había un <router-link> suelto dentro
      del <ul> (HTML inválido): ahora cada enlace va dentro de su propio <li>.
    -->
    <ul class="link-aviso">
      <li><router-link to="/avisolegal">Aviso Legal</router-link></li>
      <li><router-link to="/politica-privacidad">Política de privacidade</router-link></li>
    </ul>

    <!--
      new Date().getFullYear() crea un objeto Date con la fecha actual del
      navegador y devuelve el año (p. ej. 2026). Así el año del copyright
      se actualiza solo y no hay que editarlo a mano cada año.
    -->
    <p>© {{ new Date().getFullYear() }} XestiónApp — Desenvolvido en Vue 3</p>
  </footer>
</template>

<style scoped>
footer {
  box-sizing: border-box;
  position: static;
  justify-self: center;
  width: 100%;
}

.footer {
  background: #1b6534;
  color: white;
  text-align: center;
  padding: 0.5rem;
  margin-top: 3rem;
  font-size: 0.9rem;
}

/* Lista de enlaces sin viñetas y en horizontal */
.link-aviso {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.link-aviso a {
  color: #f9d342;
  text-decoration: none;
  cursor: pointer;
}

.link-aviso a:hover {
  text-decoration: underline;
}

.footer-content {
  display: flex;
  justify-content: center; /* centra horizontalmente */
  align-items: center;     /* alinea verticalmente na mesma liña */
  gap: 5rem;               /* espazo entre o texto e os enlaces */
  flex-wrap: wrap;         /* en pantallas pequenas pasa a varias liñas */
}
</style>

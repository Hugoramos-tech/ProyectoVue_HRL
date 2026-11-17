<template>
  <main class="servizos">
    <h1>Servizos médicos</h1>

    <p class="intro">
      Estas son as especialidades médicas que ofrece o centro
      <strong>Sanidade Teis</strong>. Podes buscar unha especialidade
      concreta escribindo no buscador.
    </p>

    <!--
      Buscador. v-model enlaza a caixa de texto coa variable reactiva filtro:
      ao escribir cambia filtro e Vue recalcula o computed servizosFiltrados.
    -->
    <div class="buscador">
      <input
        type="text"
        v-model="filtro"
        placeholder="Buscar especialidade..."
      />
    </div>

    <!--
      v-if / v-else-if / v-else: só se pinta unha das tres ramas.
      Mentres cargan os datos amosamos un aviso, se non hai resultados
      outro, e en caso contrario a lista de especialidades.
    -->
    <p v-if="cargando" class="aviso">Cargando servizos...</p>

    <p v-else-if="servizosFiltrados.length === 0" class="aviso">
      Non hai ningunha especialidade que coincida coa busca.
    </p>

    <section v-else class="tarxetas">
      <!--
        v-for percorre o array xa filtrado. A clave :key ten que ser única,
        por iso usamos o id de cada especialidade.
      -->
      <article
        v-for="servizo in servizosFiltrados"
        :key="servizo.id"
        class="tarxeta"
      >
        <h2>{{ servizo.nm }}</h2>
        <p class="doutores">
          {{ contarDoutores(servizo.nm) }} doutor(es) nesta especialidade
        </p>
      </article>
    </section>

    <p class="total">
      Total: {{ servizosFiltrados.length }} de {{ servizos.length }} especialidades
    </p>
  </main>
</template>

<script setup>
/// Zona de declaracións

// ref       -> variable reactiva simple (no script accédese con .value)
// computed  -> valor calculado, só se recalcula cando cambian os seus datos
// onMounted -> gancho do ciclo de vida: execútase ao montar o compoñente
import { ref, computed, onMounted } from 'vue'

// Capa de API: funcións que falan co backend usando axios
import { obtenerEspecialidades } from '../api/especialidades.js'
import { getDoctores } from '../api/doctores.js'

// Avisos con SweetAlert2, centralizados en utils/alertas.js (UD6)
import { alertaError } from '../utils/alertas.js'

const servizos = ref([])    // catálogo de especialidades que chega do backend
const doutores = ref([])    // lista de doutores, para contar cantos hai por especialidade
const cargando = ref(true)  // true mentres se piden os datos ao backend

// Texto do buscador. Ao ser un ref, calquera cambio fai que Vue
// volva calcular todo o que dependa del (aquí o computed de abaixo).
const filtro = ref('')

// COMPUTED: a lista de especialidades xa filtrada polo buscador.
// Gárdase en caché e só se recalcula cando cambian servizos ou filtro,
// así nunca modificamos o array orixinal.
const servizosFiltrados = computed(() => {
    const texto = filtro.value.trim().toLowerCase()

    // Se o buscador está baleiro devolvemos a lista completa
    if (texto === '') return servizos.value

    // filter() devolve un array NOVO cos elementos que cumpren a condición
    return servizos.value.filter(servizo =>
        servizo.nm.toLowerCase().includes(texto)
    )
})

/// Zona de ciclo de vida

// onMounted execútase unha soa vez, cando o compoñente xa está no DOM.
// É o sitio correcto para pedir os datos iniciais ao backend.
onMounted(async () => {
    await cargarDatos()
})

/// Zona de métodos ou funcións

// Pide ao backend o catálogo de especialidades e a lista de doutores.
async function cargarDatos() {
    try {
        servizos.value = await obtenerEspecialidades()
        doutores.value = await getDoctores()
    } catch (error) {
        console.error('Erro ao cargar os servizos:', error)
        alertaError('Non se puideron cargar os servizos médicos')
    } finally {
        // finally execútase tanto se foi ben como se houbo erro,
        // así o aviso de "Cargando..." desaparece sempre.
        cargando.value = false
    }
}

// Funcións auxiliares

// Conta cantos doutores hai dunha especialidade concreta.
// espedoc é o campo da ficha do doutor que garda a súa especialidade.
function contarDoutores(nomeEspecialidade) {
    return doutores.value.filter(doutor => doutor.espedoc === nomeEspecialidade).length
}
</script>

<style scoped>
.servizos {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
  line-height: 1.6;
  color: #333;
}

h1 {
  color: #1b6534;
  text-align: center;
}

.intro {
  text-align: center;
  max-width: 650px;
  margin: 0 auto 1.5rem auto;
}

.buscador {
  text-align: center;
  margin-bottom: 1.5rem;
}

.buscador input {
  width: 100%;
  max-width: 350px;
  padding: 0.5rem 0.8rem;
  border: 0.1rem solid #ccc;
  border-radius: 0.4rem;
  font-size: 1rem;
}

.buscador input:focus {
  outline: none;
  border-color: #1b6534;
}

/*
  Contedor flexbox das tarxetas: repártense nunha fila e,
  grazas a flex-wrap, saltan de liña se non caben.
*/
.tarxetas {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

/* Cada tarxeta ten o bordo esquerdo verde, igual que en "Sobre nós" */
.tarxeta {
  flex: 1 1 250px;
  max-width: 300px;
  background: #ffffff;
  border-left: 0.3rem solid #07c751;
  border-radius: 0.5rem;
  padding: 1rem 1.2rem;
  box-shadow: 0 0.1rem 0.4rem rgba(0, 0, 0, 0.08);
}

.tarxeta h2 {
  color: #1b6534;
  font-size: 1.05rem;
  margin: 0 0 0.3rem 0;
}

.doutores {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.aviso {
  text-align: center;
  color: #666;
  font-style: italic;
}

.total {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

/* Responsive: menos marxes e texto algo menor en pantallas pequenas */
@media (max-width: 768px) {
  .servizos {
    padding: 1rem 0.8rem;
    font-size: 0.95rem;
  }

  .tarxeta {
    flex: 1 1 100%;
    max-width: 100%;
  }
}
</style>

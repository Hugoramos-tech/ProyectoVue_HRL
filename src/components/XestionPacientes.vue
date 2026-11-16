<template>
  <div class="xestion-paciente">
    <h4>👥 Xestión de pacientes</h4>

    <!--
      FORMULARIO
      @submit.prevent -> escucha el evento "submit" del formulario y el modificador
      ".prevent" ejecuta event.preventDefault(), es decir, evita que el navegador
      recargue la página. Así podemos guardar con JavaScript (axios) sin perder los datos.
    -->
    <form @submit.prevent="guardarPaciente">
      <div class="fila">
        <div class="campo campo-dni">
          <label>DNI/CIF:</label>
          <!--
            v-model -> enlace bidireccional (two-way binding) entre el input y
            novoPaciente.dnipac: si el usuario escribe, cambia la variable; si cambia
            la variable (por ejemplo al editar), cambia el input.
            @input -> cada vez que se teclea pasamos el texto a MAYÚSCULAS,
            porque la letra del DNI se valida en mayúscula.
            :readonly -> atributo dinámico. Cuando editando es true el DNI NO se puede
            cambiar, porque el DNI es la clave con la que el backend localiza al paciente.
          -->
          <input v-model="novoPaciente.dnipac" @input="novoPaciente.dnipac = novoPaciente.dnipac.toUpperCase()"
            :readonly="editando" type="text" required style="text-align: center;" />
        </div>

        <!--
          v-if -> renderiza (crea) el bloque SOLO si la condición es verdadera.
          Aquí mostramos el error únicamente si el usuario ya escribió algo
          y el DNI no pasa el formato (validarDni) o la letra de control (validarDni2).
        -->
        <div v-if="novoPaciente.dnipac !== '' && (!validarDni() || !validarDni2())" class="error-message">
          <p class="error">O DNI/CIF non é válido</p>
        </div>

        <!--
          @click -> atajo de v-on:click. type="button" es importante: si no lo
          ponemos, el botón dentro de un <form> haría submit.
        -->
        <button type="button" @click="limpiaFormpac">Limpar</button>
        <button type="button" @click="buscarPaciente">Buscar</button>

        <div class="campo campo-nome">
          <label>Nome:</label>
          <!--
            @blur -> se dispara cuando el input pierde el foco.
            @keyup.enter -> se dispara al soltar la tecla Enter.
            En los dos casos llamamos a corrixirNome() para dejar el nombre
            con la primera letra de cada palabra en mayúscula.
          -->
          <input v-model="novoPaciente.nomepac" type="text" @keyup.enter="corrixirNome()" @blur="corrixirNome()"
            required />
        </div>

        <div class="campo campo-apelido">
          <label>Apelido:</label>
          <input v-model="novoPaciente.apelpac" type="text" @keyup.enter="corrixirApelido()" @blur="corrixirApelido()"
            required />
        </div>
      </div>

      <div class="fila">
        <div class="campo campo-data-nacemento">
          <label>Data de nacemento:</label>
          <input v-model="novoPaciente.nacipac" type="date" required />
        </div>

        <div class="campo campo-correo">
          <label>Correo:</label>
          <!-- type="email" deja que el propio navegador valide el formato del correo -->
          <input v-model="novoPaciente.mailpac" type="email" required />
        </div>

        <div class="campo campo-dirección">
          <label>Dirección:</label>
          <input v-model="novoPaciente.dirpac" type="text" required />
        </div>
      </div>

      <div class="fila">
        <div class="campo campo-telefono">
          <label>Telefono:</label>
          <input v-model="novoPaciente.movilpac" type="text" @blur="validarTelf()" required />
        </div>

        <!-- Mismo patrón que en el DNI: v-if para mostrar el aviso solo si procede -->
        <div v-if="novoPaciente.movilpac !== '' && !validarTelf()" class="error-message">
          <p class="error">O teléfono non é válido</p>
        </div>

        <div class="campo campo-provincia">
          <label>Provincia:</label>
          <!--
            @change -> al elegir una provincia recargamos sus municipios.
            v-for -> repite la etiqueta <option> por cada provincia del array.
            :key -> clave única de cada elemento de la lista; Vue la usa para
            reutilizar/reordenar los nodos del DOM de forma eficiente.
            :value -> valor que se guardará en novoPaciente.propac al seleccionar.
          -->
          <select id="provincia" v-model="novoPaciente.propac" @change="cargarMunicipios()" required>
            <option value="">Selecciona unha provincia</option>
            <option v-for="provincia in provincias" :key="provincia.id" :value="provincia.nm">
              {{ provincia.nm }}
            </option>
          </select>
        </div>

        <div class="campo campo-municipio">
          <label>Municipio:</label>
          <select id="municipio" v-model="novoPaciente.munipac" required>
            <option value="">Selecciona un municipio</option>
            <option v-for="municipio in municipios" :key="municipio.id" :value="municipio.nm">
              {{ municipio.nm }}
            </option>
          </select>
        </div>
      </div>

      <div class="campo-condicions">
        <label>
          <!-- Con un checkbox, v-model guarda true/false en novoPaciente.lodpac -->
          <input v-model="novoPaciente.lodpac" type="checkbox" /> Aceptar a
          <a :href="$router.resolve({ name: 'PoliticaPrivacidad' }).href" target="_blank" rel="noopener noreferrer">
            Política de privacidade e confidencialidade
          </a>
        </label>
      </div>

      <!--
        :disabled -> atributo dinámico: el botón se bloquea mientras falten
        datos obligatorios o no se acepte la política de privacidad (lodpac).
        El texto cambia según "editando": "Actualizar" si estamos modificando
        un paciente ya existente y "Gardar" si es uno nuevo.
      -->
      <button type="submit" class="btn-guardar" :disabled="
        novoPaciente.dnipac === '' ||
        novoPaciente.nomepac === '' ||
        novoPaciente.apelpac === '' ||
        novoPaciente.movilpac === '' ||
        !novoPaciente.lodpac
        ">
        {{ editando ? 'Actualizar' : 'Gardar' }}
      </button>
    </form>

    <!--
      CABECERA DE LA LISTA: título + botón de informe PDF + buscador.
      El buscador usa v-model sobre "busca" y la tabla se dibuja con el
      computed "pacientesFiltrados", así que el filtrado es reactivo:
      al teclear, la tabla se actualiza sola.
    -->
    <div class="cabeceira-listaxe">
      <h4>📋 Listaxe de pacientes</h4>
      <div class="ferramentas-listaxe">
        <button type="button" class="btn-pdf" @click="xerarInformePDF">📄 PDF</button>
        <input v-model="busca" type="search" class="campo-busca" placeholder="Buscar por DNI, nome ou apelidos..." />
      </div>
    </div>

    <!-- v-if: solo pintamos la tabla si hay filas que mostrar tras el filtro -->
    <table v-if="pacientesFiltrados.length > 0">
      <thead>
        <tr>
          <th>#</th>
          <th>DNI/CIF</th>
          <th>Apelidos</th>
          <th>Nome</th>
          <th>Correo</th>
          <th>Provincia</th>
          <th>Accións</th>
        </tr>
      </thead>
      <tbody>
        <!--
          v-for sobre el COMPUTED (lista ya filtrada), no sobre el array original.
          (u, index) -> u es el paciente y index su posición dentro de la lista filtrada
          (solo lo usamos para numerar las filas).
          :key="u.dnipac" -> usamos el DNI como clave porque es único e identifica
          al paciente aunque cambie de posición al filtrar u ordenar.
          Importante: a editarUsuario/eliminarPaciente les pasamos el OBJETO u y no
          el index, porque el índice de la lista filtrada no coincide con el de
          la lista completa "pacientes".
        -->
        <tr v-for="(u, index) in pacientesFiltrados" :key="u.dnipac">
          <td style="text-align: center;">{{ index + 1 }}</td>
          <td style="text-align: center;">{{ u.dnipac }}</td>
          <td>{{ u.apelpac }}</td>
          <td>{{ u.nomepac }}</td>
          <td>{{ u.mailpac }}</td>
          <td>{{ u.propac }}</td>
          <td style="text-align: center;">
            <button @click="editarUsuario(u)" title="Editar">✏️</button>
            <button @click="eliminarPaciente(u)" title="Eliminar">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- v-else: se muestra cuando el v-if de la tabla es falso -->
    <p v-else>
      {{ pacientes.length === 0 ? 'Non hai pacientes cargados.' : 'Non hai pacientes que coincidan coa busca.' }}
    </p>
  </div>
</template>

<script setup>
/// Zona de declaracións

// ref -> crea una variable reactiva para valores simples o arrays (se accede con .value en el script).
// reactive -> crea un OBJETO reactivo (se accede directamente, sin .value).
// computed -> valor calculado que se recalcula solo cuando cambian sus dependencias.
// onMounted -> hook del ciclo de vida: se ejecuta cuando el componente ya está en pantalla.
import { ref, reactive, computed, onMounted } from 'vue'

import { obtenerMunicipios, obtenerProvincias } from "../api/municipios.js"
import { usepacienteStore } from "../store/pacienteStore.js";
import {
  savePaciente,
  getPacientes,
  deletePaciente,
  modifyPaciente,
  getPacienteByDni
} from "../api/pacientes.js"

// UD6: SweetAlert2 encapsulado en nuestro módulo de utilidades.
// Sustituye a los console.log para avisar al usuario con ventanas bonitas.
import { alertaExito, alertaError, alertaInfo, alertaConfirmacion } from "../utils/alertas.js"

// UD7: generación de informes PDF (jsPDF + autoTable) también encapsulada.
import { exportarTablaPDF } from "../utils/informes.js"

// Instancia del store de Pinia. OJO: usepacienteStore es la FUNCIÓN que crea el store,
// hay que ejecutarla UNA sola vez aquí para obtener la instancia y luego usar
// pacienteStore.seleccionarPaciente(...). Llamar a usepacienteStore.seleccionarPaciente()
// sobre la función importada daba error en tiempo de ejecución.
const pacienteStore = usepacienteStore()

const provincias = ref([])   // lista de provincias para el <select>
const municipios = ref([])   // municipios de la provincia elegida

const pacientes = ref([])    // almacena la lista de pacientes e os seus cambios
const editando = ref(false)  // false -> estamos creando; true -> estamos modificando

// Texto que escribe el usuario en el buscador de la tabla.
const busca = ref("")

// Objeto reactivo enlazado al formulario con v-model.
// Los nombres de los campos son los del modelo Paciente de MongoDB.
const novoPaciente = reactive({
  dnipac: "",
  nomepac: "",
  apelpac: "",
  nacipac: "",
  mailpac: "",
  movilpac: "",
  dirpac: "",
  propac: "",
  munipac: "",
  lodpac: false //campo para acaptacion de lod
});

// COMPUTED: lista de pacientes filtrada por DNI, nombre o apellidos.
// Es un "valor calculado": Vue lo recalcula automáticamente cuando cambia
// "busca" o "pacientes", y guarda el resultado en caché mientras no cambien.
// Lo usamos en el v-for de la tabla en lugar del array original.
const pacientesFiltrados = computed(() => {
  const texto = busca.value.trim().toLowerCase();

  // Si el buscador está vacío devolvemos la lista completa.
  if (texto === "") {
    return pacientes.value;
  }

  // filter() devuelve un array nuevo con los que cumplen la condición.
  // Usamos (campo || "") para no romper si algún campo viniese vacío o null.
  return pacientes.value.filter(p =>
    (p.dnipac || "").toLowerCase().includes(texto) ||
    (p.nomepac || "").toLowerCase().includes(texto) ||
    (p.apelpac || "").toLowerCase().includes(texto)
  );
});


/// Zona de ciclo de vida

// onMounted se ejecuta una vez, al montarse el componente:
// es el sitio correcto para pedir los datos iniciales al backend.
onMounted(async () => {
  try {
    provincias.value = await obtenerProvincias();
    pacientes.value = await getPacientes(); //carga os pacientes desde o backend
  } catch (error) {
    console.error("Erro ao cargar os datos iniciais:", error);
    alertaError("Non foi posible cargar os datos iniciais");
  }
})


/// Zona de métodos ou funcións

// Carga los municipios de la provincia seleccionada.
// Se llama desde @change del <select> de provincias y al editar/buscar un paciente.
async function cargarMunicipios() {
  // Si no hay provincia elegida, vaciamos la lista de municipios y salimos.
  if (novoPaciente.propac === "") {
    municipios.value = [];
    return;
  }

  // Buscamos el objeto provincia para obtener su id (la API filtra por id).
  const provincia = provincias.value.find(
    p => p.nm === novoPaciente.propac
  );

  // Si no se encuentra la provincia evitamos el error de leer .id de undefined.
  if (!provincia) {
    municipios.value = [];
    return;
  }

  municipios.value = await obtenerMunicipios(provincia.id)
}

// Vacía el formulario (y la lista de municipios) después de guardar o modificar.
async function clear() {
  Object.assign(novoPaciente, {
    dnipac: "",
    nomepac: "",
    apelpac: "",
    mailpac: "",
    propac: "",
    munipac: "",
    movilpac: "",
    dirpac: "",
    nacipac: "",
    lodpac: false
  });
  municipios.value = [];
}

// Guarda un paciente nuevo (POST) o actualiza uno existente (PUT),
// según el valor de "editando".
async function guardarPaciente() {
  // 1) Validaciones antes de llamar al backend. Si algo falla, avisamos y salimos.
  if (!validarDni() || !validarDni2()) {
    alertaError("O DNI/CIF non é válido");
    return;
  } else if (!validarTelf()) {
    alertaError("O teléfono non é válido");
    return;
  }

  try {
    if (editando.value) {
      // 2a) MODIFICAR: el DNI viaja en la URL porque es la clave del paciente.
      await modifyPaciente(novoPaciente.dnipac, novoPaciente);

      // Guardamos en el store de Pinia el paciente sobre el que acabamos de trabajar.
      pacienteStore.seleccionarPaciente(novoPaciente);

      // Recargamos la lista desde el backend para que la tabla quede igual que la BD.
      pacientes.value = await getPacientes();

      await alertaExito("Paciente actualizado correctamente");
    } else {
      // 2b) GARDAR: creamos el paciente nuevo.
      const pacienteGuardado = await savePaciente(novoPaciente);

      pacienteStore.seleccionarPaciente(pacienteGuardado);

      // Recargamos la lista (así también recibimos el _id que genera MongoDB).
      pacientes.value = await getPacientes();

      await alertaExito("Paciente gardado con éxito");
    }

    // 3) Salimos del modo edición y dejamos el formulario limpio para el siguiente.
    editando.value = false;
    await clear();
  } catch (error) {
    console.error("Erro ao gardar o paciente:", error);
    alertaError("Non foi posible gardar o paciente");
  }
}

// Borra un paciente. Recibe el OBJETO paciente (no el índice) porque la tabla
// muestra la lista filtrada y sus índices no coinciden con los de "pacientes".
async function eliminarPaciente(paciente) {
  // Pedimos confirmación con SweetAlert2: alertaConfirmacion devuelve una promesa.
  // Si el usuario pulsa "Cancelar", isConfirmed es false y no borramos nada.
  const r = await alertaConfirmacion("Seguro que queres eliminar a " + paciente.nomepac + " " + paciente.apelpac + "?");
  if (!r.isConfirmed) return;

  try {
    // 1) Borramos en el backend.
    await deletePaciente(paciente.dnipac);

    // 2) Buscamos su posición REAL en la lista completa y lo quitamos UNA sola vez
    //    (antes se hacía splice dos veces y desaparecían dos filas).
    const index = pacientes.value.findIndex(p => p.dnipac === paciente.dnipac);
    if (index !== -1) {
      pacientes.value.splice(index, 1);   //elimina o paciente da lista
    }

    // 3) Si estábamos editando justo a ese paciente, limpiamos el formulario.
    if (editando.value && novoPaciente.dnipac === paciente.dnipac) {
      limpiaFormpac();
    }

    alertaExito("Paciente eliminado correctamente");
  } catch (error) {
    console.error("Erro ao eliminar o paciente:", error);
    alertaError("Non foi posible eliminar o paciente");
  }
}

// Carga los datos de un paciente de la tabla en el formulario para modificarlo.
async function editarUsuario(paciente) {
  // Object.assign copia las propiedades del paciente dentro de novoPaciente,
  // que es el objeto enlazado al formulario con v-model.
  Object.assign(novoPaciente, paciente);  // carga os datos do paciente no formulario recorda v-model do formulario é novoPaciente

  //evitar que se cargue el _id de mongoDB en el formulario
  delete novoPaciente._id;

  // Activamos el modo edición: el DNI pasa a ser readonly y el botón dice "Actualizar".
  editando.value = true;

  // Guardamos el paciente seleccionado en el store (instancia, no la función).
  pacienteStore.seleccionarPaciente(novoPaciente);

  //cargar los municipios de la provincia del paciente
  await cargarMunicipios();
}

// Busca un paciente por el DNI escrito en el formulario (botón "Buscar").
async function buscarPaciente() {
  try {
    const dni = novoPaciente.dnipac.trim();

    if (!dni) {
      alertaInfo("Introduce un DNI para buscar");
      return;
    }

    const paciente = await getPacienteByDni(dni);

    // Si lo encuentra, volcamos sus datos en el formulario...
    Object.assign(novoPaciente, paciente);
    delete novoPaciente._id;

    // ...lo dejamos en modo edición (el DNI ya existe, no se puede cambiar)...
    editando.value = true;
    pacienteStore.seleccionarPaciente(paciente);

    // ...y cargamos los municipios de su provincia.
    await cargarMunicipios();

    alertaInfo("Paciente encontrado: " + paciente.nomepac + " " + paciente.apelpac);
  } catch (error) {
    // El backend responde 404 cuando no existe ese DNI.
    if (error.response?.status === 404) {
      alertaInfo("Paciente non encontrado");
    } else {
      console.error("Error al buscar paciente: ", error)
      alertaError("Produciuse un erro ao buscar o paciente");
    }
  }
}

// Genera un informe PDF con los pacientes que se están viendo en la tabla.
// exportarTablaPDF({ titulo, columnas, filas, nombreFichero }):
//   columnas -> array de textos (la cabecera de la tabla del PDF)
//   filas    -> array de arrays de textos (una fila por paciente)
function xerarInformePDF() {
  // Si no hay nada que listar, avisamos y no generamos el fichero.
  if (pacientesFiltrados.value.length === 0) {
    alertaInfo("Non hai pacientes para exportar");
    return;
  }

  const columnas = ["#", "DNI/CIF", "Apelidos", "Nome", "Correo", "Teléfono", "Provincia", "Municipio"];

  // map() transforma cada paciente en un array de textos (una fila del PDF).
  const filas = pacientesFiltrados.value.map((p, i) => [
    String(i + 1),
    p.dnipac || "",
    p.apelpac || "",
    p.nomepac || "",
    p.mailpac || "",
    p.movilpac || "",
    p.propac || "",
    p.munipac || ""
  ]);

  exportarTablaPDF({
    titulo: "Listaxe de pacientes",
    columnas: columnas,
    filas: filas,
    nombreFichero: "pacientes.pdf"
  });

  alertaExito("Informe PDF xerado correctamente");
}

//===================================================================================
// Funcións auxiliares

// Comprueba el FORMATO del DNI: 8 números y una letra.
function validarDni() {
  const dniregex = /^[0-9]{8}[A-Z]$/; // Expresión regular para validar el formato del DNI
  return dniregex.test(novoPaciente.dnipac.toUpperCase());
}

// Comprueba la LETRA de control: el resto de dividir el número entre 23
// nos da la posición de la letra correcta dentro del array.
function validarDni2() {
  const dniarray = ['T', 'R', 'W', 'A', 'G', 'M', 'Y', 'F', 'P', 'D', 'X', 'B', 'N', 'J', 'Z', 'S', 'Q', 'V', 'H', 'L', 'C', 'K', 'E'];
  const numerosDni = novoPaciente.dnipac.slice(0, 8);
  const letraDni = novoPaciente.dnipac.slice(8, 9);
  return dniarray[numerosDni % 23] === letraDni.toUpperCase();
}

// Pone la primera letra de cada palabra del nombre en mayúscula ("ana maria" -> "Ana Maria").
function corrixirNome() {
  if (novoPaciente.nomepac.length > 0) {
    novoPaciente.nomepac = novoPaciente.nomepac
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

// Lo mismo que corrixirNome pero para los apellidos.
function corrixirApelido() {
  if (novoPaciente.apelpac.length > 0) {
    novoPaciente.apelpac = novoPaciente.apelpac
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

// Valida el móvil: empieza por 6 o 7 y tiene 9 dígitos en total.
// IMPORTANTE: devuelve SIEMPRE un booleano (antes devolvía undefined si estaba vacío,
// y ese undefined hacía que las comprobaciones con v-if fallasen).
function validarTelf() {
  const telfRegex = /^[67]\d{8}$/;
  const movil = (novoPaciente.movilpac || "").trim();

  if (movil === "") {
    return false;   // un móvil vacío no es válido
  }

  return telfRegex.test(movil);
}

// Botón "Limpar": vacía el formulario y sale del modo edición.
// Está escrita como función flecha guardada en una constante (otra forma válida
// de declarar funciones en <script setup>).
const limpiaFormpac = () => {
  Object.assign(novoPaciente, {
    dnipac: "",
    nomepac: "",
    apelpac: "",
    nacipac: "",
    mailpac: "",
    movilpac: "",
    dirpac: "",
    propac: "",
    munipac: "",
    lodpac: false
  });
  municipios.value = [];
  editando.value = false;

  // Limpiamos también el paciente seleccionado en el store de Pinia.
  pacienteStore.limpiarPaciente();
}
</script>

<style scoped>
.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.2rem;
}

.xestion-paciente {
  width: 100%;
  /* opcional para que no crezca demasiado en pantallas muy grandes */
  background: white;
  padding: 2rem;
  overflow: visible;
  border-radius: 2px;
  flex-wrap: wrap;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

form {
  display: flex;
  padding: 2rem;
  align-self: center;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.fila {
  flex-wrap: wrap;
  display: flex;
  gap: 1rem;
  width: 100%;
}

.fila-centrada {
  justify-content: center;
}

.campo {
  flex-wrap: wrap;
  display: flex;
  align-items: center;
  /* label e input en la misma línea */
  gap: 0.5rem;
  border-radius: 0px;
}

.campo-dni {
  flex: 3;
  /* ocupa menos espacio */
  border-radius: 0px;
}

.campo-nome {
  flex: 3;
  /* ocupa más espacio */
  border-radius: 0px;
}

.campo-data-nacemento {
  flex: 0.5;
  /* ocupa menos espacio */
}

.campo-correo {
  flex: 2;
  /* ocupa más espacio */
  border-radius: 0px;
}

.campo select {
  flex: 1;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 0px;
  width: 100%;
}

.campo-provincia {
  flex: 1;
  /* ocupa menos espacio */
  border-radius: 0px;
}

.campo label {
  max-width: 100px;
  /* ancho fijo para alinear */
  font-weight: 500;
  font: bold
}

.campo input {
  flex: 1;
  /* ocupa todo el espacio restante */
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0px;
  box-sizing: border-box;
}

/* Cuando editamos, el DNI es readonly: lo mostramos en gris para que se vea
   que no se puede cambiar */
.campo input[readonly] {
  background-color: #f1f1f1;
  color: #555;
  cursor: not-allowed;
}

.btn-guardar {
  background-color: #057559;
  color: white;
  border: 3px solid #00aa1c;
  border-image: linear-gradient(45deg, #00aa1c, #0000ff) 1;
  /* Define los dos colores y el ángulo */
  padding: 20px;
  padding: 0.4rem 1.5rem;
  border-radius: 0px;
  cursor: pointer;
  margin: 0 auto;
  display: block;
}

.btn-guardar:hover {
  background-color: #637a76;
  border-radius: 0px;
}

.btn-guardar:disabled {
  background-color: #e0e0e0;
  color: #999;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7
}

.btn-guardar:disabled:hover {
  background-color: #e0e0e0;
}

.button {
  background: none;
  border: 2px solid #ddd;
  cursor: pointer;
  font-size: 1rem;
}

.inline-control {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding-right: 5rem;
}

/* Cabecera de la listaxe: título a la izquierda, PDF y buscador a la derecha */
.cabeceira-listaxe {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}

.cabeceira-listaxe h4 {
  flex: 1;
  margin-bottom: 0;
}

.ferramentas-listaxe {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-pdf {
  background-color: #b3261e;
  color: white;
  border: none;
  padding: 0.45rem 1rem;
  cursor: pointer;
  white-space: nowrap;
}

.btn-pdf:hover {
  background-color: #7f1b15;
}

.campo-busca {
  padding: 0.45rem;
  border: 1px solid #ddd;
  min-width: 240px;
  box-sizing: border-box;
}

table {
  width: 100%;
  border-collapse: separate;
  align-self: center;
  margin-top: 1rem;
  font-size: 0.8rem;
  border: 1px solid #ddd;
}

th,
td {
  border: 1px solid #ddd;
  padding: 0.7rem;
  text-align: left;
}

th {
  text-align: center;
  background-color: #f8f9fa;
}

h4 {
  width: 100%;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
  background-color: #07c751;
  color: white;
}

@media (max-width: 768px) {
  .xestion-paciente {
    padding: 1rem;
    /* reducir el padding en pantallas pequeñas */
  }

  .fila {
    flex-direction: column;
    /* apila los campos verticalmente en móviles */
    gap: 0.5rem;
    /* opcional: un pequeño espacio entre ellos */
  }

  /* En móvil el campo del DNI ocupa todo el ancho
     (antes había un "background-color: red" que era claramente una prueba) */
  .campo-dni {
    flex: 1 1 100%;
  }

  /* El buscador y el botón de PDF también a todo el ancho */
  .ferramentas-listaxe {
    width: 100%;
    flex-wrap: wrap;
  }

  .campo-busca {
    width: 100%;
    min-width: 0;
  }
}
</style>

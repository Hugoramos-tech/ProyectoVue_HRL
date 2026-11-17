<template>
  <div class="xestion-cita">
    <!-- Cabecera del formulario -->
    <h4>📅 Xestión de Citas 🩺</h4>

    <!-- @submit.prevent evita que el navegador recargue la página al enviar el formulario,
         así se llama a nuestra función guardarCita() -->
    <form @submit.prevent="guardarCita">

      <div class="fila">
        <div class="campo campo-paciente">
          <label>Paciente:</label>
          <!-- v-model guarda en el formulario SOLO el _id del paciente elegido -->
          <select v-model="novaCita.pacienteId" required>
            <option value="">Selecciona un paciente</option>
            <!-- v-for recorre la lista de pacientes; :key ayuda a Vue a identificar cada opción -->
            <option v-for="p in pacientes" :key="p._id" :value="p._id">
              {{ p.apelpac }}, {{ p.nomepac }} ({{ p.dnipac }})
            </option>
          </select>
        </div>

        <div class="campo campo-doctor">
          <label>Doctor:</label>
          <!-- Lo mismo que arriba pero con los doctores: mostramos apellidos, nombre y especialidad -->
          <select v-model="novaCita.doctorId" required>
            <option value="">Selecciona un doctor</option>
            <option v-for="d in doctores" :key="d._id" :value="d._id">
              {{ d.apeldoc }}, {{ d.nomedoc }} ({{ d.espedoc }})
            </option>
          </select>
        </div>
      </div>

      <div class="fila">
        <div class="campo campo-data">
          <label>Data:</label>
          <!-- input type="date" devuelve la fecha en formato AAAA-MM-DD -->
          <input v-model="novaCita.fecha" type="date" required />
        </div>

        <div class="campo campo-hora">
          <label>Hora:</label>
          <!-- input type="time" devuelve la hora en formato HH:MM -->
          <input v-model="novaCita.hora" type="time" required />
        </div>

        <div class="campo campo-estado">
          <label>Estado:</label>
          <!-- Select con los cuatro estados posibles de la cita; por defecto viene "pendente" -->
          <select v-model="novaCita.estado" required>
            <option value="pendente">pendente</option>
            <option value="confirmada">confirmada</option>
            <option value="cancelada">cancelada</option>
            <option value="realizada">realizada</option>
          </select>
        </div>
      </div>

      <div class="fila">
        <div class="campo campo-motivo">
          <label>Motivo da cita:</label>
          <input v-model="novaCita.motivo" type="text" required />
        </div>
      </div>

      <div class="fila">
        <div class="campo campo-observacions">
          <label>Observacións adicionais:</label>
          <!-- El textarea también funciona con v-model, igual que un input -->
          <textarea v-model="novaCita.observacions" rows="3"></textarea>
        </div>
      </div>

      <div class="fila fila-centrada">
        <!-- type="button" para que este botón NO envíe el formulario, solo limpia los campos -->
        <button type="button" @click="limpiaFormcita">Limpar</button>

        <!-- :disabled desactiva el botón mientras falte algún dato obligatorio.
             El texto cambia a "Actualizar" cuando estamos editando una cita existente -->
        <button type="submit" class="btn-guardar" :disabled="
          novaCita.pacienteId === '' ||
          novaCita.doctorId === '' ||
          novaCita.fecha === '' ||
          novaCita.hora === '' ||
          novaCita.motivo === ''
          ">
          {{ editando ? 'Actualizar' : 'Gardar' }}
        </button>
      </div>
    </form>

    <!--
      Ficha do paciente seleccionado. Só aparece se hai un paciente gardado no
      store de Pinia, que é o que se garda ao darlle a ✏️ Editar en "Pacientes".
    -->
    <div v-if="pacienteStore.dnipac" class="ficha-paciente">
      <p class="titulo-ficha">Paciente seleccionado</p>
      <p><strong>DNI:</strong> {{ pacienteStore.dnipac }}</p>
      <p><strong>Nome:</strong> {{ pacienteStore.nomepac }} {{ pacienteStore.apelpac }}</p>
    </div>

    <!-- Cabecera de la listaxe: leva o nome do paciente a continuación -->
    <h4>📋 Listaxe de Citas<span v-if="pacienteStore.dnipac"> de {{ pacienteStore.nomepac }} {{ pacienteStore.apelpac }}</span></h4>

    <!-- Filtro reactivo: lo que escribamos aquí se filtra al instante gracias al computed -->
    <div class="fila fila-filtro">
      <div class="campo campo-filtro-estado">
        <label>Filtrar por estado:</label>
        <select v-model="filtroEstado">
          <option value="">Todos</option>
          <option value="pendente">pendente</option>
          <option value="confirmada">confirmada</option>
          <option value="cancelada">cancelada</option>
          <option value="realizada">realizada</option>
        </select>
      </div>

      <div class="campo campo-filtro-texto">
        <label>Buscar:</label>
        <input v-model="filtroTexto" type="text" placeholder="Paciente, doctor ou motivo" />
      </div>

      <!-- @click llama a la función que genera el informe en PDF de la listaxe -->
      <button type="button" @click="exportarPDF">📄 PDF</button>
    </div>

    <!-- v-if: la tabla solo se muestra si hay un paciente seleccionado y tiene citas -->
    <table v-if="pacienteStore.dnipac && citasFiltradas.length > 0">
      <thead>
        <tr>
          <th>#</th>
          <th>Data</th>
          <th>Hora</th>
          <th>Paciente</th>
          <th>Doctor</th>
          <th>Motivo</th>
          <th>Estado</th>
          <th>Accións</th>
        </tr>
      </thead>
      <tbody>
        <!-- v-for recorre las citas YA FILTRADAS (computed citasFiltradas).
             :key="c._id" identifica cada fila con el _id de MongoDB -->
        <tr v-for="(c, index) in citasFiltradas" :key="c._id">
          <td style="text-align: center;">{{ index + 1 }}</td>
          <td style="text-align: center;">{{ formatearData(c.fecha) }}</td>
          <td style="text-align: center;">{{ c.hora }}</td>
          <td>{{ nomePaciente(c) }}</td>
          <td>{{ nomeDoctor(c) }}</td>
          <td>{{ c.motivo }}</td>
          <td style="text-align: center;">{{ c.estado }}</td>
          <td style="text-align: center;">
            <!-- @click="editarCita(c)" pasa la cita entera para cargarla en el formulario -->
            <button @click="editarCita(c)" title="Editar">✏️</button>
            <button @click="eliminarCita(c)" title="Eliminar">🗑️</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- v-else-if: mientras no se seleccione un paciente la listaxe sale vacía -->
    <p v-else-if="!pacienteStore.dnipac">
      Selecciona un paciente en "Pacientes" e dálle a ✏️ Editar para ver aquí as súas citas.
    </p>

    <!-- v-else: hay paciente seleccionado, pero no tiene ninguna cita -->
    <p v-else>Este paciente non ten citas rexistradas.</p>
  </div>
</template>

<script setup>
/// Zona de declaracións

// Importamos las funciones de Vue que necesitamos
import { ref, reactive, computed, onMounted } from 'vue'

// Importamos las funciones de la API de las citas (ya hechas, no se tocan)
import {
  saveCita,
  getCitas,
  getCitaById,
  modifyCita,
  deleteCita
} from "../api/citas.js"

// Necesitamos los pacientes y los doctores para rellenar los dos <select>
import { getPacientes } from "../api/pacientes.js"
import { getDoctores } from "../api/doctores.js"

// Alertas bonitas (SweetAlert2) e informe en PDF
import { alertaExito, alertaError, alertaInfo, alertaConfirmacion } from "../utils/alertas.js"
import { exportarTablaPDF } from "../utils/informes.js"

// Store de Pinia de pacientes (UD8). Aquí queda guardado el paciente que
// seleccionamos en "Pacientes" al darle a ✏️ Editar, y así podemos leerlo
// desde esta pestaña aunque sea otro componente distinto.
import { usepacienteStore } from "../store/pacienteStore.js"

// Creamos la INSTANCIA del store UNA SOLA VEZ, aquí en la zona de declaraciones.
const pacienteStore = usepacienteStore()

// Listas que se muestran en la pantalla
const citas = ref([])       // almacena el listado de citas y sus cambios
const pacientes = ref([])   // para el select de pacientes
const doctores = ref([])    // para el select de doctores

// Variables de control de la edición
const editando = ref(false)   // true cuando estamos modificando una cita existente
const idCitaEditando = ref(null)  // guarda el _id de la cita que estamos editando

// Variables del filtro (son ref porque cambian y la pantalla tiene que reaccionar)
const filtroEstado = ref("")
const filtroTexto = ref("")

// Objeto reactivo ligado al formulario con el v-model.
// OJO: en pacienteId y doctorId guardamos SOLO el _id, que es lo que espera el backend.
const novaCita = reactive({
  pacienteId: "",
  doctorId: "",
  fecha: "",
  hora: "",
  motivo: "",
  observacions: "",
  estado: "pendente"   // valor por defecto
})

// Computed: devuelve las citas DEL PACIENTE SELECCIONADO que además cumplen
// el filtro de estado Y el filtro de texto.
// Al ser computed, se recalcula automáticamente cuando cambia filtroEstado,
// filtroTexto o el paciente guardado en el store.
const citasFiltradas = computed(() => {
  // Mientras no haya un paciente seleccionado, la listaxe sale VACÍA.
  if (!pacienteStore.dnipac) return []

  const texto = filtroTexto.value.trim().toLowerCase()

  return citas.value.filter((c) => {
    // Solo las citas de ese paciente. El backend devuelve pacienteId ya
    // "poblado" con los datos del paciente, así que comparamos por el DNI.
    const ehDoPaciente = c.pacienteId && c.pacienteId.dnipac === pacienteStore.dnipac
    if (!ehDoPaciente) return false

    // Si el select del estado está vacío ("Todos") pasan todas las citas
    const coincideEstado = filtroEstado.value === "" || c.estado === filtroEstado.value

    // Si la caja de busqueda está vacía pasan todas; si no, buscamos en el paciente, doctor o motivo
    const coincideTexto =
      texto === "" ||
      nomePaciente(c).toLowerCase().includes(texto) ||
      nomeDoctor(c).toLowerCase().includes(texto) ||
      (c.motivo || "").toLowerCase().includes(texto)

    return coincideEstado && coincideTexto
  })
})

/// Zona de ciclo de vida

// onMounted se ejecuta una sola vez, cuando el componente aparece en la pantalla
onMounted(async () => {
  await cargarDatos()
})

/// Zona de métodos ou funcións

// Carga en paralelo (Promise.all) pacientes, doctores y citas.
// Se llama al principio y también después de cada operación del CRUD.
async function cargarDatos() {
  try {
    const [listaPacientes, listaDoctores, listaCitas] = await Promise.all([
      getPacientes(),
      getDoctores(),
      getCitas()
    ])

    pacientes.value = listaPacientes
    doctores.value = listaDoctores
    citas.value = listaCitas
  } catch (error) {
    // Si el backend está apagado no rompemos la página: dejamos las listas vacías
    console.error("Erro ao cargar os datos:", error)
    citas.value = []
    pacientes.value = []
    doctores.value = []
    alertaError("Non se puideron cargar os datos. Comproba a conexión coa BBDD.")
  }
}

// Vacía el formulario y sale del modo edición
async function clear() {
  Object.assign(novaCita, {
    pacienteId: "",
    doctorId: "",
    fecha: "",
    hora: "",
    motivo: "",
    observacions: "",
    estado: "pendente"
  })
  editando.value = false
  idCitaEditando.value = null
}

//CRUD

//Create
// Esta función hace dos cosas: si editando es true ACTUALIZA, si no CREA una cita nueva.
// NOTA: el backend rechaza la petición con un error 400 si ese doctor ya tiene
// otra cita en la misma fecha y hora (cita duplicada). Ese caso no lanza nada raro:
// cae directamente en el catch de abajo, y por eso el mensaje de error lo menciona.
async function guardarCita() {
  try {
    // Montamos el objeto que se manda al backend: solo los identificadores, no los objetos
    const datosCita = {
      pacienteId: novaCita.pacienteId,
      doctorId: novaCita.doctorId,
      fecha: novaCita.fecha,
      hora: novaCita.hora,
      motivo: novaCita.motivo,
      observacions: novaCita.observacions,
      estado: novaCita.estado
    }

    if (editando.value) {
      //Update: mandamos el _id de la cita que estábamos editando
      await modifyCita(idCitaEditando.value, datosCita)
      alertaExito("Cita actualizada correctamente")
    } else {
      await saveCita(datosCita)
      alertaExito("Cita gardada con éxito")
    }

    await clear()        // vaciamos el formulario
    await cargarDatos()  // recargamos el listado para ver los cambios
  } catch (error) {
    // Aquí entra también el error 400 del doctor con cita duplicada a esa hora
    console.error("Erro ao gardar a cita:", error)
    alertaError("Non se puido gardar a cita. Revisa os datos: pode que o doctor xa teña outra cita nesa data e hora.")
  }
}

//Read
// Busca una cita por su _id (por ejemplo para ver sus datos actualizados).
// De momento no se usa en el template: está preparada para llamarla cuando se quiera,
// por ejemplo desde un botón de "buscar por ID" en el formulario.
async function buscarCita(id) {
  try {
    const cita = await getCitaById(id)

    if (!cita) {
      alertaInfo("Non se atopou a cita")
      return null
    }

    return cita
  } catch (error) {
    console.error("Erro ao buscar a cita:", error)
    alertaError("Non se puido buscar a cita")
    return null
  }
}

//Update
// Carga los datos de la cita elegida en el formulario y activa el modo edición
async function editarCita(cita) {
  // OJO: la cita viene con pacienteId y doctorId POBLADOS (son objetos),
  // así que para los <select> hay que coger su _id.
  Object.assign(novaCita, {
    pacienteId: cita.pacienteId?._id || "",
    doctorId: cita.doctorId?._id || "",
    fecha: formatearDataInput(cita.fecha),  // el input type="date" necesita AAAA-MM-DD
    hora: cita.hora || "",
    motivo: cita.motivo || "",
    observacions: cita.observacions || "",
    estado: cita.estado || "pendente"
  })

  editando.value = true              // el botón pasa a decir "Actualizar"
  idCitaEditando.value = cita._id    // recordamos cuál es la cita que estamos editando

  alertaInfo("Cita cargada no formulario para editala")
}

//Delete
// Elimina la cita, pero antes pide confirmación al usuario
async function eliminarCita(cita) {
  const r = await alertaConfirmacion("¿Seguro que queres eliminar esta cita?")
  if (!r.isConfirmed) return   // si dice que no, salimos sin hacer nada

  try {
    await deleteCita(cita._id)
    alertaExito("Cita eliminada correctamente")
    await clear()
    await cargarDatos()   // recargamos el listado
  } catch (error) {
    console.error("Erro ao eliminar a cita:", error)
    alertaError("Non se puido eliminar a cita")
  }
}

//===================================================================================
// Funcións auxiliares

// Devuelve el nombre del paciente de una cita en formato "Apellidos, Nombre"
function nomePaciente(cita) {
  if (!cita.pacienteId) return ""
  return `${cita.pacienteId.apelpac || ""}, ${cita.pacienteId.nomepac || ""}`
}

// Devuelve el nombre del doctor de una cita en formato "Apellidos, Nombre"
function nomeDoctor(cita) {
  if (!cita.doctorId) return ""
  return `${cita.doctorId.apeldoc || ""}, ${cita.doctorId.nomedoc || ""}`
}

// Pasa la fecha a formato AAAA-MM-DD, que es lo que entiende el input type="date"
function formatearDataInput(fecha) {
  if (!fecha) return ""
  const d = new Date(fecha)
  if (isNaN(d.getTime())) return ""
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, "0")
  const dia = String(d.getDate()).padStart(2, "0")
  return `${ano}-${mes}-${dia}`
}

// Pasa la fecha a formato DD/MM/AAAA, que es más bonito para mostrar en la tabla
function formatearData(fecha) {
  if (!fecha) return ""
  const d = new Date(fecha)
  if (isNaN(d.getTime())) return ""
  const mes = String(d.getMonth() + 1).padStart(2, "0")
  const dia = String(d.getDate()).padStart(2, "0")
  return `${dia}/${mes}/${d.getFullYear()}`
}

// Genera el informe PDF con las citas que se están viendo en la tabla (las filtradas)
function exportarPDF() {
  if (citasFiltradas.value.length === 0) {
    alertaInfo("Non hai citas para exportar")
    return
  }

  try {
    // columnas = array de textos; filas = array de arrays de textos
    const columnas = ["#", "Data", "Hora", "Paciente", "Doctor", "Motivo", "Estado"]

    const filas = citasFiltradas.value.map((c, index) => [
      String(index + 1),
      formatearData(c.fecha),
      c.hora || "",
      nomePaciente(c),
      nomeDoctor(c),
      c.motivo || "",
      c.estado || ""
    ])

    exportarTablaPDF({
      titulo: "Listaxe de Citas",
      columnas: columnas,
      filas: filas,
      nombreFichero: "citas.pdf"
    })
  } catch (error) {
    console.error("Erro ao xerar o PDF:", error)
    alertaError("Non se puido xerar o informe PDF")
  }
}

// Botón "Limpar": vacía el formulario y sale del modo edición
const limpiaFormcita = () => {
  Object.assign(novaCita, {
    pacienteId: "",
    doctorId: "",
    fecha: "",
    hora: "",
    motivo: "",
    observacions: "",
    estado: "pendente"
  })
  editando.value = false
  idCitaEditando.value = null
}
</script>

<style scoped>
.error {
  color: red;
  font-size: 0.9rem;
  margin-top: 0.2rem;
}

.xestion-cita {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  background: white;
  padding: clamp(1rem, 3vw, 2rem);
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

form {
  display: flex;
  padding: 0;
  width: 100%;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
  box-sizing: border-box;
}

.fila {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
}

.fila-centrada {
  justify-content: center;
}

.fila-filtro {
  margin-bottom: 0.5rem;
}

.campo {
  display: flex;
  flex: 1 1 220px;
  min-width: min(100%, 220px);
  flex-direction: row;
  align-items: stretch;
  gap: 0.35rem;
}

.campo label {
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
}

.campo input,
.campo select,
.campo textarea {
  width: 100%;
  min-height: 2.5rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  box-sizing: border-box;
  background: #fff;
  font-family: inherit;
}

.campo input:focus,
.campo select:focus,
.campo textarea:focus {
  outline: 2px solid rgba(5, 117, 89, 0.25);
  border-color: #057559;
}

.campo-observacions {
  flex: 1 1 100%;
}

.fila > .error-message {
  flex: 1 1 100%;
  margin: 0;
}

.fila > button:not(.btn-guardar) {
  min-height: 2.5rem;
  align-self: flex-end;
}

.btn-guardar {
  background-color: #057559;
  color: white;
  border: 3px solid #00aa1c;
  border-image: linear-gradient(45deg, #00aa1c, #0000ff) 1;
  /* Define los dos colores y el ángulo */
  padding: 0.4rem 1.5rem;
  border-radius: 0px;
  cursor: pointer;
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.8rem;
  border: 1px solid #ddd;
  display: block;
  overflow-x: auto;
  white-space: nowrap;
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

/* Ficha del paciente seleccionado, encima de la listaxe de citas */
.ficha-paciente {
  background: #ffffff;
  border-left: 0.3rem solid #07c751;
  border-radius: 0.5rem;
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 0.1rem 0.4rem rgba(0, 0, 0, 0.08);
}

.ficha-paciente p {
  margin: 0.15rem 0;
}

.titulo-ficha {
  color: #1b6534;
  font-weight: bold;
  margin-bottom: 0.4rem;
}

@media (max-width: 768px) {
  .xestion-cita {
    padding: 1rem;
  }

  .fila {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }

  .campo,
  .fila > button:not(.btn-guardar) {
    width: 100%;
  }
}
</style>

<template>
    <div class="xestion-doctor">
        <h4>🧑‍⚕️ Xestión de doctores</h4>

        <!-- ================= FORMULARIO =================
             @submit.prevent="guardarDoctor"
             -> @submit escucha el envío del formulario.
             -> El modificador .prevent hace preventDefault(), es decir, evita
                que el navegador recargue la página al enviar. Así gestionamos
                nosotros el envío con JavaScript (Vue).
        -->
        <form @submit.prevent="guardarDoctor">

            <div class="fila">
                <div class="campo campo-id">
                    <label for="iddoc">ID:</label>
                    <!-- v-model crea el enlace de DOBLE SENTIDO (two-way binding)
                         entre el input y novoDoctor.iddoc: si escribo en el input
                         cambia la variable, y si cambia la variable cambia el input.

                         v-on:input (abreviado @input) se ejecuta en cada tecla
                         y convierte lo que se escribe a MAYÚSCULAS.

                         :readonly="editando" -> atributo DINÁMICO (lleva dos puntos).
                         Cuando editando es true el ID NO se puede cambiar, porque el
                         ID es la clave con la que localizamos al doctor en la base de datos. -->
                    <input id="iddoc" v-model="novoDoctor.iddoc"
                        v-on:input="novoDoctor.iddoc = novoDoctor.iddoc.toUpperCase()" type="text" required
                        :readonly="editando" style="text-align: center;" />
                </div>

                <!-- @click="limpiaFormdoc" -> al pulsar ejecuta la función que vacía
                     el formulario. type="button" es IMPORTANTE: si fuese submit
                     enviaría el formulario.
                     title -> texto que aparece al pasar el ratón (tooltip).
                     aria-label + <span class="sr-only"> -> texto accesible para los
                     lectores de pantalla, porque un emoji sin texto no se lee bien. -->
                <button type="button" class="btn-accion" @click="limpiaFormdoc" title="Limpar formulario"
                    aria-label="Limpar formulario">
                    <span aria-hidden="true">✨</span>
                    <span class="sr-only">Limpar formulario</span>
                </button>

                <!-- @click="buscarDoctor" -> busca por ID o por especialidad -->
                <button type="button" class="btn-accion" @click="buscarDoctor" title="Buscar" aria-label="Buscar">
                    <span aria-hidden="true">🔍</span>
                    <span class="sr-only">Buscar</span>
                </button>

                <div class="campo campo-nome">
                    <label for="nomedoc">Nome:</label>
                    <!-- @keyup.enter -> al pulsar la tecla Enter.
                         @blur       -> al salir del campo (perder el foco).
                         En los dos casos llamamos a corrixirNome() para poner la
                         primera letra de cada palabra en mayúscula. -->
                    <input id="nomedoc" v-model="novoDoctor.nomedoc" type="text" @keyup.enter="corrixirNome()"
                        @blur="corrixirNome()" required />
                </div>

                <div class="campo campo-apelido">
                    <label for="apeldoc">Apelido:</label>
                    <input id="apeldoc" v-model="novoDoctor.apeldoc" type="text" @keyup.enter="corrixirApelido()"
                        @blur="corrixirApelido()" required />
                </div>
            </div>

            <div class="fila">
                <div class="campo campo-colegiado">
                    <label>Colegiado</label>
                    <!-- RADIOS: los dos comparten el MISMO v-model, así que solo uno
                         puede estar marcado a la vez.
                         OJO: value="Si" / value="No" SIN dos puntos, porque queremos
                         guardar el TEXTO "Si" o "No". En el modelo de Mongoose el
                         campo coledoc es un String, por eso NO usamos
                         :value="true" ni :value="false". -->
                    <input v-model="novoDoctor.coledoc" type="radio" value="Si" name="colegiado" id="si-radio"
                        required />
                    <label for="si-radio">Si</label>

                    <input v-model="novoDoctor.coledoc" type="radio" value="No" name="colegiado" id="no-radio"
                        required />
                    <label for="no-radio">No</label>
                </div>

                <div class="campo campo-correo">
                    <label for="maildoc">Correo:</label>
                    <!-- type="email" hace que el navegador valide el formato -->
                    <input id="maildoc" v-model="novoDoctor.maildoc" type="email" required />
                </div>

            </div>

            <div class="fila">
                <div class="campo campo-telefono">
                    <label for="movildoc">Telefono:</label>
                    <!-- pattern -> validación HTML5: empieza por 6, 7 o 9
                         y lleva 8 dígitos más -->
                    <input id="movildoc" v-model="novoDoctor.movildoc" type="text" pattern="[679][0-9]{8}" required />
                </div>

                <!-- v-if -> pinta este bloque SOLO si la condición es cierta.
                     Aquí: hay algo escrito en el móvil PERO no es válido.
                     (A diferencia de v-show, v-if ni siquiera crea el elemento en el DOM.) -->
                <div v-if="novoDoctor.movildoc !== '' && !validarTelf()" class="error-message">
                    <p class="error">O teléfono non é válido</p>
                </div>

                <div class="campo campo-especialidad">
                    <label for="especialidad">Especialidad:</label>
                    <select id="especialidad" v-model="novoDoctor.espedoc" required>
                        <option value="">Selecciona unha especialidad</option>
                        <!-- v-for -> repite la etiqueta <option> una vez por cada
                             elemento del array especialidades.
                             :key -> identificador ÚNICO de cada elemento. Vue lo
                             necesita para saber qué elemento es cada uno y
                             reutilizar el DOM cuando la lista cambia.
                             :value -> el valor que se guarda en novoDoctor.espedoc -->
                        <option v-for="especialidad in especialidades" :key="especialidad.id" :value="especialidad.nm">
                            {{ especialidad.nm }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="campo-condicions">
                <label>
                    <!-- v-model en un checkbox guarda true / false (booleano),
                         que es exactamente lo que espera el campo loddoc del modelo. -->
                    <input v-model="novoDoctor.loddoc" type="checkbox" /> Aceptar a
                    <a :href="$router.resolve({ name: 'PoliticaPrivacidad' }).href" target="_blank"
                        rel="noopener noreferrer">
                        Política de privacidade e confidencialidade
                    </a>
                </label>
            </div>

            <!-- :disabled -> atributo dinámico: el botón queda DESACTIVADO mientras
                 falten datos obligatorios (nombre, apellido, especialidad o
                 aceptar la política de privacidad).
                 El texto cambia con editando: "Actualizar" si estamos modificando
                 un doctor que ya existe, "Gardar" si estamos creando uno nuevo. -->
            <button type="submit" class="btn-guardar" :disabled="novoDoctor.nomedoc === '' ||
                novoDoctor.apeldoc === '' ||
                !novoDoctor.espedoc ||
                !novoDoctor.loddoc
                ">
                {{ editando ? 'Actualizar' : 'Gardar' }}
            </button>
        </form>

        <h4>📋 Listaxe de doctores</h4>

        <!-- ============ BARRA DE FILTRO + INFORME EN PDF ============ -->
        <div class="barra-listaxe">
            <div class="campo campo-filtro">
                <label for="filtro">Filtrar:</label>
                <!-- v-model.trim -> igual que v-model pero quitando los espacios del
                     principio y del final. Cada tecla recalcula el computed
                     doctoresFiltrados, por lo que la tabla se filtra sola (reactividad). -->
                <input id="filtro" v-model.trim="filtro" type="text"
                    placeholder="ID, nome, apelidos ou especialidade" />
            </div>

            <!-- @click -> genera el PDF con las filas que se están viendo -->
            <button type="button" class="btn-pdf" @click="exportarPDF" title="Descargar a listaxe en PDF"
                aria-label="Descargar a listaxe en PDF">
                📄 PDF
            </button>
        </div>

        <!-- v-if / v-else -> o pintamos la tabla o pintamos el mensaje,
             nunca las dos cosas a la vez. -->
        <table v-if="doctoresFiltrados.length > 0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>ID</th>
                    <th>Apelidos</th>
                    <th>Nome</th>
                    <th>Colegiado</th>
                    <th>Móvil</th>
                    <th>Especialidad</th>
                    <th>Accións</th>
                </tr>
            </thead>
            <tbody>
                <!-- v-for sobre el computed (la lista ya filtrada).
                     (u, index) -> u es el doctor e index su posición.
                     :key="u.iddoc" -> mejor que el index: el ID es único y estable
                     aunque la lista se filtre o se reordene. -->
                <tr v-for="(u, index) in doctoresFiltrados" :key="u.iddoc">
                    <td style="text-align: center;">{{ index + 1 }}</td>
                    <td style="text-align: center;">{{ u.iddoc }}</td>
                    <td>{{ u.apeldoc }}</td>
                    <td>{{ u.nomedoc }}</td>
                    <td style="text-align: center;">{{ u.coledoc }}</td>
                    <td>{{ u.movildoc }}</td>
                    <td style="text-align: center;">{{ u.espedoc }}</td>
                    <td style="text-align: center;">
                        <!-- Pasamos el propio doctor (u) y NO el index, porque el
                             index de la lista filtrada no coincide con el de la lista
                             completa y editaríamos o borraríamos la fila equivocada. -->
                        <button type="button" @click="editarUsuario(u)" title="Editar" aria-label="Editar doctor">
                            ✏️
                        </button>
                        <button type="button" @click="eliminarUsuario(u)" title="Eliminar" aria-label="Eliminar doctor">
                            🗑️
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <p v-else>Non hai doctores cargados.</p>
    </div>
</template>

<script setup>
/// Zona de declaracións

// Del núcleo de Vue importamos las funciones de la Composition API que usamos:
//   ref       -> variable reactiva simple (en el script se accede con .value)
//   reactive  -> objeto reactivo (se accede directamente a las propiedades)
//   computed  -> valor calculado, solo se recalcula cuando cambian sus datos
//   onMounted -> gancho del ciclo de vida: se ejecuta al montar el componente
import { ref, reactive, computed, onMounted } from 'vue'

// Capa de API: funciones que hablan con el backend usando axios
import { obtenerEspecialidades } from "../api/especialidades.js"
import {
    saveDoctor,
    getDoctores,
    getDoctorById,
    getDoctorByEspecialidad,
    modifyDoctor,
    deleteDoctor
} from "../api/doctores.js"

// Store de Pinia: memoria compartida entre componentes (UD7)
import { usedoctorStore } from '../store/doctorStore.js'

// Avisos con SweetAlert2, centralizados en utils/alertas.js (UD6)
import { alertaExito, alertaError, alertaInfo, alertaConfirmacion } from '../utils/alertas.js'

// Informe en PDF (jsPDF + autotable), centralizado en utils/informes.js
import { exportarTablaPDF } from '../utils/informes.js'

// Creamos la INSTANCIA del store UNA SOLA VEZ, aquí en la zona de declaraciones.
// usedoctorStore es la "fábrica" que importamos; doctorStore es el almacén ya
// creado y listo para usar. Si llamásemos a usedoctorStore() dentro de cada
// función repetiríamos trabajo sin necesidad.
const doctorStore = usedoctorStore()

// Lista de especialidades para el <select> (nos llega del backend)
const especialidades = ref([])

const doctores = ref([])      // almacena la lista de doctores y sus cambios
const editando = ref(false)   // false = estamos creando ; true = estamos modificando

// Texto del buscador de la tabla. Al ser un ref, cualquier cambio hace que Vue
// vuelva a calcular todo lo que dependa de él (en este caso el computed de abajo).
const filtro = ref('')

// Objeto reactivo ligado al formulario con los v-model.
// Usamos reactive (y no ref) porque es un objeto con varios campos.
const novoDoctor = reactive({
    iddoc: "",
    nomedoc: "",
    apeldoc: "",
    maildoc: "",
    movildoc: "",
    coledoc: "",
    espedoc: "",
    loddoc: false //aceptación politica privacidade
});

// COMPUTED: la lista de doctores ya filtrada.
// Una propiedad CALCULADA se guarda en caché y solo se vuelve a calcular cuando
// cambia algo de lo que depende (aquí: doctores o filtro). Es lo que usamos en
// el v-for de la tabla, así nunca modificamos el array original.
const doctoresFiltrados = computed(() => {
    const texto = filtro.value.trim().toLowerCase()

    // Si el buscador está vacío devolvemos la lista completa
    if (texto === '') return doctores.value

    // filter() devuelve un array NUEVO con los elementos que cumplen la condición.
    // Comparamos todo en minúsculas para que no importen las mayúsculas.
    // El || '' protege por si algún campo viene a null o undefined.
    return doctores.value.filter(d =>
        (d.iddoc || '').toLowerCase().includes(texto) ||
        (d.nomedoc || '').toLowerCase().includes(texto) ||
        (d.apeldoc || '').toLowerCase().includes(texto) ||
        (d.espedoc || '').toLowerCase().includes(texto)
    )
})

/// Zona de ciclo de vida

// onMounted se ejecuta UNA VEZ, cuando el componente ya está en el DOM.
// Es el sitio correcto para pedirle al servidor los datos iniciales.
onMounted(async () => {
    try {
        especialidades.value = await obtenerEspecialidades();
        doctores.value = await getDoctores();
    } catch (error) {
        // Si el backend no está arrancado avisamos, en vez de dejar la página vacía
        console.error('Erro ao cargar os datos iniciais: ', error);
        alertaError('Non se puideron cargar os datos. Comproba que o servidor está arrancado.');
    }
})

/// Zona de métodos ou funcións

// Deja el formulario como al principio.
// Object.assign copia las propiedades sobre el MISMO objeto novoDoctor; si
// hiciésemos novoDoctor = { ... } romperíamos la reactividad de los v-model.
async function clear() {
    Object.assign(novoDoctor, {
        iddoc: "",
        nomedoc: "",
        apeldoc: "",
        maildoc: "",
        movildoc: "",
        coledoc: "",
        espedoc: "",
        loddoc: false
    })
}

//CRUD
//Create
async function guardarDoctor() {
    // 1) Validamos nosotros antes de molestar al servidor
    if (!validarTelf()) {
        await alertaError('O teléfono non é válido. Debe empezar por 6 ou 7 e ter 9 díxitos.');
        return;
    }

    try {
        if (editando.value) {
            // ---------- MODIFICAR (Update) ----------
            // Enviamos el ID (para localizar al doctor) y el objeto con los datos nuevos
            const resposta = await modifyDoctor(novoDoctor.iddoc, novoDoctor);

            // Según la ruta, el backend puede devolver el doctor directamente o
            // envuelto en { doctor: {...} }. Con esto funciona en los dos casos.
            const doctorModificado = resposta?.doctor ?? resposta;

            // Buscamos en qué posición del array está para refrescar solo esa fila
            // de la tabla, sin tener que volver a pedir toda la lista al servidor.
            const index = doctores.value.findIndex(
                (d) => d.iddoc === novoDoctor.iddoc
            );

            if (index !== -1) {
                doctores.value[index] = doctorModificado;
            } else {
                // Si no lo encontramos (por ejemplo porque la lista estaba filtrada
                // por especialidad y ese doctor ya no está en el array), recargamos
                // la lista completa. Así la tabla nunca queda desactualizada.
                doctores.value = await getDoctores();
            }

            await alertaExito('Doctor actualizado correctamente');
            await clear();

        } else {
            // ---------- CREAR (Create) ----------
            const doctorGuardado = await saveDoctor(novoDoctor);

            // push añade el doctor nuevo al final del array; como doctores es
            // reactivo, la tabla se actualiza sola.
            doctores.value.push(doctorGuardado);

            await alertaExito('Doctor gardado con éxito');
            await clear();
        }

        // Salimos del modo edición en los dos casos
        editando.value = false;

    } catch (error) {
        // OJO: hay que escribir catch (error) con parámetro.
        // Un "catch { }" sin parámetro NO nos da la variable error.
        //
        // Aquí entramos también cuando el backend responde con un error 400
        // porque el iddoc ya existe (en la colección el campo es unique), por eso
        // el mensaje de la alerta avisa de que el ID puede estar duplicado.
        console.error('Error ao gardar doctor: ', error);
        await alertaError('Non se puido gardar o doctor. Revisa os datos ou se o ID xa existe.');
    }
}

//Read
async function buscarDoctor() {
    // Leemos lo que hay escrito en el formulario.
    // El || '' protege por si el campo estuviese a null.
    const id = (novoDoctor.iddoc || '').trim();
    const especialidade = (novoDoctor.espedoc || '').trim();

    try {
        if (id !== '') {
            // ---- CASO 1: hay un ID escrito ----
            // Buscamos ESE doctor concreto y cargamos sus datos en el
            // formulario para poder modificarlo.
            const doctor = await getDoctorById(id);

            if (!doctor) {
                await alertaInfo('Non existe ningún doctor con ese ID');
                return;
            }

            Object.assign(novoDoctor, doctor);  // rellena el formulario (v-model)
            delete novoDoctor._id;              // el _id de MongoDB no se edita
            editando.value = true;              // pasamos a modo modificación

            // Dejamos el doctor seleccionado en el store de Pinia, para que otros
            // componentes (por ejemplo el de citas) puedan usarlo.
            doctorStore.seleccionarDoctor(novoDoctor);

            await alertaInfo(`Doctor ${novoDoctor.nomedoc} ${novoDoctor.apeldoc} cargado no formulario`);

        } else if (especialidade !== '') {
            // ---- CASO 2: no hay ID pero sí especialidad ----
            // Filtramos la listaxe con los doctores de esa especialidad.
            const resultado = await getDoctorByEspecialidad(especialidade);

            // Normalizamos: si el backend devolviese un solo objeto lo metemos en
            // un array, porque la tabla siempre espera una lista.
            doctores.value = Array.isArray(resultado) ? resultado : [resultado];

            if (doctores.value.length === 0) {
                await alertaInfo(`Non hai doctores da especialidade ${especialidade}`);
            }

        } else {
            // ---- CASO 3: ni ID ni especialidad ----
            // Recargamos TODOS los doctores.
            doctores.value = await getDoctores();
        }

    } catch (error) {
        // El operador ?. (optional chaining) evita que pete si no hay response
        if (error.response?.status === 404) {
            await alertaInfo('Doctor non encontrado');
        } else {
            console.error("Error: ", error);
            await alertaError('Produciuse un erro na busca');
        }
    }
}

//Update
// Recibe el propio doctor de la fila (no el index) y lo carga en el formulario.
async function editarUsuario(doctor) {
    // Object.assign carga los datos del doctor en el formulario;
    // recuerda que el v-model del formulario es novoDoctor.
    Object.assign(novoDoctor, doctor);

    // Evitar que se cargue el _id de MongoDB en el formulario
    delete novoDoctor._id;

    // Con el modo edición activo el botón pone "Actualizar" y el ID queda readonly
    editando.value = true;

    // Guardamos el doctor seleccionado en el store de Pinia
    doctorStore.seleccionarDoctor(novoDoctor);
}

//Delete
// Recibe el propio doctor de la fila (no el index).
async function eliminarUsuario(doctor) {
    // Pedimos confirmación ANTES de borrar. alertaConfirmacion devuelve una
    // promesa, por eso usamos await; si el usuario pulsa Cancelar salimos.
    const resposta = await alertaConfirmacion(
        `Vas eliminar ao doctor ${doctor.nomedoc} ${doctor.apeldoc}. Esta acción non se pode desfacer.`
    );
    if (!resposta.isConfirmed) return;

    try {
        // 1) Borramos en el servidor
        await deleteDoctor(doctor.iddoc);

        // 2) Borramos del array local UNA SOLA VEZ.
        //    Localizamos la posición real por el iddoc y splice(index, 1) quita
        //    exactamente un elemento. (Si llamamos a splice dos veces
        //    borraríamos también la fila siguiente.)
        const index = doctores.value.findIndex(d => d.iddoc === doctor.iddoc);
        if (index !== -1) {
            doctores.value.splice(index, 1);
        }

        await alertaExito('Doctor eliminado correctamente');

        // Si estábamos editando ese mismo doctor, limpiamos el formulario
        if (editando.value && novoDoctor.iddoc === doctor.iddoc) {
            limpiaFormdoc();
        }

    } catch (error) {
        console.error("Erro ao eliminar o doctor", error);
        await alertaError('Non se puido eliminar o doctor');
    }
}

// Genera el informe en PDF con la listaxe que se está viendo (ya filtrada).
function exportarPDF() {
    if (doctoresFiltrados.value.length === 0) {
        alertaInfo('Non hai doctores para exportar');
        return;
    }

    exportarTablaPDF({
        titulo: 'Listaxe de doctores',

        // columnas -> array de textos con las cabeceras de la tabla
        columnas: ['#', 'ID', 'Apelidos', 'Nome', 'Colegiado', 'Móvil', 'Especialidad'],

        // filas -> array de arrays de textos. map() transforma cada doctor
        // en una fila. String(...) y || '' aseguran que todo va como texto.
        filas: doctoresFiltrados.value.map((d, i) => [
            String(i + 1),
            d.iddoc || '',
            d.apeldoc || '',
            d.nomedoc || '',
            d.coledoc || '',
            d.movildoc || '',
            d.espedoc || ''
        ]),

        nombreFichero: 'listaxe-doctores.pdf'
    });
}

// Funcións auxiliares

// Pone la primera letra de cada palabra del NOMBRE en mayúscula y el resto en
// minúscula ("pEDRO  luis" -> "Pedro Luis").
function corrixirNome() {
    if (novoDoctor.nomedoc.length > 0) {
        novoDoctor.nomedoc = novoDoctor.nomedoc
            .trim()                  // quita los espacios de los extremos
            .split(/\s+/)            // separa por uno o más espacios
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');              // vuelve a juntar las palabras con un espacio
    }
}

// Lo mismo pero con los APELLIDOS
function corrixirApelido() {
    if (novoDoctor.apeldoc.length > 0) {
        novoDoctor.apeldoc = novoDoctor.apeldoc
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
}

// Valida el móvil con una expresión regular:
//   ^       principio de la cadena
//   [67]    el primer carácter debe ser 6 o 7
//   \d{8}   ocho dígitos más
//   $       fin de la cadena
// IMPORTANTE: devuelve SIEMPRE un booleano (true/false), nunca undefined,
// porque lo usamos en un v-if de la plantilla y en un if de guardarDoctor.
function validarTelf() {
    const telfRegex = /^[67]\d{8}$/;

    // Si está vacío no es válido
    if (!novoDoctor.movildoc || novoDoctor.movildoc.trim() === "") {
        return false;
    }

    return telfRegex.test(novoDoctor.movildoc.trim());
}

// Botón ✨ : deja el formulario como nuevo y sale del modo edición.
const limpiaFormdoc = () => {
    Object.assign(novoDoctor, {
        iddoc: "",
        nomedoc: "",
        apeldoc: "",
        maildoc: "",
        movildoc: "",
        coledoc: "",
        espedoc: "",
        loddoc: false
    });

    editando.value = false;

    // También vaciamos el doctor seleccionado en el store de Pinia
    doctorStore.limpiarDoctor();
}

</script>


<style scoped>
.error {
    color: red;
    font-size: 0.9rem;
    margin-top: 0.2rem;
}

.xestion-doctor {
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

.campo {
    display: flex;
    flex: 1 1 220px;
    min-width: min(100%, 220px);
    flex-direction: row;
    align-items: stretch;
    gap: 0.35rem;
    min-width: 0;
}

.campo label {
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;

}

.campo input,
.campo select {
    width: 100%;
    min-height: 2.5rem;
    padding: 0.55rem 0.7rem;
    border: 1px solid #d1d5db;
    border-radius: 3px;
    box-sizing: border-box;
    background: #fff;
}

.campo input:focus,
.campo select:focus {
    outline: 2px solid rgba(5, 117, 89, 0.25);
    border-color: #057559;
}

/* Cuando editamos, el ID no se puede cambiar: se marca en gris */
.campo input[readonly] {
    background: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
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

/* ---------- Barra con el filtro y el botón de PDF ---------- */
.barra-listaxe {
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: 1rem;
    width: 100%;
    margin-bottom: 0.5rem;
}

.campo-filtro {
    flex: 1 1 320px;
}

.btn-pdf {
    min-height: 2.5rem;
    padding: 0.4rem 1rem;
    background-color: #057559;
    color: white;
    border: 1px solid #057559;
    cursor: pointer;
    white-space: nowrap;
}

.btn-pdf:hover {
    background-color: #637a76;
}

/* Texto solo para lectores de pantalla: no se ve, pero sí se lee.
   Sirve para que los botones con emoji (✨ 🔍) tengan texto accesible. */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
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

@media (max-width: 768px) {
    .xestion-doctor {
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

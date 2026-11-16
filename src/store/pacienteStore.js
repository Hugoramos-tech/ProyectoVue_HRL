// ===========================================================================
//  src/store/pacienteStore.js   (UD8 - Pinia. Estados centralizados)
//
//  Un "store" es una caja de datos COMPARTIDA por todos los componentes.
//  Sirve para no tener que ir pasando props de padres a hijos: cualquier
//  componente puede leer o escribir aquí.
// ===========================================================================

// Importamos defineStore de Pinia para crear un almacén de datos (store)
import { defineStore } from 'pinia'

// Creamos el store de pacientes.
// 'paciente' es el identificador único de este store (no puede repetirse).
export const usepacienteStore = defineStore('paciente', {

    // STATE: contiene los datos que queremos compartir
    // entre los diferentes componentes de Vue.
    state: () => ({
        pacientes: [],   // lista completa de pacientes
        dnipac: null,    // DNI del paciente seleccionado
        nomepac: null,   // nombre del paciente seleccionado
        apelpac: null    // apellidos del paciente seleccionado
    }),

    // GETTERS: datos calculados a partir del state (como los computed).
    getters: {
        // Devuelve "Apellidos, Nombre" del paciente seleccionado.
        nomeCompleto: (state) => {
            if (!state.dnipac) return '';
            return `${state.apelpac}, ${state.nomepac}`;
        },
        // Cuántos pacientes hay guardados en el store.
        totalPacientes: (state) => state.pacientes.length
    },

    // ACTIONS: funciones que MODIFICAN el state.
    actions: {
        // Guarda en el store la lista completa de pacientes.
        gardarPacientes(lista) {
            this.pacientes = lista;
        },

        // Recibe un objeto paciente como parámetro
        // y guarda sus datos en el store de Pinia.
        seleccionarPaciente(paciente) {
            this.dnipac = paciente.dnipac;   // Guardamos el dni
            this.nomepac = paciente.nomepac; // Guardamos el nombre
            this.apelpac = paciente.apelpac; // Guardamos el apellido
        },

        // Deja vacío el paciente seleccionado.
        limpiarPaciente() {
            this.dnipac = null;
            this.nomepac = null;
            this.apelpac = null;
        }
    }
});

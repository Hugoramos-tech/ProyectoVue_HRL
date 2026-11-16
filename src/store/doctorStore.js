// ===========================================================================
//  src/store/doctorStore.js   (UD8 - Pinia. Estados centralizados)
//
//  Store de doctores. Es idéntico al de pacientes pero con los campos
//  propios del doctor (iddoc, nomedoc, apeldoc, espedoc).
// ===========================================================================

// Importamos defineStore de Pinia para crear un almacén de datos (store)
import { defineStore } from 'pinia'

// Creamos el store de doctores.
// 'doctor' es el identificador único de este store.
export const usedoctorStore = defineStore('doctor', {

    // STATE: los datos compartidos entre componentes.
    state: () => ({
        doctores: [],   // lista completa de doctores
        iddoc: null,    // ID del doctor seleccionado
        nomedoc: null,  // nombre del doctor seleccionado
        apeldoc: null,  // apellidos del doctor seleccionado
        espedoc: null   // especialidad del doctor seleccionado
    }),

    // GETTERS: datos calculados a partir del state.
    getters: {
        // Devuelve "Apellidos, Nombre" del doctor seleccionado.
        nomeCompleto: (state) => {
            if (!state.iddoc) return '';
            return `${state.apeldoc}, ${state.nomedoc}`;
        },
        // Cuántos doctores hay guardados en el store.
        totalDoctores: (state) => state.doctores.length
    },

    // ACTIONS: funciones que modifican el state.
    actions: {
        // Guarda en el store la lista completa de doctores.
        gardarDoctores(lista) {
            this.doctores = lista;
        },

        // Recibe un objeto doctor y guarda sus datos en el store.
        seleccionarDoctor(doctor) {
            this.iddoc = doctor.iddoc;     // Guardamos el id
            this.nomedoc = doctor.nomedoc; // Guardamos el nombre
            this.apeldoc = doctor.apeldoc; // Guardamos el apellido
            this.espedoc = doctor.espedoc; // Guardamos la especialidad
        },

        // Deja vacío el doctor seleccionado.
        limpiarDoctor() {
            this.iddoc = null;
            this.nomedoc = null;
            this.apeldoc = null;
            this.espedoc = null;
        }
    }
});

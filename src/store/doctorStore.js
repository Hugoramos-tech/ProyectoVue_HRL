import { defineStore } from "pinia";

// Guarda en Pinia el doctor elegido en la pestaña de doctores para reutilizarlo en citas.
export const useDoctorStore = defineStore("doctor", {
  // Datos del doctor activo; arrancan a null porque todavia no hay seleccion.
  state: () => ({
    idDoctor: null,
    nomedoc: null,
    apeldoc: null,
    espedoc: null,
  }),
  // Las acciones son las unicas que modifican el estado; dentro, this es el propio store.
  actions: {
    // Copia del doctor solo los campos que necesitan las demas pantallas.
    seleccionarDoctor(doctor) {
      this.idDoctor = doctor._id ?? null;
      this.nomedoc = doctor.nomedoc;
      this.apeldoc = doctor.apeldoc;
      this.espedoc = doctor.espedoc;
    },
    // Vacia la seleccion cuando se limpia el formulario de doctores.
    limpiarDoctor() {
      this.idDoctor = null;
      this.nomedoc = null;
      this.apeldoc = null;
      this.espedoc = null;
    },
  },
});

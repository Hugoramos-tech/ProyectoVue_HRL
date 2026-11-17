// ===========================================================================
//  src/router/index.js   (UD3 - Enrutamiento)
//
//  El router asocia una URL del navegador con el componente que se tiene que
//  mostrar dentro del <router-view /> de App.vue.
//  Es una SPA: al cambiar de página NO se recarga el navegador.
// ===========================================================================

import { createRouter, createWebHistory } from "vue-router";

// Importamos todos los componentes que actúan como "páginas"
import IniCio from '../components/IniCio.vue';
import ServizosMedicos from '../components/ServizosMedicos.vue';
import XestionPacientes from '../components/XestionPacientes.vue';
import XestionDoctores from '../components/XestionDoctores.vue';
import XestionCitas from '../components/XestionCitas.vue';
import SobreNos from '../components/SobreNos.vue';
import AvisoLegal from '../components/AvisoLegal.vue';
import PoliticaPrivacidad from '../components/PoliticaPrivacidad.vue';
import NotFound from '../components/NotFound.vue';

// Tabla de rutas. Cada ruta tiene:
//   path      -> lo que se escribe en la barra de direcciones
//   name      -> nombre interno (sirve para $router.resolve({ name: ... }))
//   component -> el componente que se dibuja
const routes = [
    { path: '/', name: 'IniCio', component: IniCio },
    { path: '/servizos-medicos', name: 'ServizosMedicos', component: ServizosMedicos },
    { path: '/xestionpacientes', name: 'XestionPacientes', component: XestionPacientes },
    { path: '/xestion-doctores', name: 'XestionDoctores', component: XestionDoctores },
    { path: '/xestion-citas', name: 'XestionCitas', component: XestionCitas },
    { path: '/sobrenos', name: 'SobreNos', component: SobreNos },
    { path: '/avisolegal', name: 'AvisoLegal', component: AvisoLegal },
    { path: '/politica-privacidad', name: 'PoliticaPrivacidad', component: PoliticaPrivacidad },

    // Ruta COMODÍN: tiene que ir siempre la última.
    // Captura cualquier dirección que no coincida con las anteriores
    // y muestra la página de error 404.
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

const router = createRouter({
    // createWebHistory -> URLs limpias, sin almohadilla (/xestion-citas)
    history: createWebHistory(),
    routes,

    // Al cambiar de página, volvemos siempre arriba del todo.
    scrollBehavior() {
        return { top: 0 };
    }
})

export default router;

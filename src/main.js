// ===========================================================================
//  src/main.js
//  Punto de entrada de la aplicación: aquí se "enciende" Vue.
//
//  Orden de lo que hacemos:
//    1. Creamos la aplicación a partir del componente raíz App.vue
//    2. Le enchufamos Pinia  (almacén de datos compartido - UD8)
//    3. Le enchufamos el Router (navegación entre páginas - UD3)
//    4. La montamos dentro del <div id="app"> del index.html
// ===========================================================================

import { createApp } from 'vue'          // función que crea la aplicación Vue
import { createPinia } from 'pinia'      // almacén de estado centralizado
import './style.css'                     // estilos globales de toda la app
import App from './App.vue'              // componente raíz
import router from './router'            // configuración de rutas (src/router/index.js)

// createApp(App) -> crea la app;  .use(...) -> le añade complementos (plugins)
const app = createApp(App)

app.use(createPinia())  // ahora cualquier componente puede usar los stores
app.use(router)         // ahora funcionan <router-link> y <router-view>

app.mount('#app')       // dibuja la app dentro del div con id="app"

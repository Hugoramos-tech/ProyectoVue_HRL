// ===========================================================================
//  vite.config.js
//  Configuración de Vite, la herramienta que levanta el servidor de
//  desarrollo (npm run dev) y empaqueta la aplicación (npm run build).
// ===========================================================================

import vue from '@vitejs/plugin-vue'   // plugin que entiende los ficheros .vue
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  server: {
    port: 5173,   // puerto del front; el backend usa el 3000
    open: false   // ponlo a true si quieres que abra el navegador solo
  }
})

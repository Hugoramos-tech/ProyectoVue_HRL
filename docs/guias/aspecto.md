# Cambiar el aspecto

| Qué | Dónde |
|---|---|
| Colores y tokens globales | `@theme` en `src/style.css` (el acento verde es `--color-accent*`) |
| Estilo de los campos | Reglas `input/select/textarea` en `@layer base` de `src/style.css` |
| Estilos de botón | `variantes` en `src/components/ui/AppButton.vue` |
| Alertas | `src/utils/alertas.js` |
| PDF | `src/utils/pdf.js` |
| Menú (orden, icono, texto) | `src/router/index.js`; el orden del array es el del menú |
| Vídeo de inicio | `src/assets/inicio.mp4` y `inicio-poster.jpg` |

## Recetas relacionadas

- [color-por-estado](../funcionalidades/estilos/color-por-estado.md)

# Cambiar el aspecto

Este proyecto **no tiene** un fichero de tokens de color ni componentes de interfaz
reutilizables: los colores están escritos directamente en las clases de Tailwind de cada
pantalla, con la notación de corchetes (`bg-[#14543a]`). Por eso cambiar un color es
buscar y reemplazar.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Estilos base y clases propias (`.tabla-wrapper`, `.btn-accion`, `.lista-vacia`…) | `src/style.css` |
| Verde oscuro principal | `#14543a`, repetido en `NavBar.vue`, las pantallas y `src/utils/pdf.js` |
| Verde medio (textos y enlaces) | `#28695e` y `#397c70` |
| Verde muy oscuro (títulos) | `#153f2e` |
| Gris de los textos secundarios | `#64737a` |
| Borde de las tarjetas y los campos | `#e1e9e7` y `#cfe0d6` |
| Menú: orden, texto y enlaces | `src/components/NavBar.vue`, escrito enlace por enlace |
| Pie de página | `src/components/FooTer.vue` |
| Alertas (iconos, colores, botones) | `src/utils/alertas.js` |
| PDF (color de la cabecera, tipografía) | `src/utils/pdf.js`, en `COLOR_PRIMARIO` y dentro de `autoTable(...)` |
| Vídeo de la portada | `public/assets/videos/clinica.mp4`, referenciado en `Inicio.vue` |
| Imágenes de los servicios | `public/assets/images/`, listadas en el array `servicios` de `Servicios.vue` |
| Imagen del 404 | `src/assets/404.png` |

## Cambiar el color principal de toda la aplicación

El verde oscuro `#14543a` es el color de la barra, de los títulos de sección y de la
cabecera de los PDF. Para cambiarlo:

```bash
grep -rn "14543a" src/
```

Sustituye ese código por el nuevo en todos los sitios que salgan, **y también** en
`COLOR_PRIMARIO` de `src/utils/pdf.js`, que es el mismo color pero escrito como tres
números:

```js
const COLOR_PRIMARIO = [20, 84, 58]
```

`20, 84, 58` es `#14543a` en decimal: `14` hexadecimal = 20, `54` = 84, `3a` = 58.
Si cambias uno y no el otro, la web y los PDF quedan de colores distintos.

## El detalle que despista

Tailwind solo genera las clases que encuentra **escritas enteras** en el código. Dos
consecuencias:

1. No se puede construir un nombre de clase pegando trozos (`` `bg-${color}-500` ``): no
   aparece. Hay que escribir las clases completas, como en
   [color por estado](../funcionalidades/estilos/color-por-estado.md).
2. Si cambias un color y no se nota, puede ser la caché: para `npm start` con Ctrl+C y
   vuelve a arrancarlo.

## Cambiar el aspecto de las alertas

Todas las ventanas de aviso salen de las cuatro funciones de `src/utils/alertas.js`:
`alertaExito`, `alertaError`, `alertaInfo` y `alertaConfirmacion`. Cambiando ahí el
`confirmButtonColor` o el `icon`, cambian en toda la aplicación de golpe. Eso es
justamente para lo que sirve tener las alertas en un fichero aparte.

## Recetas relacionadas

- [Color según el estado](../funcionalidades/estilos/color-por-estado.md)
- [Resaltar por valor](../funcionalidades/columnas-y-filtros/resaltar-por-valor.md)
- [Alertas extra](../funcionalidades/alertas-y-pdf/alertas-extra.md)

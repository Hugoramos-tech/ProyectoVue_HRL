# Animación de entrada en las tarjetas de Servizos

Las fotos de las tarjetas aparecen una detrás de otra con un efecto de «enfoque» (de borrosas a nítidas). El profe lo hace con una animación CSS escrita a mano en la propia página.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Servizos** (`/servicios`).

## La idea

Una animación CSS se define con `@keyframes`: describe cómo está el elemento al 0 %, al 50 % y al 100 % de la animación. Se aplica con la propiedad `animation`. Para que cada tarjeta empiece un poco más tarde que la anterior, cada una lleva un `animation-delay` distinto, calculado con su posición en la lista (`index`).

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Servicios.vue` | La posición en el `v-for`, la clase y el estilo de la foto, y el CSS |

## Paso 1 · Saber en qué posición va cada tarjeta

En `src/components/Servicios.vue`, busca la línea `v-for="servizo in servizos"` y **sustitúyela** por:

```vue
      v-for="(servizo, index) in servizos"
```

Qué hace: `v-for` con dos nombres da el elemento y su posición (0, 1, 2…).

## Paso 2 · La clase y el retraso en la foto

Busca la línea `class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"` y **sustitúyela** por estas dos líneas:

```vue
        class="efecto-enfoque absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        :style="{ animationDelay: `${index * 0.25}s` }"
```

Qué hace: `efecto-enfoque` es la clase que se define en el Paso 3. `:style` con los dos puntos calcula el retraso: 0 s la primera, 0,25 s la segunda, 0,5 s la tercera…

## Paso 3 · El CSS

Al **final del fichero**, después de `</script>`, pega:

```vue
<style scoped>
/* La clase aplica la animación `enfoque` durante 1,2 s. `both` = antes de empezar la foto ya está en
   su estado inicial (invisible) y al acabar se queda en el final. */
.efecto-enfoque {
  animation: enfoque 1.2s ease-out both;
}

/* @keyframes describe cómo está el elemento en cada momento de la animación (0 % = inicio, 100 % = final) */
@keyframes enfoque {
  0% {
    opacity: 0;
    filter: blur(15px); /* muy borrosa */
    transform: scale(1.1); /* un poco más grande */
  }
  50% {
    opacity: 0.6;
    filter: blur(6px);
  }
  100% {
    opacity: 1;
    filter: blur(0); /* nítida */
    transform: scale(1);
  }
}
</style>
```

Qué hace: `scoped` limita estas reglas a esta página. `both` deja la foto invisible durante el retraso, antes de que empiece su animación.

## Qué deberías ver

1. Al entrar en Servizos (o recargar con F5), las fotos aparecen una a una, de borrosas a nítidas y con un pequeño zoom.
2. El efecto al pasar el ratón por encima sigue funcionando.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| No se anima nada | Falta la clase `efecto-enfoque` en la foto, o el `<style>` está dentro del `<script>` |
| Todas aparecen a la vez | Falta `index` en el `v-for` o el `:style` con los dos puntos |
| `index is not defined` | El `v-for` quedó sin paréntesis: `(servizo, index)` |
| Se anima, pero solo la primera vez | Es normal: solo se anima al cargar la página |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `v-for` con índice | Repetir un elemento y saber su posición | `03_lecciones/vue/03_v_for.md` |
| `:style` | Valores de CSS calculados desde los datos | `03_lecciones/vue/08_class.md` |
| Transiciones y animaciones | `transition` y `@keyframes` | `03_lecciones/04_tailwind.md` |

## Guías relacionadas

- [Guía: aspecto](../../guias/aspecto.md)

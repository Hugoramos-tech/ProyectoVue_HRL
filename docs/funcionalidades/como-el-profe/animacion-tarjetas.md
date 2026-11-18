# Animación de entrada en las tarjetas de Servicios

Las tarjetas de la página de servicios aparecen una detrás de otra con un efecto de «enfoque»: de borrosas y un poco grandes, a nítidas y en su sitio. Se hace con una animación CSS escrita a mano en la propia página.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Servicios** (`/servicios`).

## La idea

Una animación CSS se define con `@keyframes`: describe cómo está el elemento al 0 %, al 50 %
y al 100 % de la animación. Se aplica con la propiedad `animation`.

Para que cada tarjeta empiece un poco más tarde que la anterior hace falta saber **en qué
posición va**. Eso lo da el segundo parámetro del `v-for`, y con él se calcula un
`animation-delay` distinto para cada una: 0 s la primera, 0,15 s la segunda, 0,30 s la
tercera…

Ese retraso escalonado es el truco entero. Sin él, las seis tarjetas aparecen de golpe.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Servicios.vue` | La posición en el `v-for`, la clase, el retraso y el CSS |

## Paso 1 · Saber en qué posición va cada tarjeta

En el `<template>`, busca la línea `        v-for="servicio in servicios"` y **sustitúyela** por:

```vue
        v-for="(servicio, index) in servicios"
```

Con dos nombres entre paréntesis, `v-for` da el elemento **y** su posición: 0, 1, 2…

## Paso 2 · La clase y el retraso

Justo debajo del `v-for` está la línea `        :key="servicio.titulo"`. Pega esto **justo debajo de ella**:

```vue
        :style="{ animationDelay: `${index * 0.15}s` }"
```

`:style` con los dos puntos permite calcular el valor desde los datos. En JavaScript la
propiedad se escribe `animationDelay`, en camelCase, no `animation-delay`.

Y en la línea siguiente, la del `class="overflow-hidden rounded-2xl ..."`, añade
`tarjeta-enfoque` al **principio** de la lista de clases:

```vue
        class="tarjeta-enfoque overflow-hidden rounded-2xl border border-[#e1e9e7] bg-white shadow-[0_5px_18px_rgba(20, 60, 45,0.06)] transition hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(20, 60, 45,0.12)]"
```

El orden de las clases no importa para que funcione; ponerla primera es solo para encontrarla
de un vistazo.

## Paso 3 · El CSS

Al **final del fichero**, después del `</script>`, pega esto:

```vue
<style scoped>
/* La clase aplica la animacion "enfoque" durante 0,9 segundos.
   ease-out = empieza rapido y frena al final: queda mas natural.
   both = el elemento ya esta en su estado INICIAL antes de empezar (invisible
   durante su retraso) y se queda en el FINAL al acabar. Sin both, las tarjetas
   se verian de golpe mientras esperan su turno, que es justo lo que no queremos. */
.tarjeta-enfoque {
  animation: enfoque 0.9s ease-out both;
}

/* @keyframes describe como esta el elemento en cada momento de la animacion */
@keyframes enfoque {
  0% {
    opacity: 0;
    filter: blur(12px);        /* muy borrosa */
    transform: scale(1.06);    /* un poco mas grande de lo normal */
  }
  60% {
    opacity: 0.7;
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    filter: blur(0);           /* nitida */
    transform: scale(1);       /* su tamano real */
  }
}
</style>
```

`scoped` limita estas reglas a este componente: la clase `tarjeta-enfoque` no afectará a
nada de otras pantallas, aunque se llame igual.

## Ojo con el `transform`

La tarjeta ya tiene `hover:-translate-y-1` de Tailwind, que también usa `transform`. Mientras
la animación está corriendo, el `transform` de la animación gana; en cuanto acaba, el del
`hover` vuelve a funcionar. Como la animación dura menos de un segundo, en la práctica no se
nota.

Si quisieras evitarlo del todo, anima solo `opacity` y `filter`, y quita las dos líneas de
`transform` del Paso 3.

## Variante · Que se anime solo al verla (`IntersectionObserver`)

Si la página creciera y las tarjetas quedaran más abajo, lo normal sería animarlas al llegar
a ellas, no al cargar. Con `@keyframes` eso no se puede: hace falta JavaScript.

```js
import { onMounted } from 'vue'

onMounted(() => {
  // IntersectionObserver avisa cuando un elemento entra en la pantalla.
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('tarjeta-enfoque')
        // Una vez animada, se deja de vigilar: no hace falta repetirlo.
        observador.unobserve(entrada.target)
      }
    })
  })

  document.querySelectorAll('article').forEach((el) => observador.observe(el))
})
```

Y en el Paso 2, **no** pongas `tarjeta-enfoque` en el `class`: la añade el observador.

## Variante · Respetar a quien no quiere animaciones

Es un detalle de accesibilidad que puntúa. Al final del `<style scoped>`:

```css
/* Si el usuario ha pedido en su sistema operativo menos animaciones, se desactiva */
@media (prefers-reduced-motion: reduce) {
  .tarjeta-enfoque {
    animation: none;
  }
}
```

## Variante · Solo un fundido, más sobrio

```css
@keyframes enfoque {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Las tarjetas suben un poco mientras aparecen. Es el efecto más usado y el que menos molesta.

## Qué deberías ver

1. Al entrar en Servicios, o al recargar con F5, las seis tarjetas aparecen una a una, de borrosas a nítidas.
2. Entre una y la siguiente pasan unas décimas de segundo.
3. El efecto de levantarse al pasar el ratón sigue funcionando.
4. Solo se anima al cargar la página: eso es lo normal con `@keyframes`.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| No se anima nada | Falta la clase `tarjeta-enfoque` en el `class` del `<article>`, o el `<style>` quedó dentro del `<script>` |
| Todas aparecen a la vez | Falta el `index` en el `v-for`, o el `:style` sin los dos puntos |
| `index is not defined` | El `v-for` quedó sin los paréntesis: tiene que ser `(servicio, index)` |
| Las tarjetas se ven antes de su turno | Falta el `both` en la línea de `animation` |
| Se animan y luego desaparecen | Falta el `both`, o pusiste `forwards` sin el estado inicial |
| El `animation-delay` no hace nada | En JavaScript se escribe `animationDelay`, en camelCase |
| Se rompió el efecto del ratón | Mira el apartado «Ojo con el `transform`» |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| `v-for` con índice | Repetir un elemento y saber su posición |
| `:style` | Valores de CSS calculados desde los datos |
| `@keyframes` | Describir la animación paso a paso |
| `animation-fill-mode: both` | Mantener el estado inicial y el final |
| `<style scoped>` | Reglas que solo afectan a este componente |
| `prefers-reduced-motion` | Respetar a quien prefiere menos movimiento |

## Guías relacionadas

- [Guía: cambiar el aspecto](../../guias/aspecto.md)
- [Color según el estado](../estilos/color-por-estado.md)
- [Componente hijo con props y emit](../pantallas/componente-props-emit.md)

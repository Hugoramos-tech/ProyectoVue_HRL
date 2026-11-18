# Saludo según la hora y reloj en vivo en la portada

Debajo del título de la portada, un saludo («Bos días», «Boas tardes» o «Boas noites») y la hora actual, que avanza cada segundo.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la portada (`/`).

## La idea

Un `ref` guarda la hora actual y un `setInterval` la actualiza cada segundo. El saludo es un `computed` que lee ese `ref`, así que cambia solo. Cuando se sale de la página hay que **parar** el intervalo con `onUnmounted`, o seguiría funcionando en segundo plano.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/Inicio.vue` | La hora, el saludo y el texto |

## Paso 1 · Los imports

En `src/components/Inicio.vue`, busca la línea `import videoInicio from "../assets/inicio.mp4";` y pega esto **justo encima**:

```js
// onMounted / onUnmounted = "cuando la página aparece" / "cuando la página desaparece"
import { ref, computed, onMounted, onUnmounted } from "vue";
```

## Paso 2 · La lógica

Busca la línea `import { Users, Stethoscope, CalendarDays, HeartPulse } from "lucide-vue-next";` y pega esto **justo debajo**:

```js
// La hora actual como ref: cada vez que se cambia su valor, lo que la lea se repinta.
const ahora = ref(new Date());
let temporizador;

// Al entrar en la página arranca un reloj: cada 1000 ms (1 segundo) se guarda la hora nueva
onMounted(() => {
  temporizador = setInterval(() => {
    ahora.value = new Date();
  }, 1000);
});

// Al salir de la página HAY QUE parar el reloj; si no, seguiría contando en segundo plano y se acumularía
onUnmounted(() => clearInterval(temporizador));

// computed: el saludo se recalcula solo cuando cambia `ahora`
const saludo = computed(() => {
  const hora = ahora.value.getHours(); // 0 a 23
  if (hora < 14) return "Bos días";
  if (hora < 21) return "Boas tardes";
  return "Boas noites";
});

// toLocaleTimeString escribe la hora al estilo de España (17:42:09)
const horaTexto = computed(() => ahora.value.toLocaleTimeString("es-ES"));
```

## Paso 3 · El texto

Busca la línea `<p class="mb-6 text-fg-soft">` y pega esto **justo encima**:

```vue
  <p class="mb-2 text-sm text-fg-muted">
    {{ saludo }} · {{ horaTexto }}
  </p>
```

## Qué deberías ver

1. Debajo del título: «Boas tardes · 17:42:09».
2. Los segundos avanzan solos.
3. Cambias de página y vuelves: el reloj sigue bien, sin acelerarse.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El reloj no avanza | Falta el `setInterval` o `ahora.value = new Date()` (sin `.value` no cambia nada) |
| Va más rápido cada vez que vuelves | Falta `clearInterval` en `onUnmounted` |
| `ref is not defined` | Falta el Paso 1 |
| Muestra siempre «Bos días» | El umbral de `hora` está mal: `hora < 14` para la mañana |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `onMounted` y `onUnmounted` | Hacer algo al entrar y al salir de la página | `03_lecciones/01_reactividad.md` |
| `computed` | El saludo se recalcula solo | `03_lecciones/vue/07_computed.md` |
| `ref` | La hora actual como dato vigilado | `03_lecciones/01_reactividad.md §2` |

## Guías relacionadas

- [Citas de hoy](../pinia/citas-de-hoy.md)

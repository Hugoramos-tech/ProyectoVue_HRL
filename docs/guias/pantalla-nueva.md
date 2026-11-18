# Pantalla nueva

Tres cambios, en este orden. El orden importa: así sabes dónde está el fallo si algo no va.

## 1. El componente

Crea `src/components/MiPantalla.vue`. Las pantallas de este proyecto empiezan así:

```vue
<template>
  <section class="box-border w-full min-w-0 rounded-lg bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)] sm:p-8">
    <h4 class="mb-4 rounded bg-[#14543a] px-3 py-2 font-semibold text-white">
      Título de la pantalla
    </h4>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
</script>
```

Si lo que quieres es un CRUD completo, no empieces de cero: copia
`src/components/PlantillaComponente.vue`, que es exactamente eso, o sigue
[entidad nueva](../funcionalidades/datos/entidad-nueva.md).

## 2. La ruta

En `src/router/index.js`, el import arriba, con los demás:

```js
import MiPantalla from '../components/MiPantalla.vue'
```

Y la entrada en el array, **antes del comodín**:

```js
    { path: '/mi-pantalla', name: 'MiPantalla', component: MiPantalla },
```

**Tiene que ir antes de `{ path: '/:pathMatch(.*)' ... }`.** El router prueba las rutas en
orden y el comodín se queda con todo lo que llegue a él: una ruta colocada después no se
alcanza nunca y sale la pantalla de 404.

**Pruébalo ya**, escribiendo `localhost:5173/mi-pantalla` en el navegador. Si funciona, el
problema de después estará en el menú y no en la ruta.

Tu router **no usa `meta`**: ninguna ruta lleva título ni icono, así que no hay que poner
nada de eso.

## 3. El enlace del menú

En `src/components/NavBar.vue` el menú está escrito **enlace por enlace**: no se genera a
partir de las rutas. Hay que añadir un `<li>` a mano, copiando las clases de otro enlace y
cambiando solo el `to` y el texto:

```vue
      <li>
        <RouterLink class="font-medium text-white no-underline transition-colors hover:text-[#ffe66d] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffe66d] [&.router-link-active]:border-b-[0.2rem] [&.router-link-active]:border-[#ffe66d]" to="/mi-pantalla">Mi pantalla</RouterLink>
      </li>
```

Las clases son largas porque están repetidas en cada enlace. No intentes acortarlas: cópialas
tal cual.

## Si la pantalla necesita datos

El camino es siempre el mismo, y **no hace falta un store**:

```
onMounted  ->  src/api/<recurso>.js  ->  backend/rutas/  ->  backend/modelos/  ->  MongoDB
```

```js
const cosas = ref([]);

// onMounted se ejecuta una vez, cuando la pantalla aparece.
onMounted(async () => {
  try {
    cosas.value = await getCosas();
  } catch (error) {
    alertaError("No se pudieron cargar los datos.");
  }
});
```

**La lista vive en un `ref` del componente**, no en Pinia. Tus dos stores
(`pacienteStore` y `doctorStore`) guardan solo **quién está seleccionado**, no las listas.

Crea un store **solo si** el dato lo necesitan varias pantallas. Si es para una sola, un `ref`
local es más simple y más fácil de defender.

## Si la pantalla recibe algo por la URL

Entonces los datos **no** se piden en `onMounted`, sino en un `watch`:
[ruta con parámetro](../funcionalidades/pantallas/ruta-con-parametro.md). El motivo es que si
solo cambia el parámetro, Vue reutiliza el componente y `onMounted` no se vuelve a ejecutar.

## Si algo falla

| Síntoma | Causa |
|---|---|
| Sale la pantalla de 404 | La ruta quedó después del comodín |
| `Failed to resolve component` | Falta el import en el router |
| La ruta funciona pero no hay cómo llegar | Falta el `<li>` en `NavBar.vue` |
| El enlace no aparece | El `<li>` quedó fuera del `<ul>`, o dentro de otro `<li>` |

## Recetas relacionadas

- [Ruta con parámetro](../funcionalidades/pantallas/ruta-con-parametro.md)
- [Componente hijo con props y emit](../funcionalidades/pantallas/componente-props-emit.md)
- [Entidad nueva con CRUD completo](../funcionalidades/datos/entidad-nueva.md)
- [Apuntes a fondo: rutas y componentes](../detalle/03-rutas-y-componentes.md)

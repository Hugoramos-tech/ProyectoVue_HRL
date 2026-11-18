# Páginas

| Ruta | Componente | Qué hace |
|---|---|---|
| `/` | `Inicio.vue` | Portada: presentación, vídeo de la clínica y accesos rápidos |
| `/servicios` | `Servicios.vue` | Las seis tarjetas de servicios, con sus fotos |
| `/XestionPacientes` | `XestionPacientes.vue` | CRUD de pacientes: validación de DNI, provincia y municipio en cascada, búsqueda por DNI y PDF |
| `/XestionDoctores` | `XestionDoctores.vue` | CRUD de doctores, con la especialidad desde el catálogo, y PDF |
| `/citas` | `Citas.vue` | CRUD de citas: paciente y doctor vienen de Pinia; fecha, hora, motivo y estado, listado y PDF |
| `/SobreNos` | `SobreNos.vue` | Página informativa |
| `/avisoLegal` | `AvisoLegal.vue` | Aviso legal |
| `/politica-privacidad` | `PoliticaPrivacidad.vue` | Política de privacidad |
| cualquier otra | `NotFound.vue` | Error 404 |

Las rutas están escritas a mano en un array en `src/router/index.js`. **No hay `meta`**: ni
títulos, ni iconos, ni marcas de menú.

`NavBar.vue` y `FooTer.vue` se ven en todas las páginas, alrededor del `<RouterView>` de
`App.vue`. **El menú está escrito enlace por enlace** en `NavBar.vue`, con un `<li>` y un
`<RouterLink>` por pantalla: no se genera a partir de las rutas. Para añadir una pantalla al
menú hay que añadir ese `<li>` a mano.

## Hay un componente que no está en el router

`src/components/PlantillaComponente.vue` es una pantalla CRUD completa de ejemplo, pensada
para copiarla y renombrarla. No tiene ruta, así que no se puede abrir en el navegador: se usa
como molde. Los textos entre corchetes, como `[NOMBRE DE LA ENTIDAD]`, son los huecos que hay
que sustituir.

Para un CRUD nuevo tienes dos caminos: copiar esa plantilla, o seguir
[entidad nueva](../funcionalidades/datos/entidad-nueva.md), que explica las cuatro capas una
por una. La plantilla es más rápida; la receta se entiende mejor.

## Cómo se relacionan las tres pantallas de datos

```
Pacientes  --selecciona-->  pacienteStore  --+
                                             |--> Citas (sabe de quién y con quién)
Doctores   --selecciona-->  doctorStore   ---+
```

En `Citas.vue` los desplegables de paciente y de doctor están **`disabled`**: muestran lo que
hay seleccionado, pero no dejan elegir. La selección se hace en la pantalla de cada uno. Si el
formulario de citas no deja guardar, casi siempre es que falta seleccionar uno de los dos.

Esa es la razón de que Pinia exista en este proyecto: un dato que necesitan tres pantallas no
se pasa por la URL ni por props.

## Las páginas que no tocan la base de datos

`Inicio`, `Servicios`, `SobreNos`, `AvisoLegal`, `PoliticaPrivacidad` y `NotFound` no hacen
ninguna petición: su contenido está escrito en el propio componente. Por eso siguen
funcionando aunque MongoDB esté apagado, y son una forma rápida de comprobar que el problema
está en la base de datos y no en la web.

`Servicios.vue` tiene su contenido en un array `servicios` dentro del `<script setup>`, con
el título, la descripción y la ruta de la imagen de cada tarjeta. Las fotos están en
`public/assets/images/`.

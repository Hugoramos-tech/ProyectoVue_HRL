# DNI válido: buscar el paciente y cargarlo solo

Al salir del campo DNI, si el DNI es válido, la web lo busca en la base de datos. Si el paciente existe, rellena el formulario para editarlo y avisa. Si no existe, no hace nada y se puede dar de alta. Es lo que hace el profe en sus últimos commits («preparando para el examen»).

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). Crea antes un paciente con un DNI válido, por ejemplo `12345678Z`.

## La idea

Ya existe `comprobarDni`, que se ejecuta al salir del campo (`@blur`) y solo valida la letra. Se amplía: si es válido, llama a `buscarPacientePorDni`, que ya existe y carga el formulario si encuentra al paciente. Después se mira si `idEditando` tiene valor: eso significa que lo encontró.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `src/components/XestionPacientes.vue` | Ampliar la función `comprobarDni` |

## Paso 1 · La función

En `src/components/XestionPacientes.vue`, busca estas tres líneas y **sustitúyelas** por el bloque de debajo:

```js
function comprobarDni() {
  dniValido.value = validarDni(datos.dnipac);
}
```

```js
// `async` permite usar `await` dentro: esperar a que termine una petición antes de seguir
async function comprobarDni() {
  // Lo de siempre: comprobar la letra del DNI y guardar el resultado (true / false)
  dniValido.value = validarDni(datos.dnipac);
  // Solo se busca si el DNI es válido y no se está editando ya a alguien (idEditando vacío = alta nueva)
  if (dniValido.value && !idEditando.value) {
    // buscarPacientePorDni pide el paciente al servidor y, si existe, rellena el formulario (y pone idEditando)
    await buscarPacientePorDni();
    if (idEditando.value) {
      // idEditando ya tiene valor: lo encontró
      alertaExito("Atención: o paciente xa existe na base de datos.");
    } else {
      // No existe: es un alta nueva, así que no hace falta el aviso rojo de "Paciente non atopado"
      dniNoAtopado.value = false;
    }
  }
}
```

Qué hace: `await` espera a que termine la búsqueda. `buscarPacientePorDni` carga el formulario si encuentra al paciente (y entonces `idEditando` tiene su id). Si no lo encuentra, se quita el aviso rojo porque en un alta es lo normal.

## Variante · Vaciar el campo si el DNI es inválido

Dentro de la misma función, después de la línea `dniValido.value = validarDni(datos.dnipac);`, pega:

```js
  // Si la letra no cuadra, se vacía el campo (el DNI se tiene que volver a escribir)
  if (!dniValido.value) datos.dnipac = "";
```

## Qué deberías ver

1. Escribes `12345678Z` y sales del campo: el formulario se rellena con ese paciente y sale el aviso verde «Atención: o paciente xa existe na base de datos.».
2. Escribes un DNI válido que no existe: no pasa nada y se puede seguir rellenando.
3. Escribes un DNI con la letra mal: sale «El dni es incorrecto» y no se busca.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| No hace nada al salir del campo | El `@blur="comprobarDni"` del input debe seguir ahí; no lo quites |
| Sale «Paciente non atopado» al crear uno nuevo | Falta el `else` con `dniNoAtopado.value = false` |
| El aviso sale dos veces | Se llama a `comprobarDni` desde dos sitios; deja solo el `@blur` |
| `await` da error de sintaxis | Falta la palabra `async` delante de `function comprobarDni` |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| `async` / `await` | Esperar a que termine una petición antes de seguir | `03_lecciones/03_crud_api_rest.md §5` |
| Eventos del formulario | `@blur` salta al salir de un campo | `03_lecciones/vue/02_v_model.md` |
| SweetAlert2 | El aviso verde al encontrarlo | `03_lecciones/05_sweetalert.md` |

## Guías relacionadas

- [Guía: validación nueva](../../guias/validacion-nueva.md)

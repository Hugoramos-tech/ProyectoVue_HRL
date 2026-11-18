# Dar de baja a un paciente sin borrarlo

Un botón en cada fila de pacientes que lo marca como «De baixa» (o «Activo» otra vez), sin borrar nada. Una columna lo muestra, y en el formulario de citas ya no se puede elegir a un paciente de baja.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). El backend no recarga solo: se reinicia tras el Paso 1.

## La idea

Borrar un paciente pierde su historial. Es más seguro **marcarlo**: un campo `activo` que vale `true` por defecto y pasa a `false` al darlo de baja. Los pacientes que ya existían no tienen ese campo, así que en la web «activo» es todo lo que **no** sea `false`.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/modelos/Paciente.js` | El campo `activo` |
| `src/components/XestionPacientes.vue` | La columna, el botón y la función |
| `src/components/Citas.vue` | Que el desplegable no ofrezca a los de baja |

## Paso 1 · El modelo

En `backend/modelos/Paciente.js`, busca la línea `lopdpac: { type: Boolean, required: true },` y pega esto **justo debajo**:

```js
        // Boolean = verdadero/falso. `default: true`: si el dato no viene, se guarda como activo.
        // Los pacientes que ya existían NO tienen este campo: por eso en la web "activo" es todo lo que no sea false.
        activo: { type: Boolean, default: true },
```

**Reinicia el backend.**

## Paso 2 · Los imports de la página

En `src/components/XestionPacientes.vue`, busca la línea `import { Users, ClipboardList, Save, FileDown, Search, Eraser } from "lucide-vue-next";` y **sustitúyela** por:

```js
// UserX / UserCheck = los iconos de los botones "dar de baja" / "dar de alta"
import { Users, ClipboardList, Save, FileDown, Search, Eraser, UserX, UserCheck } from "lucide-vue-next";
```

## Paso 3 · La columna

Busca la línea `{ clave: "munipac", titulo: "Municipio" },` y pega esto **justo debajo**:

```js
  // El `formato` convierte el true/false en un texto: solo un `false` explícito significa "de baja"
  { clave: "activo", titulo: "Estado", formato: (p) => (p.activo === false ? "De baixa" : "Activo") },
```

## Paso 4 · La función

Busca la línea `/// Funciones auxiliares` y pega esto **justo encima**:

```js
// Da de baja al paciente, o lo vuelve a dar de alta. Solo se envía el campo que cambia (PUT parcial).
async function alternarBaja(paciente) {
  // Si ahora está de baja (activo === false), el cambio es darlo de alta, y al revés
  const deBaixa = paciente.activo === false;
  try {
    // gardarPaciente(id, datos) actualiza el paciente y recarga la tabla
    await pacienteStore.gardarPaciente(paciente.id, { activo: deBaixa });
    alertaExito(deBaixa ? "Paciente dado de alta." : "Paciente dado de baixa.");
  } catch (e) {
    alertaError(mensajeError(e, "Non se puido cambiar o estado."));
  }
}
```

## Paso 5 · El botón

Busca estas cuatro líneas y **sustitúyelas** por el bloque de debajo:

```vue
        <RowActions
          @editar="editarPaciente(fila)"
          @eliminar="eliminarPacientePorId(fila)"
        />
```

```vue
        <RowActions
          @editar="editarPaciente(fila)"
          @eliminar="eliminarPacientePorId(fila)"
        >
          <!-- Lo que se escribe DENTRO de <RowActions> sale antes de los botones de editar y eliminar -->
          <AppButton
            variante="fantasma"
            icono
            :title="fila.activo === false ? 'Dar de alta' : 'Dar de baixa'"
            :aria-label="fila.activo === false ? 'Dar de alta' : 'Dar de baixa'"
            @click="alternarBaja(fila)"
          >
            <!-- v-if / v-else: un icono u otro según el estado -->
            <UserCheck v-if="fila.activo === false" :size="16" />
            <UserX v-else :size="16" />
          </AppButton>
        </RowActions>
```

## Paso 6 · Que Citas no ofrezca a los de baja

En `src/components/Citas.vue`, hay dos cambios.

Busca la línea `// Texto de la tabla cuando no hay filas: distingue "no hay citas" de "no hay con este filtro".` y pega esto **justo encima**:

```js
// Los pacientes a los que se puede dar cita: todos menos los que están de baja (activo === false)
const pacientesActivos = computed(() => pacientes.value.filter((p) => p.activo !== false));
```

Busca la línea `v-for="p in pacientes"` y **sustitúyela** por:

```vue
            v-for="p in pacientesActivos"
```

## Qué deberías ver

1. Una columna «Estado» con «Activo» para todos.
2. Un botón con un usuario tachado en cada fila. Al pulsarlo, el paciente pasa a «De baixa» y el botón cambia a uno con un tic.
3. En Citas, el desplegable de pacientes ya no incluye al de baja.
4. Al darlo de alta otra vez, vuelve a aparecer.
5. Sus citas anteriores siguen en la tabla de citas.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El estado no cambia | No reiniciaste el backend: sin el campo en el modelo, Mongoose lo ignora |
| Todos salen «De baixa» | Se escribió `!p.activo` en vez de `p.activo === false`: los antiguos no tienen el campo |
| `UserX is not defined` | No se cambió el import del Paso 2 |
| El botón no aparece | El `RowActions` del Paso 5 no se sustituyó entero |

## Conceptos que usa

| Concepto | En una línea | Se explica en (raíz de `diw-study`) |
|---|---|---|
| Schema con `default` | Un valor por defecto si el dato no viene | `03_lecciones/03_crud_api_rest.md §4` |
| `PUT` parcial | Enviar solo el campo que cambia | `03_lecciones/03_crud_api_rest.md §3` |
| `v-if` / `v-else` | Mostrar un icono u otro | `03_lecciones/vue/06_v_if.md` |

## Guías relacionadas

- [Guía: campo nuevo](../../guias/campo-nuevo.md)
- [Borrado en cascada](../backend/borrado-en-cascada.md)

# Dar de baja a un paciente sin borrarlo

Un botón en cada fila de pacientes que lo marca como «De baixa» (o «Activo» otra vez), sin borrar nada. Una columna lo muestra y los de baja no se pueden seleccionar para darles cita.

**Antes de empezar:** arranca el proyecto (`npm start`) y abre la página **Pacientes** (`/xestionPacientes`). El backend **no recarga solo**: hay que reiniciarlo tras el Paso 1.

## La idea

Borrar un paciente pierde su historial y, en tu proyecto, además deja sus citas huérfanas (lo explica [borrado en cascada](../backend/borrado-en-cascada.md)). Es más seguro **marcarlo**: un campo `activo` que vale `true` por defecto y pasa a `false` al darlo de baja.

**El detalle que importa:** los pacientes que ya están en la base de datos **no tienen ese campo**. Mongo no rellena nada hacia atrás al cambiar el esquema. Así que en la web «activo» es todo lo que **no sea `false`**, nunca `if (p.activo)`: con los antiguos eso daría `undefined`, que es falso, y saldrían todos de baja.

## Qué vas a tocar

| Fichero | Para qué |
|---|---|
| `backend/modelos/Paciente.js` | El campo `activo` |
| `src/components/XestionPacientes.vue` | La columna, el botón y la función |

## Paso 1 · El modelo

En `backend/modelos/Paciente.js`, busca la línea `lopdpac: { type: Boolean, required: true },` y pega esto **justo debajo**:

```js
    // Boolean = verdadero o falso. default: true -> si el dato no viene, se guarda activo.
    // Los pacientes que ya existian NO tienen este campo: por eso en la web
    // "activo" es todo lo que no sea false, no "lo que sea true".
    activo: { type: Boolean, default: true },
```

**Reinicia el backend.** Sin esto, Mongoose descarta el campo al guardar y nada funciona.

## Paso 2 · La función

En `src/components/XestionPacientes.vue`, busca la línea `const pacienteStore = usepacienteStore();` y pega esto **justo debajo**:

```js
// Da de baja al paciente, o lo vuelve a dar de alta.
async function alternarBaja(paciente) {
  // Si ahora esta de baja, el cambio es darlo de alta, y al reves.
  const estaDeBaja = paciente.activo === false;

  try {
    // PUT parcial por DNI: solo viaja el campo activo. modifyPaciente usa
    // findOneAndUpdate, asi que el resto de los datos se queda igual.
    await modifyPaciente(paciente.dnipac, { activo: estaDeBaja });

    // Si el paciente de baja era el seleccionado, se limpia la seleccion:
    // no tiene sentido dejarlo activo en la pantalla de citas.
    if (!estaDeBaja && String(pacienteStore.idPaciente) === String(paciente._id)) {
      pacienteStore.limpiarPaciente();
    }

    alertaExito(estaDeBaja ? "Paciente dado de alta." : "Paciente dado de baja.");
    pacientes.value = await getPacientes();
  } catch (error) {
    alertaError(mensaxeDoErro(error, "No se pudo cambiar el estado del paciente."));
  }
}
```

> `modifyPaciente`, `getPacientes`, `alertaExito`, `alertaError` y `mensaxeDoErro` ya están importados en este fichero.

## Paso 3 · La cabecera de la columna

En el `<template>`, busca la línea `<th>Provincia</th>` y pega esto **justo debajo**:

```vue
            <th>Estado</th>
```

## Paso 4 · La celda

Busca la línea `<td>{{ u.propac }}</td>` y pega esto **justo debajo**:

```vue
            <!-- Solo un false explicito significa "de baja": los pacientes
                 antiguos no tienen el campo y deben contar como activos -->
            <td class="centrado">
              <span :class="u.activo === false ? 'font-bold text-[#b3261e]' : 'text-[#2f7d55]'">
                {{ u.activo === false ? "De baixa" : "Activo" }}
              </span>
            </td>
```

El `<th>` del Paso 3 y el `<td>` de este paso van en la misma posición, entre Provincia y Accións. Si falta uno de los dos, la tabla se descuadra.

## Paso 5 · El botón

Busca la línea `{{ pacienteStore.idPaciente === u._id ? "✅" : "👤" }}` (es el emoji del botón de seleccionar). Debajo de ella hay un `</button>` que lo cierra. Pega esto **justo debajo de ese `</button>`**:

```vue
              <!-- :title y el emoji cambian segun el estado del paciente -->
              <button
                class="btn-accion"
                type="button"
                :title="u.activo === false ? 'Dar de alta' : 'Dar de baja'"
                :aria-label="u.activo === false ? 'Dar de alta' : 'Dar de baja'"
                @click="alternarBaja(u)"
              >
                {{ u.activo === false ? "🔙" : "🚪" }}
              </button>
```

Así el botón nuevo queda entre el de seleccionar y el de editar, dentro de la misma celda. No hay que tocar ningún botón de los que ya están.

## Paso 6 · Que un paciente de baja no se pueda seleccionar

En tu proyecto, la pantalla de citas **no tiene un desplegable de pacientes**: el paciente llega ya elegido desde Pinia, con el botón 👤 de esta tabla. Así que lo que hay que bloquear es ese botón.

Busca la línea `title="Seleccionar"` y pega esto **justo debajo**:

```vue
                :disabled="u.activo === false"
```

Queda dentro de ese mismo `<button>`, con los demás atributos. A partir de ahí, el botón 👤 de un paciente de baja está apagado y no se puede llevar a la pantalla de citas.

## Qué deberías ver

1. Una columna «Estado» con «Activo» en verde para todos, incluidos los que ya existían.
2. Un botón 🚪 en cada fila. Al pulsarlo, el paciente pasa a «De baixa» en rojo y el botón cambia a 🔙.
3. El botón 👤 de un paciente de baja está apagado.
4. Al darlo de alta otra vez, todo vuelve a la normalidad.
5. Sus citas anteriores siguen existiendo: no se ha borrado nada.

## Si algo falla

| Síntoma | Causa y arreglo |
|---|---|
| El estado no cambia nunca | No reiniciaste el backend: sin el campo en el esquema, Mongoose lo descarta |
| **Todos** salen «De baixa» | Escribiste `!u.activo` en vez de `u.activo === false` |
| La tabla se descuadra | Falta el `<th>` del Paso 3 o el `<td>` del Paso 4 |
| `alternarBaja is not defined` | El Paso 2 quedó dentro de otra función |
| Error 400 al guardar | Mandaste el paciente entero en vez de solo `{ activo: ... }` |
| El botón nuevo sale fuera de la celda | El Paso 5 va **dentro** del `<td class="centrado">` de acciones, tras el `</button>` de seleccionar |
| El botón 👤 sigue pulsable | El `:disabled` del Paso 6 quedó fuera de ese `<button>` |

## Conceptos que usa

| Concepto | En una línea |
|---|---|
| Esquema con `default` | Un valor por defecto cuando el dato no viene |
| Campo añadido después | Los documentos antiguos no lo tienen: hay que contemplar `undefined` |
| `PUT` parcial | Enviar solo el campo que cambia |
| `:class` y `:title` dinámicos | Atributos que se calculan según los datos de la fila |
| Baja lógica | Marcar en vez de borrar, para no perder el historial |

## Guías relacionadas

- [Borrado en cascada](../backend/borrado-en-cascada.md)
- [Aviso al borrar un paciente con citas](../alertas-y-pdf/aviso-al-borrar.md)
- [Resaltar por valor](../columnas-y-filtros/resaltar-por-valor.md)

# Filtro nuevo en un listado

El filtro por especialidad de `XestionDoctores.vue` es el modelo a seguir:

1. Guarda el valor del filtro en el store (`idFiltro`).
2. Pásalo como parámetro en la función de `src/api/` y léelo en la ruta del backend.
3. Pon el `<select>` en la vista y recarga la lista al cambiarlo.

Si el filtro solo afecta a lo que se ve, basta un `computed` que filtre la lista del store.

Para añadir un botón extra a cada fila, `<RowActions>` acepta botones en su slot (ejemplo: el PDF de una cita en `XestionCitas.vue`).

## Recetas relacionadas

- [filtro-en-cliente](../funcionalidades/listas/filtro-en-cliente.md)
- [filtro-en-backend](../funcionalidades/backend/filtro-en-backend.md)
- [buscador](../funcionalidades/listas/buscador.md)

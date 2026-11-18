# Pantalla nueva

1. Crea `src/components/MiPantalla.vue`.
2. Añade una entrada en `src/router/index.js` con `meta: { titulo, icono, menu: "principal" }`. El menú de la barra superior se genera solo a partir de ese fichero.
3. Si necesita datos, crea su función en `src/api/` y un store en `src/store/` (el más sencillo para copiar es `doctorStore.js`).

Los datos van siempre por el mismo camino: `api/` (petición HTTP) → `store/` (estado en Pinia) → vista.

## Recetas relacionadas

- [ruta-con-parametro](../funcionalidades/pantallas/ruta-con-parametro.md)
- [entidad-nueva](../funcionalidades/datos/entidad-nueva.md)

# Validación nueva

- **En la web:** atributos HTML en el `<input>` (`required`, `pattern`...) o una función como `validarDni` en la vista. El error se pinta con `:error` de `FormField` y `:aria-invalid`.
- **En el servidor:** una regla en `backend/modelos/validaciones.js` y el `match` o `validate` del campo en su modelo.

## Recetas relacionadas

- [validaciones](../funcionalidades/validacion/validaciones.md)

# Campo nuevo en un formulario

1. Añade el campo al schema en `backend/modelos/`.
2. En la vista, súmalo al objeto inicial del formulario (por ejemplo `PACIENTE_BALEIRO`) y pon su entrada: `<FormField label="..."><input v-model="datos.campo" /></FormField>`.
3. Si debe salir en la tabla y en el PDF, añade una línea a `columnas` en la vista: `{ clave, titulo, formato? }`. Con `formato` puedes traducir el valor (un id a un nombre, por ejemplo).

## Recetas relacionadas

- [campo-nuevo](../funcionalidades/datos/campo-nuevo.md)

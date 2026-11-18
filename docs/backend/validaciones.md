# Qué valida el servidor

La web ya comprueba los formularios, pero la API no se fía y repite las reglas
(`backend/modelos/validaciones.js`):

- **DNI/NIE** con formato válido y único en pacientes, **teléfono** de 9 dígitos y
  **correo** con formato de correo.
- **Fecha** `AAAA-MM-DD` que exista de verdad (no `2026-02-31`) y **hora** `HH:MM`.
- **Consentimiento** de la política de privacidad en pacientes (`lopdpac`); el formulario obliga a aceptarlo.
- **Referencias que existen**: el DNI del paciente y el doctor de una cita.
- **Doctor libre**: dos citas del mismo doctor no pueden coincidir en fecha y hora (las
  canceladas no cuentan).

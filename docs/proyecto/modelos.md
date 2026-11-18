# Modelos de datos

Los nombres de los campos siguen el esquema del profesor.

- **Paciente** (`pacientes`): `dnipac` (único), `nomepac`, `apelpac`, `movilpac` y
  `lopdpac` obligatorios; `nacipac`, `mailpac`, `dirpac`, `propac` y `munipac` (texto)
  opcionales.
- **Doctor** (`doctores`): `coledoc` (nº de colegiado, único), `nomedoc`, `apeldoc`,
  `movildoc`, `maildoc` (opcional), `espedoc` (nombre de la especialidad, texto).
- **Cita** (`citas`): `pacienteDNI` (DNI del paciente, texto) y `doctorId` (referencia),
  `fecha`, `hora`, `motivo`, `observacions`, `estado` (`pendente`, `confirmada`, `realizada`
  o `cancelada`).
- **Especialidad** (`especialidades`): `nomeesp`.
- **Provincia** y **Municipio**: `id` (código INE) y `nm` (nombre).

La API devuelve `id` en lugar de `_id`.

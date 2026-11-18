# Backend con MongoDB

## Requisitos

- Node.js y npm.
- Docker y Docker Compose (para MongoDB).

## Instalación

Desde la raíz del proyecto:

```bash
npm install
```

## El fichero `.env` ← lo primero que hay que comprobar

`backend/server.js` carga `dotenv/config` y lee **dos** variables del entorno. Están en un
fichero `.env` en la **raíz del proyecto**, al lado de `package.json`:

```env
PORT=3000
MONGO_URI=mongodb://admin:abc123@localhost:27017/bbdd?authSource=admin
```

El usuario y la clave son los que define `docker-compose.yaml`
(`MONGO_INITDB_ROOT_USERNAME` y `MONGO_INITDB_ROOT_PASSWORD`). `authSource=admin` le dice a
Mongo dónde están las credenciales, y `bbdd` es el nombre de la base de datos.

**`.env` está en el `.gitignore`**, así que **no viaja con el repositorio**. Si clonas el
proyecto en otro ordenador tienes que crearlo a mano. En el repositorio hay un `.env.example`
con el contenido de arriba: cópialo a `.env` y listo.

```bash
cp .env.example .env
```

### Si falta el `.env`

El servidor **arranca igual** y no se cae, pero:

- En la terminal sale `MONGO_URI no está configurado; las rutas de base de datos no estarán disponibles.`
- Todas las peticiones a `/api/pacientes`, `/api/doctores` y `/api/citas` responden **`503`**,
  porque el middleware `requireDatabase` corta antes de llegar al modelo.
- La web carga, el menú funciona, Servicios y Sobre nosotros se ven… y las tres pantallas de
  datos salen vacías con un aviso de error.

Es el síntoma más desconcertante del proyecto, porque parece que la base de datos está mal
cuando lo que falta es un fichero de dos líneas. Si ves `503`, mira esto antes que nada.

Las rutas `/api/municipios` y `/api/especialidades` **sí** funcionan sin `.env`: sirven dos
ficheros JSON de `backend/data/` y no pasan por `requireDatabase`. Eso te da una forma rápida
de distinguir «el backend no arranca» de «el backend arranca pero no hay base de datos»:

```
http://localhost:3000/api/especialidades   ->  funciona = el backend está vivo
http://localhost:3000/api/pacientes        ->  503      = falta Mongo o falta el .env
```

## Arranque

```bash
docker compose up -d   # MongoDB en el puerto 27017
npm start              # Vite (:5173) y el backend (:3000) a la vez
```

`npm start` usa `concurrently` para levantar las dos cosas en una sola terminal.
`npm run dev` arranca **solo** Vue: la web se ve pero ninguna lista carga.

El backend **no se recarga solo**. Si cambias algo en `backend/`, Ctrl+C y `npm start` otra
vez.

## La API

| Método y ruta | Qué hace |
|---|---|
| `GET /api/pacientes` | Todos los pacientes |
| `GET /api/pacientes/:dni` | Uno por su DNI |
| `POST /api/pacientes` | Crear |
| `PUT /api/pacientes/:dni` | Modificar |
| `DELETE /api/pacientes/:dni` | Borrar |
| `GET /api/doctores` | Todos los doctores |
| `GET /api/doctores/:especialidad` | Los de una especialidad |
| `POST /api/doctores` | Crear |
| `PUT /api/doctores/:id` | Modificar |
| `DELETE /api/doctores/:id` | Borrar |
| `GET /api/citas` | Citas, con `?pacienteDNI=` y `?doctorId=` opcionales |
| `POST /api/citas` | Crear |
| `PUT /api/citas/:id` | Modificar |
| `DELETE /api/citas/:id` | Borrar |
| `GET /api/especialidades` | Catálogo, desde un JSON |
| `GET /api/municipios` | Provincias y municipios, desde un JSON |

**El paciente se identifica por su DNI y el doctor por su `_id`.** No es un descuido: el DNI
es un identificador natural y público, y el doctor no tiene ninguno. Las citas guardan
`pacienteDNI` (texto) y `doctorId` (ObjectId), cada uno de su forma. Confundirlos da `404` o
`CastError`, y es el fallo más habitual de este proyecto.

## Las colecciones

| Colección | Modelo | Campos |
|---|---|---|
| `pacientes` | `Paciente.js` | `dnipac`, `nomepac`, `apelpac`, `nacipac`, `mailpac`, `movilpac`, `dirpac`, `propac`, `munipac`, `lopdpac` |
| `doctores` | `Doctor.js` | `nomedoc`, `apeldoc`, `coledoc`, `movildoc`, `maildoc`, `espedoc` |
| `citas` | `Cita.js` | `pacienteDNI`, `doctorId`, `fecha`, `hora`, `motivo`, `observacions`, `estado` |

Las fechas se guardan como **texto** `aaaa-mm-dd` y las horas como `hh:mm`, no como `Date`.
Es a propósito: así se ordenan y se comparan como texto, sin conversiones ni problemas de
zona horaria, y es exactamente lo que dan y esperan los `<input type="date">` y
`type="time"`.

## Ver los datos a mano

```bash
# Entrar en el contenedor
docker exec -it mongodb mongosh -u admin -p abc123 --authenticationDatabase admin

use bbdd
db.pacientes.find()
db.citas.find().sort({ fecha: 1 })
db.pacientes.countDocuments()
```

Útil para comprobar si un campo nuevo se está guardando de verdad: si en la web se ve pero
aquí no está, falta en el schema.

## Detener MongoDB

```bash
docker compose down
```

Los datos se conservan en el volumen `mongodb_data` mientras no uses `down -v`. **`down -v`
borra la base de datos**: no lo uses sin querer hacer eso.

# Jamby

Tienda editorial de zapatillas dividida en dos carpetas:

- `back/`: backend NestJS + Prisma.
- `front/`: frontend Next.js.

## Backend

Ruta: `back/`

### Instalación

```bash
cd back
npm install
```

### Variables de entorno

Crea un archivo `back/.env` basado en `back/.env.example`.

- `DATABASE_URL`: URL de conexión PostgreSQL.
- `JWT_SECRET`: clave secreta para JWT.
- `JWT_EXPIRATION`: tiempo de expiración del token (ej. `3600s`).
- `CLOUDINARY_CLOUD_NAME`: nombre de tu cuenta Cloudinary.
- `CLOUDINARY_API_KEY`: clave pública de Cloudinary.
- `CLOUDINARY_API_SECRET`: clave secreta de Cloudinary.
- `PORT`: puerto del servidor (por defecto `3000`).

### Ejecutar

```bash
cd back
npm run start:dev
```

El backend escucha en `http://localhost:3000`.

### Pruebas

```bash
cd back
npm test
```

## Frontend

Ruta: `front/`

### Instalación

```bash
cd front
npm install
```

### Ejecutar

```bash
cd front
npm run dev
```

El frontend escucha en `http://localhost:3001`.

La configuración de `front/next.config.mjs` reescribe `/api/:path*` a `http://localhost:3000/:path*`, por lo que el frontend llama al backend local.

## Notas rápidas

- El backend usa Prisma con `postgresql` definido en `back/prisma/schema.prisma`.
- Para cambiar a otro backend de base de datos, actualiza `back/prisma/schema.prisma` y `back/prisma.config.js`.
- La API de órdenes ya reserva stock dentro de una transacción atómica para evitar condiciones de carrera.

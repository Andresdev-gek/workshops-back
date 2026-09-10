# Backend — Sistema de Reservas de Talleres

Microservicio en NestJS que centraliza autenticación, catálogo de talleres y reservas con cupos limitados.

## Decisiones de dependencias

### Runtime y gestor de paquetes

| Pieza | Versión | Por qué |
|---|---|---|
| **Node.js** | **22.23.2** | Es la LTS “Jod” (penúltima LTS activa). A septiembre de 2026 Node 24 ya es la más nueva, pero Node 22 sigue en mantenimiento hasta 2027 y tiene el ecosistema Nest/Prisma completamente probado sobre ella. |
| **npm** | **10.9.8** | Viene con Node 22; no requiere configuración adicional. |

### NestJS

| Paquete | Versión | Por qué |
|---|---|---|
| `@nestjs/common` / `core` / `platform-express` / `testing` | **11.2.3** | NestJS 12 se liberó en agosto de 2026 con una migración de gran impacto (ESM obligatorio, Vitest en vez de Jest, Rspack en vez de Webpack). La rama 11 es la “penúltima” estable, con Jest/CommonJS/Express y tooling de autenticación maduro. |
| `@nestjs/cli` | **11.0.24** | Es la última versión estable del CLI compatible con Nest 11. |
| `@nestjs/jwt` | **11.0.2** | Módulo oficial de Nest para firmar y verificar JWT. |
| `@nestjs/passport` | **11.0.5** | Incluido siguiendo la guía, aunque el guard finalmente usa `JwtService` directamente. |
| `@nestjs/config` | **4.0.4** | Para cargar y validar variables de entorno de forma tipada. |

### Persistencia

| Paquete | Versión | Por qué |
|---|---|---|
| **Prisma** (`prisma` y `@prisma/client`) | **6.19.3** | Prisma 7 todavía no soporta MongoDB. Para no mezclar dos major versions, se usa la última estable de la rama 6 tanto para PostgreSQL como para MongoDB. |
| **bcrypt** | **5.1.1** | Estándar de facto para hashear contraseñas en Node. |

### Validación y tipado

| Paquete | Versión | Por qué |
|---|---|---|
| **TypeScript** | **5.9.3** | Compatible con Nest 11 y los tipos generados por Prisma. |
| **class-validator** / **class-transformer** | **0.14.4** / **0.5.1** | Usados por el `ValidationPipe` global para validar DTOs. |
| **zod** | **3.25.76** | Valida las variables de entorno al arrancar la aplicación. |

### Pruebas

| Paquete | Versión | Por qué |
|---|---|---|
| **Jest** | **29.7.0** | Es el test runner por defecto de Nest 11. |
| **ts-jest** | **29.4.12** | Permite ejecutar tests escritos en TypeScript. |

## Integración continua

El workflow está en `.github/workflows/backend-ci.yml` y se ejecuta en cada `push` y `pull_request`:

1. Checkout del código.
2. Setup de Node 22 con cache de npm.
3. `npm ci`.
4. `prisma generate` para ambos schemas (PostgreSQL y MongoDB).
5. `npm run build`.
6. `npm test`.

**¿Por qué lo hicimos así?**

- Para validar automáticamente que el código compila y los tests pasan antes de integrar cambios.
- `prisma generate` no requiere conexión a las bases de datos reales.
- Los tests elegidos (`reserve-workshop.use-case.spec.ts` y `jwt-auth.guard.spec.ts`) corren con repositorios en memoria y mocks, por lo que el CI no depende de Neon ni MongoDB Atlas.
- Así se mantiene la pipeline rápida, reproducible y gratuita (sin necesidad de levantar servicios de base de datos en cada ejecución).

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores reales:

```bash
cp .env.example .env
```

## Comandos útiles

```bash
# Instalar dependencias
npm install

# Generar clientes de Prisma
npx prisma generate --schema=prisma/postgres/schema.prisma
npx prisma generate --schema=prisma/mongodb/schema.prisma

# Sincronizar esquemas con las bases de datos
npx prisma db push --schema=prisma/postgres/schema.prisma
npx prisma db push --schema=prisma/mongodb/schema.prisma

# Cargar datos iniciales
npm run seed

# Levantar en desarrollo
npm run start:dev

# Build y producción
npm run build
npm run start:prod

# Tests
npm test
```

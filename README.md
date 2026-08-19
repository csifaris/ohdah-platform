# Ohdah Asset Management Platform

Ohdah is an Arabic RTL asset and custody management platform. The repository contains a React/Vite frontend and a NestJS/Prisma backend backed by PostgreSQL. The original HTML screens remain under `stitch_ohdah_asset_management_login` as immutable design references.

## Requirements

- Node.js 20+
- PostgreSQL 14+
- npm

## Development

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

The seeded development administrator is `admin@ohdah.local` with password `ChangeMe123!`. Change it immediately outside local development.

## Validation

```bash
npm run lint
npm run build
cd backend
npm run lint
npm test
npm run build
```

See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) and [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for implementation details.

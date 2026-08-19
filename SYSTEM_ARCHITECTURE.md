# System Architecture

## Overview

The system is a monorepo-style project with the frontend at the repository root and the backend under `backend/`.

### Frontend

- React 19 and TypeScript
- Vite build tooling
- Tailwind CSS with Arabic RTL layout
- React Router protected by `ProtectedRoute`
- Axios API client with JWT interceptor
- Feature-oriented modules under `src/features`
- Shared layouts under `src/layouts`
- API services under `src/services`
- Authentication state under `src/context/AuthContext.tsx`

### Backend

- NestJS 11
- PostgreSQL
- Prisma ORM
- JWT and Passport authentication
- Global JWT, role, and permission guards
- DTO validation with `class-validator`
- Audit logging through `AuditService`

## Request flow

The frontend stores the access token in local storage. Axios adds it as a Bearer token. NestJS validates it globally, attaches the JWT payload to the request, and then evaluates role/permission metadata before controllers execute.

Organization and user context are read from the authenticated JWT payload. `VITE_CURRENT_USER_ID` is not used.

## Database

The Prisma schema models organizations, users, roles, permissions, departments, assets, custody, maintenance, notifications, refresh tokens, and audit logs. Organization-scoped indexes are present for high-volume queries such as assets, custody, maintenance, and notifications.

## Production requirements

- Replace all example secrets.
- Use a managed PostgreSQL instance and encrypted secret storage.
- Configure HTTPS and restrictive CORS origins.
- Add refresh-token rotation and revocation endpoints.
- Add integration tests against a disposable PostgreSQL database.
- Add structured logging, metrics, backups, and migrations to CI/CD.

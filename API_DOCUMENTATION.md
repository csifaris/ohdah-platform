# API Documentation

Base URL: `/api`

All endpoints except login require `Authorization: Bearer <access-token>`.

## Authentication

`POST /auth/login`

```json
{ "email": "admin@ohdah.local", "password": "ChangeMe123!" }
```

Returns an access token and authenticated user with roles and permissions.

## Assets

- `GET /assets?organizationId=<id>&search=<text>&status=<status>`
- `GET /assets/categories?organizationId=<id>`
- `POST /assets`
- `GET /assets/:id`
- `PATCH /assets/:id`
- `PATCH /assets/:id/status`
- `DELETE /assets/:id`

Creation requires `organizationId`, `categoryId`, `assetNumber`, and `name`.

## Employees

- `GET /employees?organizationId=<id>&search=<text>&departmentId=<id>`
- `GET /employees/:id`
- `POST /employees`
- `PATCH /employees/:id`
- `DELETE /employees/:id`

## Custody

- `GET /custody/records`
- `POST /custody/records`
- `PATCH /custody/records/:id/return`
- `GET /custody/requests`
- `POST /custody/requests`
- `PATCH /custody/requests/:id/approve`
- `PATCH /custody/requests/:id/reject`

Approval and rejection derive the approver from the authenticated JWT subject.

## Maintenance

- `GET /maintenance`
- `POST /maintenance`
- `GET /maintenance/:id`
- `PATCH /maintenance/:id`

Creation accepts `assetId`, `issue`, optional `requestedById`, `priority`, `technician`, and `cost`. Status defaults to `OPEN`.

## Notifications

- `GET /notifications?recipientId=<user-id>&unreadOnly=true`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all/:recipientId`

## Reports

- `GET /reports/summary?organizationId=<id>`
- `GET /reports/maintenance?organizationId=<id>`

## Administration

- `GET /users`
- `GET /roles`
- `GET /permissions`

These administration endpoints require an admin role. Validation failures return HTTP 400 with a message array. Authentication failures return HTTP 401; authorization failures return HTTP 403.

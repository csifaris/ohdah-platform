# API Documentation

Base URL: `/api`

All endpoints except `@Public()` routes (`/auth/login`, `/auth/register`, `/auth/refresh`) require `Authorization: Bearer <access-token>`.
The verified JWT token establishes the caller's identity, role, and organization boundary (`organizationId`). Client-supplied tenant IDs are ignored.

## Authentication

### `POST /auth/login` (Public, Rate-Limited: 10/min)
Authenticate user credentials and receive an access token and refresh token.
```json
{
  "email": "user@organization.local",
  "password": "<your-password>"
}
```
**Response (200):**
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "4a7f...",
  "user": {
    "id": "<user-uuid>",
    "name": "User Name",
    "email": "user@organization.local",
    "organizationId": "<org-uuid>",
    "roles": ["ADMIN"],
    "permissions": ["assets:read", "assets:write"]
  }
}
```

### `POST /auth/register` (Public, Rate-Limited: 10/min)
Register a new employee user account within an organization.
```json
{
  "fullName": "Name",
  "email": "name@organization.local",
  "phone": "0501234567",
  "password": "StrongPassword123!",
  "department": "IT",
  "jobTitle": "Engineer",
  "organizationId": "<organization-uuid>"
}
```

### `POST /auth/refresh` (Public, Rate-Limited: 30/min)
Rotate an active refresh token and obtain a new access token.
```json
{
  "refreshToken": "4a7f..."
}
```

### `POST /auth/logout` (Authenticated)
Revoke the caller's refresh token(s) and terminate active session.
```json
{
  "refreshToken": "4a7f..."
}
```

---

## Assets (Tenant-Isolated)

- `GET /assets?search=<text>&status=<status>&category=<name>`: `ADMIN`, `ASSET_MANAGER`, `EMPLOYEE`
- `GET /assets/categories`: `ADMIN`, `ASSET_MANAGER`, `EMPLOYEE`
- `GET /assets/:id`: `ADMIN`, `ASSET_MANAGER`, `EMPLOYEE`
- `POST /assets`: `ADMIN`, `ASSET_MANAGER`
- `POST /assets/categories`: `ADMIN`, `ASSET_MANAGER`
- `PATCH /assets/:id`: `ADMIN`, `ASSET_MANAGER`
- `PATCH /assets/:id/status`: `ADMIN`, `ASSET_MANAGER`
- `DELETE /assets/:id`: `ADMIN`, `ASSET_MANAGER` (Blocked if active custody exists)

---

## Employees (Tenant-Isolated)

- `GET /employees/me`: `ADMIN`, `ASSET_MANAGER`, `EMPLOYEE` (Returns authenticated user's employee profile)
- `GET /employees?search=<text>&departmentId=<id>`: `ADMIN`, `ASSET_MANAGER`
- `GET /employees/:id`: `ADMIN`, `ASSET_MANAGER`
- `POST /employees`: `ADMIN`, `ASSET_MANAGER`
- `PATCH /employees/:id`: `ADMIN`, `ASSET_MANAGER`
- `DELETE /employees/:id`: `ADMIN` (Blocked if active custody exists)

---

## Custody (Tenant-Isolated & Ownership-Enforced)

### General & Employee Routes
- `GET /custody/records?status=<status>`:
  - If `EMPLOYEE`: Returns only the employee's own assigned custody records.
  - If `ADMIN` / `ASSET_MANAGER`: Returns all organization records.
- `GET /custody/records/:id`: Returns custody record (ownership verified for employees).
- `POST /custody/records`: `ADMIN`, `ASSET_MANAGER` (Assigns asset to employee).
- `PATCH /custody/records/:id/return`: `ADMIN`, `ASSET_MANAGER` (Returns custody, restores asset status).
- `GET /custody/requests?status=<status>`:
  - If `EMPLOYEE`: Returns only requests submitted by caller.
  - If `ADMIN` / `ASSET_MANAGER`: Returns all organization requests.
- `GET /custody/requests/:id`: Returns custody request (ownership verified for employees).
- `POST /custody/requests`: Any authenticated employee (Automatically assigns caller as requester).
- `PATCH /custody/requests/:id/reply`: Requester only (Submits employee notes/reply).
- `DELETE /custody/requests/:id`: Requester only (Allowed only while status is `PENDING`).

### Administrative Custody Operations
- `PATCH /custody/requests/:id/approve`: `ADMIN`, `ASSET_MANAGER`
- `PATCH /custody/requests/:id/reject`: `ADMIN`, `ASSET_MANAGER`
- `GET /custody/admin/requests`: `ADMIN`, `ASSET_MANAGER`
- `PATCH /custody/admin/requests/:id/assign`: `ADMIN`, `ASSET_MANAGER`

---

## Maintenance (Tenant-Isolated)

- `GET /maintenance?status=<status>`:
  - If `EMPLOYEE`: Returns maintenance requests submitted by caller.
  - If `ADMIN` / `ASSET_MANAGER`: Returns all organization maintenance requests.
- `GET /maintenance/:id`: Returns maintenance request (ownership verified for employees).
- `POST /maintenance`: Any authenticated employee (Sets status `OPEN`).
- `PATCH /maintenance/:id`: `ADMIN`, `ASSET_MANAGER` (Updates technician, cost, status. Properly restores asset to `ACTIVE` if active custody exists, or `AVAILABLE` if inventory).
- `DELETE /maintenance/:id`: `ADMIN`, `ASSET_MANAGER` (Allowed only while status is `OPEN`).

---

## Notifications (Tenant-Isolated & Recipient-Enforced)

- `GET /notifications?unreadOnly=true`: Returns caller's notifications.
- `PATCH /notifications/:id/read`: Marks caller's notification as read.
- `PATCH /notifications/read-all`: Marks all caller's notifications as read.
- `POST /notifications`: `ADMIN` only (Internal notification generation).

---

## Reports & Administration (Tenant-Isolated)

- `GET /reports/summary`: `ADMIN`, `ASSET_MANAGER`
- `GET /reports/maintenance`: `ADMIN`, `ASSET_MANAGER`
- `GET /users`: `ADMIN`
- `GET /users/:id`: `ADMIN`
- `POST /users`: `ADMIN`
- `PATCH /users/:id`: `ADMIN`
- `PATCH /users/:id/status`: `ADMIN`
- `DELETE /users/:id`: `ADMIN` (Performs safe soft-deactivation).
- `GET /roles`: `ADMIN`
- `POST /roles`: `ADMIN`
- `PATCH /roles/:id`: `ADMIN`
- `PATCH /roles/:id/permissions`: `ADMIN`
- `DELETE /roles/:id`: `ADMIN`
- `GET /permissions`: `ADMIN`
- `GET /permissions/matrix`: `ADMIN`
- `GET /audit-logs`: `ADMIN`

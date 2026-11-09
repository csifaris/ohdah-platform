# Ohdah Asset Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/Ohdah-Asset%20Management-0B1F3A?style=for-the-badge" alt="Ohdah Platform">
  <img src="https://img.shields.io/badge/RTL-Arabic%20Platform-D4AF37?style=for-the-badge" alt="RTL">
  <img src="https://img.shields.io/badge/Full%20Stack-React%2019%20%2B%20NestJS%2011-61DAFB?style=for-the-badge" alt="Full Stack">
  <img src="https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-14%2B-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL">
</p>

---

Ohdah is a web-based platform designed to help organizations manage their assets and employee custody records.

The platform provides a centralized system for tracking assets, managing custody requests, handling maintenance reports, and monitoring asset operations through an organized workflow.

It helps organizations improve asset tracking, reduce manual work, and maintain clear records of asset assignments and returns.

---

## 🎯 Project Overview

The main problem addressed by Ohdah is the difficulty of managing organizational assets and tracking their assignment to employees using manual processes.

Ohdah provides a centralized platform where organizations can register assets, assign them to employees, manage return requests, and follow up on maintenance operations.

The system also supports multiple organizations, with separate data and access permissions for each organization.

---

## 👥 User Roles

### Employee

- View available assets.
- Submit new custody requests.
- View assigned assets.
- Track custody request status.
- Submit asset return requests.
- Report damaged assets and request maintenance.
- Receive notifications about request updates.

### Asset Manager

- Manage assets and asset categories.
- Review custody requests.
- Approve or reject custody requests.
- Assign assets to employees.
- Manage asset returns.
- Review and manage maintenance requests.
- View asset and maintenance reports.

### System Administrator

- Manage user accounts and employee records.
- Manage departments.
- Manage roles and permissions.
- Monitor system audit logs.
- Manage organization settings.

---

## 🔄 Custody Workflow

The platform organizes the custody process from the initial request to the return of the asset.

```text
Employee
    ↓
Submit Custody Request
    ↓
Asset Manager Review
    ↓
Approval / Rejection
    ↓
Asset Assignment
    ↓
Employee Uses Asset
    ↓
Return Request
    ↓
Asset Inspection
    ↓
Asset Returned
```

---

## 🔧 Maintenance Workflow

Ohdah allows employees and asset managers to report and manage asset maintenance requests.

```text
Maintenance Request
        ↓
Request Review
        ↓
Maintenance In Progress
        ↓
Maintenance Completed
        ↓
Asset Status Updated
```

---

## ⭐ Main Features

- Asset inventory management.
- Asset category management.
- Employee management.
- Custody request management.
- Asset assignment and return tracking.
- Maintenance request management.
- User roles and permissions.
- Multi-organization support.
- Notifications and request updates.
- Asset and maintenance reports.
- Audit logs for important operations.
- Arabic user interface with RTL support.

---

## 🔐 Security Features

Ohdah includes several security mechanisms to protect user accounts and organizational data.

- JWT-based authentication.
- Refresh Token Rotation.
- Refresh Token Replay Detection.
- Token Versioning for session invalidation.
- Multi-Tenant Data Isolation.
- Role-Based Access Control (RBAC).
- Permission-based route protection.
- Rate Limiting for authentication endpoints.
- Cross-tab session synchronization using Web Locks API.
- Security headers and CORS configuration.


---

## 🛠️ Technologies

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Node.js
- NestJS 11
- PostgreSQL
- Prisma ORM
- JWT
- Passport.js
- Axios

---

## 📂 Project Structure

```text
ohdah/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── features/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   └── types/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── auth/
│   │   ├── custody/
│   │   ├── employees/
│   │   ├── maintenance/
│   │   ├── notifications/
│   │   ├── reports/
│   │   ├── users/
│   │   └── prisma/
│   │
│   ├── test/
│   ├── package.json
│   └── .env.example
│
├── API_DOCUMENTATION.md
├── SYSTEM_ARCHITECTURE.md
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js 20 or later.
- npm.
- PostgreSQL 14 or later.
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/csifaris/ohdah-platform.git
```

### 2. Open the Project

```bash
cd ohdah-platform
```

### 3. Install Dependencies

Install the frontend dependencies from the project root:

```bash
npm install
```

Install the backend dependencies:

```bash
cd backend
npm install
```

Return to the project root:

```bash
cd ..
```

### 4. Configure Environment Variables

Create the frontend environment file from the project root.

**Windows:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Create the backend environment file from the backend directory:

```bash
cd backend
```

**Windows:**

```powershell
Copy-Item .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Update the backend `.env` file with your PostgreSQL connection details and JWT secrets.

Example:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ohdah?schema=public"
JWT_ACCESS_SECRET="YOUR_ACCESS_SECRET"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="YOUR_REFRESH_SECRET"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

Never commit real passwords, secrets, or environment files to GitHub.

### 5. Set Up the Database

Make sure PostgreSQL is running.

Run the following commands from the `backend` directory:

```bash
npm run prisma:generate
npm run prisma:validate
npm run prisma:migrate
npm run prisma:seed
```

The seed script is intended for development environments and is protected against execution in production.

### 6. Run the Project

Return to the project root:

```bash
cd ..
```

Start the frontend and backend together:

```bash
npm run dev
```

Or run them separately.

**Frontend:**

```bash
npm run dev:frontend
```

**Backend:**

```bash
npm run dev:backend
```

The application will be available at:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3000
```

---

## 🧪 Testing

### Backend

Run the following commands from the `backend` directory:

```bash
npm run lint
npm test
npm run build
```

Validate the Prisma schema:

```bash
npm run prisma:validate
```

### Frontend

Run the following commands from the project root:

```bash
npm run lint
npm run build
```


---

## 🗄️ Database

Ohdah uses PostgreSQL as its relational database and Prisma ORM for database access and schema management.

The database includes models for:

- Organizations.
- Users and roles.
- Employees and departments.
- Assets and categories.
- Custody records and requests.
- Maintenance requests.
- Notifications.
- Refresh tokens.
- Audit logs.

Each organization's data is scoped to its authenticated organization context.

---

## 🎓 Academic Affiliation

This project was developed as part of the **Vibe Coding Course** at **SDAIA Academy**.

<p align="center">
  <a href="https://github.com/SDAIAAcademy">
    <img src="https://img.shields.io/badge/SDAIA%20Academy-GitHub-181717?style=for-the-badge&logo=github" alt="SDAIA Academy">
  </a>
</p>

---

## 👨‍💻 Project Team

### 1. FARIS ALMUSHRAFI

<p align="center">
  <a href="https://github.com/csifaris">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Faris GitHub">
  </a>
</p>

---

### 2. Khalid Saleh

<p align="center">
  <a href="https://github.com/khaledsaleh1424-sudo">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Khalid GitHub">
  </a>
</p>

---

### 3. Salman Alhammad

<p align="center">
  <a href="https://github.com/engalhammad">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Salman GitHub">
  </a>
</p>

---

### 4. Rana Alzhrani

<p align="center">
  <a href="https://github.com/RiixR1">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Rana GitHub">
  </a>
</p>

---

### 5. Rand Alanazi

<p align="center">
  <a href="https://github.com/nra27158-ship-it">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Rand GitHub">
  </a>
</p>

---

### 6. Raeed Alharbi

<p align="center">
  <a href="https://github.com/RaeedAlharbi">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Raeed GitHub">
  </a>
</p>

---

### 7. Afaf AlMutairi

<p align="center">
  <a href="https://github.com/Afafbader999">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Afaf GitHub">
  </a>
</p>

---

<p align="center">
  <strong>Ohdah – Asset & Custody Management Platform</strong>
</p>

# Ohdah Asset Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/Ohdah-Asset%20Management-0B1F3A?style=for-the-badge" alt="Ohdah Platform">
  <img src="https://img.shields.io/badge/RTL-Arabic%20Platform-D4AF37?style=for-the-badge" alt="RTL">
  <img src="https://img.shields.io/badge/Full%20Stack-React%20%2B%20NestJS-61DAFB?style=for-the-badge" alt="Full Stack">
</p>

---

## 📌 Project Overview

**Ohdah** is an enterprise asset and custody management platform designed to simplify the management of organizational assets, employee custody records, requests, approvals, and tracking processes.

The platform provides a centralized system for managing:

- Assets inventory.
- Employee custody assignments.
- Asset requests and approvals.
- Asset return processes.
- User roles and permissions.
- Maintenance management.
- Notifications.
- Reports and analytics.

The system is built with a modern full-stack architecture using:

- React + Vite for the frontend.
- NestJS for the backend.
- Prisma ORM.
- PostgreSQL database.
- TypeScript.
- Tailwind CSS.
- RTL Arabic-first user experience.

---

# 🎯 Project Objectives

The main goals of Ohdah Platform are:

- Digitize asset custody workflows.
- Reduce manual tracking of organizational assets.
- Improve accountability between employees and asset managers.
- Provide role-based access control.
- Maintain clear history of asset movements.
- Improve operational efficiency.

---

# 👥 System Users & Roles

## 1. Employee

Employees can:

- Browse available assets.
- Submit custody requests.
- Track request status.
- Receive assigned assets.
- Confirm asset receipt.
- Request asset returns.
- View notifications.

---

## 2. Asset Manager / IT Administrator

Asset managers can:

- Manage assets inventory.
- Add and update assets.
- Review custody requests.
- Approve or reject requests.
- Assign assets to employees.
- Manage returns.
- Track asset status.

---

## 3. System Administrator

Administrators can:

- Manage users.
- Manage roles.
- Manage permissions.
- Configure system settings.
- Monitor platform operations.

---

# 🏗️ System Architecture

The project follows a full-stack architecture:

```
Ohdah Platform

Frontend
│
├── React
├── Vite
├── TypeScript
├── Tailwind CSS
└── RTL Arabic UI


Backend
│
├── NestJS
├── Prisma ORM
├── PostgreSQL
└── REST API
```

---

# 📂 Project Structure

```
ohdah-platform/

├── frontend/
│   ├── React Application
│   ├── Components
│   ├── Pages
│   └── Services

├── backend/
│   ├── NestJS Application
│   ├── Modules
│   ├── Controllers
│   ├── Services
│   └── Prisma

├── README.md
├── API_DOCUMENTATION.md
└── SYSTEM_ARCHITECTURE.md
```

---

# ⚙️ Requirements

Before running the project, install:

- Node.js 20+
- PostgreSQL 14+
- npm

---

# 🚀 Installation & Running

## Clone Repository

```bash
git clone https://github.com/csifaris/ohdah-platform.git

cd ohdah-platform
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend will start using Vite development server.

---

# Backend Setup

```bash
cd backend

npm install

npm run prisma:generate

npm run prisma:migrate

npm run prisma:seed

npm run start:dev
```

---

# 🔐 Default Administrator Account

Development administrator:

```
Email:
admin@ohdah.local

Password:
ChangeMe123!
```

⚠️ Change the password immediately outside local development environments.

---

# 🧪 Validation & Testing

Frontend:

```bash
npm run lint

npm run build
```

Backend:

```bash
npm run lint

npm test

npm run build
```

---

# ✨ Main Features

## Asset Management

- Create assets.
- Update assets.
- Track asset status.
- Manage categories.
- Maintain asset information.

## Custody Management

- Create custody requests.
- Approve and reject requests.
- Assign assets.
- Track custody lifecycle.
- Handle asset returns.

## User Management

- User accounts.
- Roles.
- Permissions.
- Access control.

## Notifications

- User notifications.
- Read/unread status.
- System updates.

## Maintenance

- Maintenance requests.
- Maintenance tracking.
- Status management.

---

# 🎨 UI / UX Features

- Arabic RTL interface.
- Enterprise dashboard design.
- Navy and gold branding.
- Responsive layout.
- Role-based navigation.
- Modern component-based UI.

---

# 📚 Documentation

Additional documentation:

- `SYSTEM_ARCHITECTURE.md`
- `API_DOCUMENTATION.md`

---

# 🔒 Security

The platform includes:

- Authentication system.
- JWT-based authorization.
- Role-based permissions.
- Protected API routes.

---

# 🎓 Academic Affiliation

This project was developed as part of the **Vibe Coding Course** at **SDAIA Academy**.

<p align="center">
  <a href="https://github.com/SDAIAAcademy">
    <img src="https://img.shields.io/badge/SDAIA%20Academy-GitHub-181717?style=for-the-badge&logo=github" alt="SDAIA Academy on GitHub">
  </a>
</p>

---

# 👨‍💻 Project Team

## 1. FARIS ALMUSHRAFI

<p align="center">
  <a href="https://github.com/csifaris">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 1 GitHub">
  </a>
</p>

---

## 2. Khalid saleh

<p align="center">
  <a href="https://github.com/khaledsaleh1424-sudo">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 2 GitHub">
  </a>
</p>

---

## 3. Salman Alhammad

<p align="center">
  <a href="https://github.com/engalhammad">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 3 GitHub">
  </a>
</p>

---

## 4. Rana Alzhrani

<p align="center">
  <a href="https://github.com/RiixR1">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 4 GitHub">
  </a>
</p>

---

## 5. Rand Alanazi

<p align="center">
  <a href="https://github.com/nra27158-ship-it">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 5 GitHub">
  </a>
</p>

---

## 6. Raeed Alharbi

<p align="center">
  <a href="https://github.com/RaeedAlharbi">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 6 GitHub">
  </a>
</p>

---

## 7. Afaf AlMutairi

<p align="center">
  <a href="https://github.com/Afafbader999">
    <img src="https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github" alt="Team Member 7 GitHub">
  </a>
</p>

---

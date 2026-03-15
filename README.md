# Ethiopian Fertilizer Digital Tracking & Management System - Backend

Production-ready backend API using Node.js, Express, and PostgreSQL, written in TypeScript.

## Features
- Hierarchical Admin (Region, Zone, Woreda, Kebele)
- JWT Authentication & Role-based Access Control
- Kebele Staff Dashboard
- Fertilizer Demand Tracking

## Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL (v14+)
- **Auth**: JWT & Bcrypt

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- PostgreSQL installed and running

### 2. Database Setup
Create a database named `fertilizer_tracking` and run the schema file:
```bash
psql -U postgres -d fertilizer_tracking -f src/schemas/schema.sql
```

### 3. Installation
```bash
npm install
```

### 4. Environment Variables
Copy `.env.example` to `.env` and fill in your database credentials and JWT secret.
```bash
cp .env.example .env
```

### 5. Running the Application
**Development mode:**
```bash
npm run dev
```

**Build and Start:**
```bash
npm run build
npm start
```

## API Documentation

### Authentication
- **POST** `/api/auth/login`
  - Body: `{ "phone": "0912345678", "password": "password123" }`
  - Returns: JWT token and user profile.

### Kebele Dashboard
- **GET** `/api/kebele/dashboard`
  - Headers: `Authorization: Bearer <token>`
  - Query (Optional): `?season=2017/18`
  - Returns: Farmer demand summary for the logged-in Kebele.

### Farmer Demand Management
- **GET** `/api/demands`
  - Headers: `Authorization: Bearer <token>`
  - Query: `?status=Pending&search=Girma&page=1&limit=10`
  - Returns: Paginated list of demands based on user's hierarchy.
- **POST** `/api/demands`
  - Body: `{ "farmer_id": 1, "demand_year": "2017/18", "season_meher": true, "fert_type_id": 1, "amount_needed_qt": 20.5 }`
  - Restricted to Kebele/Woreda staff.
- **PATCH** `/api/demands/:id/status`
  - Body: `{ "status": "Approved" }`
  - Restricted to Woreda and higher roles.

### Farmer Information Management
- **GET** `/api/farmers`
  - Headers: `Authorization: Bearer <token>`
  - Query: `?search=Girma&page=1&limit=10`
  - Returns: Paginated list of farmers with full profile and location details.
- **POST** `/api/farmers`
  - Body: `{ "unique_farmer_id": "F001", "full_name": "...", "gender": "Male", "kebele_id": 1, ... }`
  - Creates a new farmer profile.
- **PUT** `/api/farmers/:id`
  - Updates an existing farmer profile.
- **DELETE** `/api/farmers/:id`
  - Deletes a farmer profile.

## Test User
- **Phone**: `0912345678`
- **Password**: `password123`
- **Role**: Kebele (Development Agent)

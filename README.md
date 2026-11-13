 💊 PharmaWise – Smart Pharmacy Inventory Management System

PharmaWise is a web-based pharmacy inventory management system designed to simplify medicine stock management, batch tracking, and expiry monitoring.

It helps pharmacies maintain accurate inventory records, reduce medicine wastage, and manage stock efficiently using the **FEFO (First Expiry, First Out)** approach.

*Features

1. User Authentication
- User registration and login.
- JWT-based authentication.
- Password encryption using BCrypt.
- Separate inventory for each user.

2. Medicine Management
- Add new medicines.
- View available medicines.
- Update medicine details.
- Delete medicines.
- Track medicine quantities and prices.

3. Batch Management
- Add medicine batches.
- Store batch numbers.
- Track manufacturing and expiry dates.
- Maintain batch-wise stock quantities.

4. FEFO Stock Management
- Deduct stock automatically from the batch with the earliest expiry date.
- Maintain accurate medicine-level stock quantities.
- Help minimize expired medicine wastage.

5. Smart Alerts
- Low-stock alerts.
- Near-expiry alerts.
- Expired medicine alerts.

6. Dashboard
- Total medicines.
- Total stock.
- Low-stock count.
- Near-expiry count.
- Expired batch count.

*Tech Stack
| Next.js - Frontend |
| React - UI development |
| Tailwind CSS - Styling |
| Java - Backend programming |
| Spring Boot - REST API development |
| Spring Security - Authentication and security |
| JWT - Token-based authentication |
| PostgreSQL - Database |
| Hibernate / JPA - Database operations |
| Maven - Backend dependency management |
| Postman - API testing |
| Git & GitHub - Version control |

# Project Structure


PharmaWise/
│
├── backend/
│   └── pharmawise-backend/
│       ├── src/
│       │   └── main/
│       │       ├── java/com/pharmawise/
│       │       └── resources/
│       └── pom.xml
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── login/
│   │       ├── register/
│   │       └── page.tsx
│   ├── public/
│   └── package.json
│
├── postman/
└── README.md
```

*Installation and Setup

#Prerequisites

Install the following:
- Node.js and npm
- Java JDK
- Maven
- PostgreSQL
- Git
1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd PharmaWise


2. Backend Setup

Navigate to the backend directory:

```bash
cd backend/pharmawise-backend


Configure your PostgreSQL database and create a database named:

```sql
CREATE DATABASE pharmawise;
```

Configure your local database credentials and JWT secret in the appropriate Spring Boot configuration.

Start the backend:

```bash
mvn spring-boot:run
```

Backend runs at:

```text
http://localhost:8080
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```
🔗 Main API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | User login |
| GET | `/api/medicines` | Get medicines |
| POST | `/api/medicines` | Add medicine |
| PUT | `/api/medicines/{id}` | Update medicine |
| DELETE | `/api/medicines/{id}` | Delete medicine |
| GET | `/api/batches` | Get batches |
| POST | `/api/batches` | Add batch |
| POST | `/api/stock/deduct/{medicineId}` | Deduct stock using FEFO |
| GET | `/api/alerts/low-stock` | Low-stock alerts |
| GET | `/api/alerts/near-expiry` | Near-expiry alerts |
| GET | `/api/alerts/expired` | Expired batch alerts |
| GET | `/api/dashboard/summary` | Dashboard summary |

Protected endpoints require a valid JWT access token.

# Security

- JWT-based authentication.
- Password hashing using BCrypt.
- Spring Security for endpoint protection.
- User-specific inventory ownership.
- Authenticated access to protected APIs.

# Project Objective

The main objective of PharmaWise is to make pharmacy inventory management more efficient by combining medicine management, batch-level tracking, expiry monitoring, and automated FEFO stock deduction in one application.

**PharmaWise – Smart Pharmacy Inventory Management System**

Built as a full-stack project using Next.js, Java Spring Boot, and PostgreSQL.

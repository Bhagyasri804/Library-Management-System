# Library Management System

A full-stack Library Management System built with Spring Boot, Java 21, MySQL, and React (Vite).

---

## 1. Authentication Architecture

The backend implements stateless JWT (JSON Web Token) authentication and role-based access control (RBAC) powered by **Spring Security**:

1. **User Identity & Roles**:
   - `ADMIN`: System administration, user management, global oversight.
   - `LIBRARIAN`: Catalog operations, book issue/return, fines, and student management.
   - `STUDENT`: Book search, reservations, borrowing history, profile view.

2. **Stateless Security Pipeline**:
   - **`JwtAuthenticationFilter`**: Intercepts incoming HTTP requests, extracts the Bearer token from the `Authorization` header, validates signature and expiration using JJWT, and populates the `SecurityContextHolder`.
   - **`SecurityConfig`**: Enforces URL-level authorization rules:
     - `/api/auth/register`, `/api/auth/login`, `/api/health`: Public access.
     - `/api/admin/**`: Requires `ROLE_ADMIN`.
     - `/api/librarian/**`: Requires `ROLE_LIBRARIAN`.
     - `/api/student/**`: Requires `ROLE_STUDENT`.
     - All other endpoints require full authentication.
   - **`JwtAuthenticationEntryPoint`**: Returns structured HTTP 401 Unauthorized JSON responses for unauthenticated requests to protected endpoints.
   - **`JwtAccessDeniedHandler`**: Returns structured HTTP 403 Forbidden JSON responses when an authenticated user lacks the required role.
   - **Password Security**: Passwords are encrypted with `BCryptPasswordEncoder` (never stored or returned in plaintext or hash).
   - **Public Registration Protection**: Public registration (`/api/auth/register`) strictly registers users with the `STUDENT` role. Privileged roles (`ADMIN`, `LIBRARIAN`) cannot be claimed via public registration.

---

## 2. Environment Variables

All sensitive values and environment-specific parameters are injected through environment variables without hardcoded secrets:

| Variable | Description | Default (Local Dev) |
|---|---|---|
| `DB_HOST` | MySQL database host | `localhost` |
| `DB_PORT` | MySQL database port | `3306` |
| `DB_NAME` | Database schema name | `library_db` |
| `DB_USERNAME` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | *(blank)* |
| `JWT_SECRET` | HMAC-SHA256 signing secret key (minimum 32 bytes) | Safe dev fallback |
| `JWT_EXPIRATION_MS` | JWT token validity in milliseconds | `86400000` (24 hours) |
| `ADMIN_EMAIL` | Initial administrator email | `admin@library.com` |
| `ADMIN_PASSWORD` | Initial administrator password | `Admin@123` |
| `ADMIN_FULL_NAME` | Initial administrator name | `System Administrator` |
| `ADMIN_PHONE` | Initial administrator phone | `1234567890` |

---

## 3. How to Create the First ADMIN Account

To prevent privilege escalation, the application does not allow registering as an ADMIN via the public registration endpoint.

Instead, the backend uses `AdminInitializer` (`CommandLineRunner`):
1. On application startup, it checks if any user with `ROLE_ADMIN` exists in `library_db`.
2. If no admin exists, it automatically seeds the initial administrator account using `ADMIN_EMAIL` and `ADMIN_PASSWORD` (or the default `admin@library.com` / `Admin@123`).
3. If an admin account already exists, it is untouched.

To customize the initial admin credentials prior to first boot, set the environment variables:
```bash
export ADMIN_EMAIL="superadmin@yourdomain.com"
export ADMIN_PASSWORD="YourStrongPassword@2026"
```

---

## 4. API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend and database health status |
| `POST` | `/api/auth/register` | Register a new Student account |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token |

### Authenticated Endpoints (All Roles)
| Method | Endpoint | Description | Headers |
|---|---|---|---|
| `GET` | `/api/auth/me` | Fetch authenticated user profile | `Authorization: Bearer <token>` |
| `POST` | `/api/auth/logout` | Client logout acknowledgement | `Authorization: Bearer <token>` |

### Role-Protected Dashboards & Admin Features
| Method | Endpoint | Required Role | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | `ROLE_ADMIN` | Admin summary and modules |
| `GET` | `/api/admin/stats` | `ROLE_ADMIN` | Stats: Total books, students, librarians, available/issued copies |
| `GET` | `/api/admin/books` | `ROLE_ADMIN` | View & search all books |
| `POST` | `/api/admin/books` | `ROLE_ADMIN` | Add a new book |
| `PUT` | `/api/admin/books/{id}` | `ROLE_ADMIN` | Edit book details & copies |
| `DELETE` | `/api/admin/books/{id}` | `ROLE_ADMIN` | Delete book |
| `GET` | `/api/admin/categories` | `ROLE_ADMIN` | View all categories |
| `POST` | `/api/admin/categories` | `ROLE_ADMIN` | Add a new category |
| `PUT` | `/api/admin/categories/{id}` | `ROLE_ADMIN` | Edit category |
| `DELETE` | `/api/admin/categories/{id}` | `ROLE_ADMIN` | Delete category |
| `GET` | `/api/admin/users` | `ROLE_ADMIN` | List all users (filter `?role=STUDENT` or `?role=LIBRARIAN`) |
| `POST` | `/api/admin/librarians` | `ROLE_ADMIN` | Register a new Librarian account |
| `PATCH` | `/api/admin/users/{id}/status` | `ROLE_ADMIN` | Activate or deactivate user |
| `GET` | `/api/librarian/dashboard` | `ROLE_LIBRARIAN`, `ROLE_ADMIN` | Librarian summary and modules |
| `GET` | `/api/librarian/stats` | `ROLE_LIBRARIAN`, `ROLE_ADMIN` | Stats: Total books, available books, issued books, students |
| `GET` | `/api/librarian/students` | `ROLE_LIBRARIAN`, `ROLE_ADMIN` | View & search registered students |
| `POST` | `/api/librarian/students` | `ROLE_LIBRARIAN`, `ROLE_ADMIN` | Register a new student |
| `GET` | `/api/librarian/books` | `ROLE_LIBRARIAN`, `ROLE_ADMIN` | View & search books catalog with availability check |
| `POST` | `/api/librarian/issue` | `ROLE_LIBRARIAN`, `ROLE_ADMIN` | Issue book to student with due date (auto decrements copies) |
| `GET` | `/api/librarian/issued-books` | `ROLE_LIBRARIAN`, `ROLE_ADMIN` | View & search currently issued books with overdue & fine status |
| `POST` | `/api/librarian/return/{id}` | `ROLE_LIBRARIAN`, `ROLE_ADMIN` | Return book, restore copies, compute overdue fines |
| `GET` | `/api/student/dashboard` | `ROLE_STUDENT` | Student dashboard overview (borrowed, available, overdue, fines, reservations) |
| `GET` | `/api/student/books` | `ROLE_STUDENT` | Browse catalog with live availability status |
| `GET` | `/api/student/borrowed-books` | `ROLE_STUDENT` | View student loan history, due dates and overdue status |
| `GET` | `/api/student/reservations` | `ROLE_STUDENT` | View student reservations |
| `POST` | `/api/student/reservations/{bookId}` | `ROLE_STUDENT` | Reserve unavailable book (fails if copies available or already reserved) |
| `DELETE` | `/api/student/reservations/{id}` | `ROLE_STUDENT` | Cancel own active reservation |
| `GET` | `/api/student/fines` | `ROLE_STUDENT` | View itemized fines, overdue penalties, and settlement notes |
| `GET` | `/api/student/profile` | `ROLE_STUDENT` | View personal profile information |
| `PUT` | `/api/student/profile` | `ROLE_STUDENT` | Update student name and phone number |

---

## 5. How to Run the Project

### 1. Backend (Spring Boot)
```bash
cd backend
mvn clean package
java -jar target/library-management-system-0.0.1-SNAPSHOT.jar
```
Runs at `http://localhost:8080`.

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173` with automatic API proxying to port 8080.
Production build:
```bash
npm run build
```
```

The application will start at `http://localhost:8080`.

---

## 6. Example Requests & Responses

### 1. Register a Student
**Request:**
```http
POST /api/auth/register HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "fullName": "Alice Smith",
  "email": "alice@student.com",
  "password": "Password123!",
  "phoneNumber": "9876543210"
}
```

**Response (`201 Created`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "user": {
    "id": 2,
    "fullName": "Alice Smith",
    "email": "alice@student.com",
    "phoneNumber": "9876543210",
    "role": "STUDENT",
    "active": true,
    "createdAt": "2026-11-06T12:03:19"
  }
}
```

### 2. Login
**Request:**
```http
POST /api/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "admin@library.com",
  "password": "Admin@123"
}
```

**Response (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "user": {
    "id": 1,
    "fullName": "System Administrator",
    "email": "admin@library.com",
    "phoneNumber": "1234567890",
    "role": "ADMIN",
    "active": true,
    "createdAt": "2026-11-06T12:03:19"
  }
}
```

### 3. Access Protected Endpoint
**Request:**
```http
GET /api/admin/dashboard HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**Response (`200 OK`):**
```json
{
  "role": "ADMIN",
  "status": "ACTIVE",
  "message": "Welcome to the Admin Dashboard",
  "modules": [
    "books", "categories", "authors", "users",
    "librarians", "students", "inventory", "reports", "audit-logs"
  ]
}
```

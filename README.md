# Student Placement Tracker — RESTful API

[![Node.js](https://img.shields.io/badge/Node.js-v24+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21+-blue.svg)](https://expressjs.com/)
[![RESTful API](https://img.shields.io/badge/API-RESTful-orange.svg)](#api-endpoints)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)

A production-ready RESTful API built with **Node.js** and **Express** for managing student placement records. This project demonstrates modular architecture, strict RESTful URI conventions, standard HTTP methods (GET, POST, PUT, DELETE), dynamic route parameters, query filtering, pagination, request validation, and centralized global error handling.

---

## 📋 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
  - [Endpoints Summary](#endpoints-summary)
  - [1. List All Students (Pagination & Filtering)](#1-list-all-students)
  - [2. Get Student by ID (Dynamic Route Parameter)](#2-get-student-by-id)
  - [3. Create Student](#3-create-student)
  - [4. Update Student](#4-update-student)
  - [5. Delete Student](#5-delete-student)
  - [6. Placement Statistics](#6-placement-statistics)
  - [7. Reset Database](#7-reset-database)
  - [8. System Health Check](#8-system-health-check)
- [Standard Response Formats](#-standard-response-formats)
  - [Success Response Envelope](#success-response-envelope)
  - [Standard Error Response](#standard-error-response)
- [Centralized Error Handling](#-centralized-error-handling)
- [Testing the API](#-testing-the-api)
  - [1. Automated Test Suite](#1-automated-test-suite)
  - [2. Postman / Thunder Client Collection](#2-postman--thunder-client-collection)
  - [3. cURL Command Examples](#3-curl-command-examples)
  - [4. Browser Interactive Explorer](#4-browser-interactive-explorer)

---

## 🏗 Overview & Architecture

This REST API is structured with strict separation of concerns following the Router-Controller pattern:

- **Express Application Entry (`src/app.js`)**: Configures core middleware (`express.json()`, `cors`, custom request logger), mounts routes, attaches the fallback 404 handler, and registers the global error handler.
- **REST Router (`src/routes/apiRoutes.js`)**: Defines RESTful endpoints, maps HTTP methods, and routes traffic to controller actions.
- **Controller Handlers (`src/controllers/apiController.js`)**: Encapsulates business logic, query filtering, sorting, pagination math, input validation, and HTTP status codes.
- **Centralized Error Middleware (`src/middleware/errorHandler.js`)**: Intercepts operational errors (`ApiError`), JSON syntax parsing exceptions, and unhandled server errors, returning consistent JSON envelopes.
- **In-Memory Store (`src/data/mockData.js`)**: Pre-populated database of realistic placement records with query and reset capabilities.

---

## 📂 Project Structure

```text
week5-task3/
├── .env.example                # Sample environment variables
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies and npm scripts
├── postman_collection.json     # Exported Postman/Thunder Client collection v2.1
├── README.md                   # Comprehensive API documentation
├── src/
│   ├── app.js                  # Express application setup and server initialization
│   ├── controllers/
│   │   └── apiController.js    # Request handlers, pagination & business logic
│   ├── data/
│   │   └── mockData.js         # Seed database and in-memory operations
│   ├── middleware/
│   │   └── errorHandler.js     # Centralized error handler & ApiError class
│   └── routes/
│       └── apiRoutes.js        # Express router mapping RESTful paths to handlers
└── test/
    └── manual-test.js          # Automated end-to-end verification script
```

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### Steps
1. Clone the repository and navigate to the project directory:
   ```bash
   cd week5-task3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables:
   ```bash
   cp .env.example .env
   ```

---

## 💻 Running the Application

### Production / Standard Mode
```bash
npm start
```
Server starts on `http://localhost:3000`.

### Development Mode (with Nodemon hot-reload)
```bash
npm run dev
```

### Run Automated Test Suite
```bash
npm test
```

---

## 📖 API Documentation

**Base URL**: `http://localhost:3000`

### Endpoints Summary

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/api/students` | Get paginated list of students with filtering and sorting | `200`, `400` |
| `GET` | `/api/students/:id` | Get a specific student by dynamic integer ID | `200`, `400`, `404` |
| `POST` | `/api/students` | Create a new student placement record | `201`, `400`, `409` |
| `PUT` | `/api/students/:id` | Update an existing student record by ID | `200`, `400`, `404`, `409` |
| `DELETE` | `/api/students/:id` | Delete a student record by ID | `200`, `400`, `404` |
| `GET` | `/api/students/stats` | Aggregated placement analytics & department breakdown | `200` |
| `POST` | `/api/students/reset` | Reset database to initial seed data | `200` |
| `GET` | `/health` | Server uptime and health check | `200` |
| `GET` | `/` | Interactive Web Dashboard and Live API Explorer | `200` |

---

### 1. List All Students

- **URL**: `/api/students`
- **Method**: `GET`
- **Query Parameters**:
  | Parameter | Type | Default | Description |
  |---|---|---|---|
  | `page` | Integer | `1` | Page number (must be >= 1) |
  | `limit` | Integer | `10` | Records per page (1 to 100) |
  | `department` | String | - | Filter by department name (e.g. `Computer Science`) |
  | `status` | String | - | Filter by placement status (`Placed`, `Unplaced`, `Interviewing`) |
  | `company` | String | - | Filter by company name (partial match) |
  | `minCgpa` | Float | - | Minimum CGPA threshold |
  | `maxCgpa` | Float | - | Maximum CGPA threshold |
  | `search` | String | - | Search keyword across name, roll number, and skills |
  | `sortBy` | String | `id` | Field to sort by (`id`, `name`, `cgpa`, `packageOffered`, `createdAt`) |
  | `order` | String | `asc` | Sorting direction (`asc` or `desc`) |

#### Example Request:
```http
GET /api/students?department=Computer%20Science&status=Placed&sortBy=packageOffered&order=desc&page=1&limit=5 HTTP/1.1
Host: localhost:3000
```

#### Example Response (`200 OK`):
```json
{
  "success": true,
  "message": "Student records retrieved successfully",
  "count": 2,
  "pagination": {
    "totalItems": 2,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 5,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "data": [
    {
      "id": 1,
      "name": "Aarav Sharma",
      "rollNumber": "CS2021001",
      "email": "aarav.sharma@college.edu",
      "department": "Computer Science",
      "cgpa": 9.2,
      "skills": ["JavaScript", "Node.js", "React", "MongoDB"],
      "placementStatus": "Placed",
      "company": "Google",
      "packageOffered": 3200000,
      "placedDate": "2024-09-15",
      "createdAt": "2024-08-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Priya Patel",
      "rollNumber": "CS2021045",
      "email": "priya.patel@college.edu",
      "department": "Computer Science",
      "cgpa": 8.8,
      "skills": ["Java", "Spring Boot", "AWS", "Docker"],
      "placementStatus": "Placed",
      "company": "Amazon",
      "packageOffered": 2800000,
      "placedDate": "2024-09-20",
      "createdAt": "2024-08-01T10:15:00.000Z"
    }
  ]
}
```

---

### 2. Get Student by ID

- **URL**: `/api/students/:id`
- **Method**: `GET`
- **Path Parameter**: `:id` (Positive Integer)

#### Example Request:
```http
GET /api/students/1 HTTP/1.1
Host: localhost:3000
```

#### Example Response (`200 OK`):
```json
{
  "success": true,
  "message": "Student retrieved successfully",
  "data": {
    "id": 1,
    "name": "Aarav Sharma",
    "rollNumber": "CS2021001",
    "email": "aarav.sharma@college.edu",
    "department": "Computer Science",
    "cgpa": 9.2,
    "skills": ["JavaScript", "Node.js", "React", "MongoDB"],
    "placementStatus": "Placed",
    "company": "Google",
    "packageOffered": 3200000,
    "placedDate": "2024-09-15",
    "createdAt": "2024-08-01T10:00:00.000Z"
  }
}
```

#### Error Response (`404 Not Found`):
```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "message": "Student with ID 999 does not exist"
  },
  "path": "/api/students/999",
  "method": "GET",
  "timestamp": "2026-10-20T16:28:20.282Z"
}
```

---

### 3. Create Student

- **URL**: `/api/students`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Required Fields**: `name`, `rollNumber`, `email`, `department`, `cgpa`

#### Request Body Schema:
```json
{
  "name": "Ishaan Verma",
  "rollNumber": "CS2021205",
  "email": "ishaan.verma@college.edu",
  "department": "Computer Science",
  "cgpa": 9.1,
  "skills": ["Go", "Kubernetes", "PostgreSQL"],
  "placementStatus": "Placed",
  "company": "Atlassian",
  "packageOffered": 2600000
}
```

#### Example Response (`201 Created`):
```json
{
  "success": true,
  "message": "Student record created successfully",
  "data": {
    "id": 13,
    "name": "Ishaan Verma",
    "rollNumber": "CS2021205",
    "email": "ishaan.verma@college.edu",
    "department": "Computer Science",
    "cgpa": 9.1,
    "skills": ["Go", "Kubernetes", "PostgreSQL"],
    "placementStatus": "Placed",
    "company": "Atlassian",
    "packageOffered": 2600000,
    "placedDate": "2026-10-20",
    "createdAt": "2026-10-20T16:28:20.313Z"
  }
}
```

#### Validation Error (`400 Bad Request`):
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed for creating student",
    "details": [
      "Field 'email' is required and must be a valid email address",
      "Field 'department' is required",
      "Field 'cgpa' is required and must be a number between 0.0 and 10.0"
    ]
  },
  "path": "/api/students",
  "method": "POST",
  "timestamp": "2026-10-20T16:28:20.318Z"
}
```

---

### 4. Update Student

- **URL**: `/api/students/:id`
- **Method**: `PUT`
- **Headers**: `Content-Type: application/json`

#### Request Body Schema:
```json
{
  "placementStatus": "Placed",
  "company": "Google Cloud",
  "packageOffered": 3400000,
  "skills": ["Go", "Kubernetes", "PostgreSQL", "GCP"]
}
```

#### Example Response (`200 OK`):
```json
{
  "success": true,
  "message": "Student record updated successfully",
  "data": {
    "id": 3,
    "name": "Rohan Verma",
    "rollNumber": "IT2021012",
    "email": "rohan.verma@college.edu",
    "department": "Information Technology",
    "cgpa": 7.9,
    "skills": ["Go", "Kubernetes", "PostgreSQL", "GCP"],
    "placementStatus": "Placed",
    "company": "Google Cloud",
    "packageOffered": 3400000,
    "placedDate": "2026-10-20",
    "createdAt": "2024-08-02T11:00:00.000Z",
    "updatedAt": "2026-10-20T16:28:20.324Z"
  }
}
```

---

### 5. Delete Student

- **URL**: `/api/students/:id`
- **Method**: `DELETE`

#### Example Response (`200 OK`):
```json
{
  "success": true,
  "message": "Student with ID 12 (Tanvi Deshmukh) deleted successfully",
  "data": {
    "deletedId": 12,
    "rollNumber": "ME2021067"
  }
}
```

---

### 6. Placement Statistics

- **URL**: `/api/students/stats`
- **Method**: `GET`

#### Example Response (`200 OK`):
```json
{
  "success": true,
  "message": "Placement statistics computed successfully",
  "data": {
    "totalStudents": 12,
    "placedCount": 7,
    "interviewingCount": 2,
    "unplacedCount": 3,
    "placementRatePercentage": 58.33,
    "averageCgpa": 8.13,
    "packageStats": {
      "currency": "INR",
      "averagePackage": 2435714,
      "highestPackage": 3500000
    },
    "departmentBreakdown": {
      "Computer Science": { "total": 5, "placed": 3 },
      "Information Technology": { "total": 3, "placed": 2 },
      "Electronics & Communication": { "total": 2, "placed": 1 },
      "Mechanical Engineering": { "total": 2, "placed": 1 }
    }
  }
}
```

---

### 7. Reset Database

- **URL**: `/api/students/reset`
- **Method**: `POST`
- Resets the in-memory store back to seed data.

---

### 8. System Health Check

- **URL**: `/health`
- **Method**: `GET`
- Returns uptime and status:
```json
{
  "status": "UP",
  "uptime": 142.54,
  "timestamp": "2026-10-20T16:28:20.250Z",
  "service": "Student Placement REST API"
}
```

---

## 🛡 Standard Response Formats

### Success Response Envelope
All successful requests return a consistent JSON payload:
```json
{
  "success": true,
  "message": "Human readable action summary",
  "count": 10,
  "pagination": { ... },
  "data": { ... }
}
```

### Standard Error Response
All errors intercepted by the global error middleware return a standardized structure:
```json
{
  "success": false,
  "error": {
    "statusCode": 400,
    "message": "Validation failed for creating student",
    "details": [
      "Field 'rollNumber' is required"
    ]
  },
  "path": "/api/students",
  "method": "POST",
  "timestamp": "2026-10-20T16:28:20.318Z"
}
```

### HTTP Status Code Usage:
- `200 OK`: Successful retrieval, update, or deletion.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation failure, malformed JSON body, or invalid query/path parameters.
- `404 Not Found`: Requested ID or unknown endpoint path does not exist.
- `409 Conflict`: Unique constraint violation (duplicate email or roll number).
- `500 Internal Server Error`: Intercepted uncaught exceptions.

---

## ⚙ Centralized Error Handling

The application uses an `ApiError` operational error class alongside a dedicated centralized middleware in `src/middleware/errorHandler.js`:

```javascript
// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = err.details || null;

  // Intercept malformed JSON body syntax error from express.json()
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON payload in request body";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      statusCode,
      message,
      ...(details ? { details } : {})
    },
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};
```

Any undefined URL route is intercepted by `notFoundHandler` and mapped to a standard `404` status code.

---

## 🧪 Testing the API

### 1. Automated Test Suite
Run the built-in automated test suite:
```bash
npm test
```
The test suite performs 49 automated assertions testing every route, filter, pagination scenario, validation rule, and error interceptor.

### 2. Postman / Thunder Client Collection
Import `postman_collection.json` into Postman, Insomnia, or the VS Code Thunder Client extension:
- Pre-configured requests for all endpoints
- Environment variable `baseUrl` set to `http://localhost:3000`
- Includes test cases for status codes `200`, `201`, `400`, `404`, and `409`

### 3. cURL Command Examples

#### Get all students (Page 1, Limit 3):
```bash
curl -X GET "http://localhost:3000/api/students?page=1&limit=3"
```

#### Filter by Department and Minimum CGPA:
```bash
curl -X GET "http://localhost:3000/api/students?department=Computer%20Science&minCgpa=8.5"
```

#### Create a new student:
```bash
curl -X POST "http://localhost:3000/api/students" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Karan Mehra",
    "rollNumber": "CS2021301",
    "email": "karan.mehra@college.edu",
    "department": "Computer Science",
    "cgpa": 8.75,
    "skills": ["Node.js", "Docker", "Redis"],
    "placementStatus": "Placed",
    "company": "Razorpay",
    "packageOffered": 2200000
  }'
```

#### Update an existing student:
```bash
curl -X PUT "http://localhost:3000/api/students/5" \
  -H "Content-Type: application/json" \
  -d '{
    "placementStatus": "Placed",
    "company": "Accenture",
    "packageOffered": 1100000
  }'
```

#### Delete a student:
```bash
curl -X DELETE "http://localhost:3000/api/students/5"
```

#### Check placement stats:
```bash
curl -X GET "http://localhost:3000/api/students/stats"
```

### 4. Browser Interactive Explorer
Open your web browser and visit:
```
http://localhost:3000/
```
The interactive web dashboard displays the endpoint directory, live server metrics, and interactive sandbox buttons to execute live queries right inside the browser.

---

## 📄 License
This project is licensed under the MIT License.

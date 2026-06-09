# Scalable REST API with Authentication & Role-Based Access

## 🚀 Project Overview

This project is a full-stack application developed as part of the Backend Developer Intern Assignment for Primetrade.ai.

The application demonstrates secure authentication, role-based authorization, CRUD operations, API versioning, validation, error handling, and frontend integration.

### Key Features

#### Backend

* User Registration & Login
* Password Hashing using bcrypt
* JWT Authentication
* Role-Based Access Control (User/Admin)
* CRUD Operations for Tasks
* API Versioning (`/api/v1`)
* Input Validation & Sanitization
* Centralized Error Handling
* Database Integration
* Swagger API Documentation
* Modular & Scalable Architecture

#### Frontend

* User Registration Page
* User Login Page
* Protected Dashboard
* Task Management (Create, Read, Update, Delete)
* API Integration with Backend
* Success/Error Notifications

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB / PostgreSQL
* JWT Authentication
* bcryptjs
* Swagger
* Express Validator

### Frontend

* React.js
* Axios
* React Router
* Tailwind CSS / CSS

---

## 📂 Project Structure

```bash
project-root/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   │
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   │
│   └── package.json
│
├── docs/
│   └── postman_collection.json
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/scalable-rest-api.git
cd scalable-rest-api
```

### Backend Setup

```bash
cd backend

npm install
```

Create `.env`

```env
PORT=5000
MONGO_URI=your_database_url
JWT_SECRET=your_secret_key
```

Run Backend

```bash
npm run dev
```

---

### Frontend Setup

```bash
cd frontend

npm install
npm start
```

Frontend will run on:

```bash
http://localhost:3000
```

Backend will run on:

```bash
http://localhost:5000
```

---

## 🔐 Authentication

### Register

```http
POST /api/v1/auth/register
```

### Login

```http
POST /api/v1/auth/login
```

Returns:

```json
{
  "token": "jwt_token"
}
```

---

## 👥 Role-Based Access

### User

* Manage own tasks
* Access protected routes

### Admin

* Full CRUD access
* View all users/tasks
* Administrative actions

---

## 📋 Task APIs

### Create Task

```http
POST /api/v1/tasks
```

### Get All Tasks

```http
GET /api/v1/tasks
```

### Update Task

```http
PUT /api/v1/tasks/:id
```

### Delete Task

```http
DELETE /api/v1/tasks/:id
```

---

## 📖 API Documentation

Swagger Documentation:

```bash
http://localhost:5000/api-docs
```

Postman Collection:

```bash
/docs/postman_collection.json
```

---

## 🛡️ Security Features

* Password Hashing (bcrypt)
* JWT Authentication
* Protected Routes
* Role-Based Authorization
* Input Validation
* Request Sanitization
* Environment Variables Protection
* Centralized Error Handling

---

## 📈 Scalability Considerations

The application is designed with scalability in mind:

### Modular Architecture

Features are separated into controllers, services, middleware, and routes.

### Database Optimization

* Indexed fields
* Efficient query patterns

### Future Enhancements

* Redis Caching
* Microservices Architecture
* Message Queues (RabbitMQ/Kafka)
* Load Balancing
* Docker & Kubernetes Deployment
* CI/CD Pipelines

---

## 🧪 Testing

Run tests:

```bash
npm test
```

---

## 📸 Screenshots

Add screenshots of:

* Registration Page
* Login Page
* Dashboard
* Task CRUD Operations
* Swagger Documentation

---

## 👨‍💻 Author

**Your Name**

Backend Developer Intern Assignment

Primetrade.ai – 2026

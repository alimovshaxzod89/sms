
# School Management System API Documentation

## Base URL
http://localhost:5001/api

## Authentication
All protected routes require a Bearer token in the Authorization header:


<your_token_here>

## Endpoints

### Authentication
- POST /auth/login - Login
- POST /auth/register - Register

### Teachers
- GET /teachers - Get all teachers (with pagination, search)
- GET /teachers/:id - Get single teacher
- POST /teachers - Create teacher
- PUT /teachers/:id - Update teacher
- DELETE /teachers/:id - Delete teacher

### Students
- GET /students - Get all students (with pagination, search, filters)
- GET /students/:id - Get single student
- POST /students - Create student
- PUT /students/:id - Update student
- DELETE /students/:id - Delete student

### Exams
- GET /exams - Get all exams (with pagination, search, filters)
- GET /exams/:id - Get single exam
- POST /exams - Create exam
- PUT /exams/:id - Update exam
- DELETE /exams/:id - Delete exam

### Lessons
- GET /lessons - Get all lessons
- GET /lessons/:id - Get single lesson
- POST /lessons - Create lesson
- PUT /lessons/:id - Update lesson
- DELETE /lessons/:id - Delete lesson
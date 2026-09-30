# API Documentation

## Authentication APIs

### Register
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Auth Required:** No
- **Request Body:** `{ "name": "John Doe", "email": "john@example.com", "password": "securepassword" }`
- **Response Format:** `{ "user": { "id": "...", "email": "...", "name": "..." }, "message": "User created successfully" }`
- **Status Codes:** `201 Created`, `400 Bad Request`, `409 Conflict`
- **Example:** `curl -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}' /api/auth/register`

### Login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Auth Required:** No
- **Request Body:** `{ "email": "john@example.com", "password": "securepassword" }`
- **Response Format:** `{ "user": { "id": "...", "email": "..." }, "message": "Logged in successfully" }` (Sets HTTP-only cookie)
- **Status Codes:** `200 OK`, `401 Unauthorized`

### Logout
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Auth Required:** Yes
- **Response Format:** `{ "message": "Logged out successfully" }` (Clears cookie)
- **Status Codes:** `200 OK`

### Get Current User
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Auth Required:** Yes
- **Response Format:** `{ "user": { "id": "...", "email": "...", "name": "..." } }`
- **Status Codes:** `200 OK`, `401 Unauthorized`


## Resume APIs

### Upload Resume
- **Method:** `POST`
- **Path:** `/api/resume/upload`
- **Auth Required:** Yes
- **Request Body:** `multipart/form-data` (file field: `resume`)
- **Response Format:** `{ "resumeId": "...", "url": "..." }`
- **Status Codes:** `200 OK`, `400 Bad Request`

### Get Uploaded Resumes
- **Method:** `GET`
- **Path:** `/api/resume/upload`
- **Auth Required:** Yes
- **Response Format:** `[ { "id": "...", "filename": "...", "createdAt": "..." } ]`
- **Status Codes:** `200 OK`

### Analyze Resume
- **Method:** `POST`
- **Path:** `/api/resume/analyze`
- **Auth Required:** Yes
- **Request Body:** `{ "resumeId": "..." }`
- **Response Format:** `{ "analysisId": "...", "atsScore": 85, "feedback": "..." }`
- **Status Codes:** `200 OK`, `404 Not Found`

### Get Resume Analysis
- **Method:** `GET`
- **Path:** `/api/resume/analyze`
- **Auth Required:** Yes
- **Query Params:** `?resumeId=...`
- **Response Format:** `{ "atsScore": 85, "keywords": [...], "suggestions": [...] }`
- **Status Codes:** `200 OK`


## Job APIs

### Match Jobs
- **Method:** `POST`
- **Path:** `/api/jobs/match`
- **Auth Required:** Yes
- **Request Body:** `{ "resumeId": "..." }`
- **Response Format:** `{ "matches": [ { "jobId": "...", "score": 90 } ] }`
- **Status Codes:** `200 OK`

### Get Job Matches
- **Method:** `GET`
- **Path:** `/api/jobs/match`
- **Auth Required:** Yes
- **Query Params:** `?resumeId=...`
- **Response Format:** `[ { "job": {...}, "matchScore": 90 } ]`
- **Status Codes:** `200 OK`


## Application APIs

### Get Applications
- **Method:** `GET`
- **Path:** `/api/applications`
- **Auth Required:** Yes
- **Response Format:** `[ { "id": "...", "jobTitle": "...", "status": "Applied" } ]`
- **Status Codes:** `200 OK`

### Add Application
- **Method:** `POST`
- **Path:** `/api/applications`
- **Auth Required:** Yes
- **Request Body:** `{ "jobTitle": "...", "company": "...", "status": "Applied" }`
- **Response Format:** `{ "id": "...", "status": "Applied" }`
- **Status Codes:** `201 Created`

### Update Application
- **Method:** `PUT`
- **Path:** `/api/applications/:id`
- **Auth Required:** Yes
- **Request Body:** `{ "status": "Interviewing" }`
- **Response Format:** `{ "id": "...", "status": "Interviewing" }`
- **Status Codes:** `200 OK`

### Delete Application
- **Method:** `DELETE`
- **Path:** `/api/applications/:id`
- **Auth Required:** Yes
- **Status Codes:** `204 No Content`


## Skills APIs

### Get Skills
- **Method:** `GET`
- **Path:** `/api/skills`
- **Auth Required:** Yes
- **Response Format:** `[ { "skill": "React", "proficiency": 4 } ]`
- **Status Codes:** `200 OK`

### Add/Update Skill
- **Method:** `POST` or `PUT`
- **Path:** `/api/skills`
- **Auth Required:** Yes
- **Request Body:** `{ "skill": "React", "proficiency": 4 }`
- **Status Codes:** `200 OK` / `201 Created`


## Interview APIs

### Generate Interview
- **Method:** `POST`
- **Path:** `/api/interview/generate`
- **Auth Required:** Yes
- **Request Body:** `{ "role": "Frontend Developer", "resumeId": "..." }`
- **Response Format:** `{ "sessionId": "...", "questions": [...] }`
- **Status Codes:** `200 OK`

### Get Interview Sessions
- **Method:** `GET`
- **Path:** `/api/interview/generate`
- **Auth Required:** Yes
- **Response Format:** `[ { "id": "...", "date": "..." } ]`
- **Status Codes:** `200 OK`


## Dashboard

### Get Dashboard Summary
- **Method:** `GET`
- **Path:** `/api/dashboard`
- **Auth Required:** Yes
- **Response Format:** `{ "recentApplications": [...], "averageAtsScore": 82, "upcomingInterviews": [...] }`
- **Status Codes:** `200 OK`


## Admin

### Get Admin Stats
- **Method:** `GET`
- **Path:** `/api/admin/stats`
- **Auth Required:** Yes (Admin role only)
- **Response Format:** `{ "totalUsers": 150, "totalResumesProcessed": 450, "systemHealth": "OK" }`
- **Status Codes:** `200 OK`, `403 Forbidden`

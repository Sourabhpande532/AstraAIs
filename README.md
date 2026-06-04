# Astra HR

---

A MERN Stack Astra HR system to manage employee leaves, schedule meetings, and interact with an AI Assistant via a custom terminal widget. <br>
Built with a React frontend, Express/Node backend, MongoDB database.

---

## Demo Link

[Live Demo](#)

---

## Quick Start

```
git clone https://github.com/Sourabhpande532/AstraAIs.git
cd AstraAI
npm install
npm run dev  # or `npm start` / `yarn dev`
```

---

## Technologies

- React Js (Vite)
- Redux Toolkit
- React Router
- Node Js
- Express Js
- MongoDB
- Server-Sent Events (SSE)
- RESTful APIs

---

## Demo Video

Watch a walkthrough (5-7 minutes) of all major features of this app: <br>
[Drive Video Link](#)

---

## Features

**Employee Dashboard**

- Overview of leave balances with visual progress bars (`Sick`, `Casual`, `Earned`)
- Recent leave requests history and status tracking
- Upcoming scheduled meetings with dates and titles

**AI HR Terminal Widget**

- Draggable, minimizable, custom-built AI terminal interface
- Real-time streaming responses via Server-Sent Events (SSE)
- Agentic execution for multi-step prompts (e.g., checking leave balance -> applying for leave -> scheduling doctor appointment)

**Leave Management**

- Check current leave balances
- Apply for leaves automatically through AI or manually
- Validation against available leave balance

**Meeting Scheduling**

- Schedule meetings dynamically via AI natural language processing
- Meetings are instantly synced with the frontend via Redux state

**Authentication**

- Secure Employee Login and Registration
- Quick "Guest Login" feature for easy access

**Responsive Premium UI**

- Custom dark mode, glassmorphism cards, and animated gradient bars
- Mobile and desktop friendly layout

---

## Reference

![](./assets/agents.png)

---

## API Reference

### GET /api/dashboard

Retrieve employee dashboard data including leaves and meetings.
Sample Response:

```
{ 
  "leaves": [{ "_id": "...", "type": "sick", "days": 1, "status": "approved", "createdAt": "..." }],
  "meetings": [{ "_id": "...", "title": "Doctor Appointment", "date": "...", "createdAt": "..." }]
}
```

### POST /api/auth/login

Authenticate an employee and get token.
Sample Response:

```
{ 
  "_id": "...", 
  "name": "Jane Doe", 
  "email": "jane@company.com", 
  "token": "...", 
  "leaveBalance": { "sick": 12, "casual": 10, "earned": 15 } 
}
```

### POST /api/auth/register

Register a new employee.
Sample Response:

```
{ 
  "_id": "...", 
  "name": "Jane Doe", 
  "email": "jane@company.com", 
  "token": "...", 
  "leaveBalance": { "sick": 12, "casual": 10, "earned": 15 } 
}
```

### POST /api/auth/guest

Quick login as a guest employee.
Sample Response:

```
{ 
  "_id": "...", 
  "name": "Guest User", 
  "email": "guest@astra.com", 
  "token": "...", 
  "leaveBalance": { "sick": 12, "casual": 10, "earned": 15 } 
}
```

### POST /api/ai/chat/stream

Send a prompt to the AI Agent and receive Server-Sent Events stream.
Sample Request Body:

```
{ "message": "Apply for 1 day sick leave" }
```

Sample Streaming Events:

```
event: status
data: {"text": "Thinking...", "type": "thinking"}

event: step_result
data: {"success": true, "function": "applyForLeave", "result": {"days": 1, "type": "sick"}}

event: done
data: {"reply": "I have applied for your sick leave."}
```

---

## Environment Setup

**Backend (/.env)**

```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/astra_hr
JWT_SECRET=your_jwt_secret_key

# AI Integration
GEMINI_API_KEY=your_gemini_api_key

```

**Frontend**

```
# API Base URL (if using Vite)
VITE_API_URL=http://localhost:5000/api

```

---

## Contact

For bugs or feature requests, please reach out to [sourabhpande43@gmail.com](mailto:sourabhpande43@gmail.com)

---

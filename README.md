# TaskFlow SaaS

A full-stack Team Task & Project Management SaaS application.

## Features

- **Authentication** — Register, Login, Logout, JWT auth, password hashing, forgot/reset password
- **Workspaces** — Multi-workspace support with role-based access (Owner, Admin, Member)
- **Projects** — Create and manage projects within workspaces
- **Tasks** — Kanban board (To Do → In Progress → Completed) with drag-and-drop
- **Team Collaboration** — Invite members with role-based permissions
- **Dashboard** — Stats overview, recent activity, and project summaries

## Tech Stack

| Layer    | Technologies                          |
|----------|---------------------------------------|
| Backend  | Node.js, Express, MongoDB, Mongoose |
| Frontend | React, Vite, Redux Toolkit, Tailwind CSS |
| Auth     | JWT, bcryptjs                         |

<img width="943" height="431" alt="Screenshot 2026-06-17 144347" src="https://github.com/user-attachments/assets/0f13ab7b-1d30-457d-84f9-c06c6febdbb5" />

<img width="935" height="430" alt="Screenshot 2026-06-17 144413" src="https://github.com/user-attachments/assets/b7233e58-892c-4bdb-bb94-06a1e596d281" />

<img width="958" height="365" alt="Screenshot 2026-06-17 144427" src="https://github.com/user-attachments/assets/948d5141-5279-4ac3-99d1-4bccfc00bbac" />


## Project Structure

```
taskflow/
├── server/
│   └── src/
│       ├── config/db.js
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       ├── utils/
│       ├── app.js
│       └── server.js
└── client/
    └── src/
        ├── components/
        ├── pages/
        ├── store/
        ├── api/
        └── App.jsx
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

### 1. Clone and install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

Copy `server/.env.example` to `server/.env` and update values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5174
```

For password reset emails (optional):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Start MongoDB

Ensure MongoDB is running locally, or use a MongoDB Atlas connection string in `MONGO_URI`.

### 4. Run the application

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5174
- Backend API: http://localhost:5000/api

## User Flow

1. **Register** → Create account
2. **Create Workspace** → Set up your team space
3. **Dashboard** → View stats and recent activity
4. **Projects** → Create and manage projects
5. **Task Board** → Kanban-style task management

## API Endpoints

### Auth
| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| POST   | `/api/auth/register`        | Register user      |
| POST   | `/api/auth/login`           | Login              |
| POST   | `/api/auth/logout`          | Logout             |
| GET    | `/api/auth/me`              | Get current user   |
| POST   | `/api/auth/forgot-password` | Request reset      |
| PUT    | `/api/auth/reset-password/:token` | Reset password |

### Workspaces
| Method | Endpoint                              | Description       |
|--------|---------------------------------------|-------------------|
| GET    | `/api/workspaces`                     | List workspaces   |
| POST   | `/api/workspaces`                     | Create workspace  |
| GET    | `/api/workspaces/:id`                 | Get workspace     |
| PUT    | `/api/workspaces/:id`                 | Update workspace  |
| DELETE | `/api/workspaces/:id`                | Delete workspace  |
| POST   | `/api/workspaces/:id/invite`          | Invite member     |
| DELETE | `/api/workspaces/:id/members/:userId` | Remove member     |
| GET    | `/api/workspaces/:id/dashboard`      | Dashboard stats   |

### Projects
| Method | Endpoint              | Description     |
|--------|-----------------------|-----------------|
| GET    | `/api/projects?workspaceId=` | List projects |
| POST   | `/api/projects`       | Create project  |
| GET    | `/api/projects/:id`   | Get project     |
| PUT    | `/api/projects/:id`   | Update project  |
| DELETE | `/api/projects/:id`   | Delete project  |

### Tasks
| Method | Endpoint                  | Description  |
|--------|---------------------------|--------------|
| GET    | `/api/tasks?projectId=`   | List tasks   |
| POST   | `/api/tasks`              | Create task  |
| GET    | `/api/tasks/:id`          | Get task     |
| PUT    | `/api/tasks/:id`          | Update task  |
| DELETE | `/api/tasks/:id`          | Delete task  |

## Role Permissions

| Action              | Owner | Admin | Member |
|---------------------|-------|-------|--------|
| Create workspace    | ✅    | ❌    | ❌     |
| Delete workspace    | ✅    | ❌    | ❌     |
| Manage members      | ✅    | ❌    | ❌     |
| Invite members      | ✅    | ✅    | ❌     |
| Create projects     | ✅    | ✅    | ❌     |
| Assign tasks        | ✅    | ✅    | ❌     |
| Update tasks        | ✅    | ✅    | ✅     |

## License

MIT

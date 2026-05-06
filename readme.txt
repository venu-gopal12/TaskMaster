Team Task Manager

A full-stack, role-based Team Task Management web application. Built as a unified system, this application allows teams to create projects, invite members, assign tasks, and track their progress via an interactive Kanban board and a statistical dashboard. 

--- FEATURES ---

1. Authentication & Authorization
- JWT-based Authentication: Secure login and registration.
- Role-Based Access Control (RBAC): Two distinct roles:
  - Admin: Can create projects, add/remove team members, and manage all tasks within those projects.
  - Member: Can only view projects they are assigned to and update the status of tasks assigned to them.

2. Project Management
- Create & Manage Projects: Admins can define project goals.
- Team Management: Admins can invite registered users to specific projects.
- Dynamic Visibility: Members only see the projects they have been explicitly added to.

3. Task Board (Kanban)
- Task Lifecycle: Move tasks seamlessly between TODO, IN PROGRESS, REVIEW, and DONE.
- Assignments & Deadlines: Assign tasks to specific team members and set due dates.
- Overdue Tracking: Tasks that pass their due date before being marked as "Done" are highlighted in red automatically.

4. Statistical Dashboard
- Real-time aggregated data showing total projects, total tasks, overdue tasks, and a visual breakdown of tasks by status.

--- TECHNOLOGY STACK ---

- Frontend: React (Vite), React Router DOM, Axios, Lucide-React (Icons).
- Styling: Custom Vanilla CSS featuring modern aesthetics (Dark Mode, Glassmorphism, CSS Variables, and Micro-animations).
- Backend: Node.js, Express.js.
- Database: MongoDB (Mongoose ORM).
- Security: JWT (JSON Web Tokens), Bcrypt.js (Password Hashing), Helmet, CORS.

--- LOCAL DEVELOPMENT SETUP ---

Follow these steps to run the application on your local machine.

Prerequisites:
- Node.js (v18 or higher)
- A MongoDB Atlas Cluster (or local MongoDB server)

1. Installation
Clone the repository, then install dependencies for the root, backend, and frontend.
  npm install
  cd backend && npm install
  cd ../frontend && npm install

2. Environment Variables
You need to set up two .env files.

Backend (backend/.env):
  PORT=5000
  MONGO_URI=your_mongodb_connection_string_here
  JWT_SECRET=your_super_secret_jwt_key
  JWT_EXPIRES_IN=30d
  NODE_ENV=development

Frontend (frontend/.env):
  VITE_API_URL=http://localhost:5000/api

3. Running the App
Open two separate terminal windows.

Terminal 1 (Backend):
  cd backend
  npm run dev

Terminal 2 (Frontend):
  cd frontend
  npm run dev

The frontend will be available at http://localhost:5173.

--- DEPLOYMENT (RAILWAY) ---

This application is specifically architected to be deployed as a single unified service on Railway (railway.app). The Express backend is configured to statically serve the built React frontend in production.

Deployment Steps:
1. Push this entire repository to GitHub.
2. Log in to Railway and create a New Project -> Deploy from GitHub repo.
3. Select this repository.
4. Go to the Railway project Variables tab and add your environment variables:
   - MONGO_URI
   - JWT_SECRET
   - JWT_EXPIRES_IN
5. Railway will automatically detect the root package.json, install all dependencies, build the Vite frontend, and start the Express server serving both the API and the UI!

--- USAGE GUIDE ---

1. First Steps: Register a new user and select the Administrator role.
2. Create a Project: Go to the "Projects" tab and create a new project.
3. Add Team Members: Open a different browser (or Incognito mode) and register a second user with the Team Member role. Switch back to your Admin account, open the Project Board, click "Manage Team", and add the new user.
4. Assign Tasks: Click "New Task", fill out the details, select a Due Date, and pick the newly added member from the Assignee dropdown.
5. Member View: Log in as the Team Member to see the customized view! You will only see the projects assigned to you.

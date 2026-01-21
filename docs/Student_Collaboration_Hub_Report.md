Student Collaboration Hub – Project Report
=========================================

> Note: This document is written in the first person, as if I personally designed and built the project end‑to‑end.

---

## 1. Introduction

### 1.1 Problem statement

During my academic journey I noticed that collaboration between students is usually fragmented:

- Notes are scattered across WhatsApp, Google Drive, and random PDFs.
- Discussions about topics (Doubts, DSA, OS, placement prep, etc.) happen in many separate groups and are hard to search later.
- Job notification links are shared once in a chat and then get buried in the history.

I wanted a **single web platform** where:

- Students can **sign up and log in** securely.
- Each student can **store their own study notes** in a structured way.
- Everyone can **post and browse discussion threads**.
- Students can maintain a **personal list of job notification links** (off‑campus drives, internships, placement portals, etc.).

This led me to design and build the **Student Collaboration Hub**.

### 1.2 Goals of the project

My goals for this project were:

- Build a **full‑stack web application** with a real backend and database.
- Use **FastAPI** with **MongoDB** on the backend.
- Use a **modern frontend stack**: React + Vite + TypeScript + TailwindCSS.
- Implement **proper authentication** using JWT so that users stay logged in.
- Make the UI **clean, modern, and responsive**, with smooth navigation.
- Make the project ready for **deployment**:
  - Backend deployable on **Render**.
  - Frontend deployable on **Netlify**.

### 1.3 High‑level feature list

The Student Collaboration Hub provides:

- **Authentication**
  - User signup (name, email, password).
  - Login with email + password.
  - JWT access tokens stored in the browser (localStorage).
  - “Remember me” behavior by default.

- **Notes**
  - Create private notes (title, content, tags).
  - View all of your own notes.
  - Delete notes.

- **Threads**
  - Public discussion threads visible to everyone.
  - Threads have title, body, author name, and tags.
  - Only the creator can delete their own threads.

- **Job links**
  - Personal list of job notification links.
  - Each link has title, URL, company, location, notes, and tags.
  - Only the owner can view and manage their links.

---

## 2. Technology stack and architecture

### 2.1 Backend stack

- **Language**: Python 3
- **Web framework**: FastAPI
- **Server**: Uvicorn
- **Database**: MongoDB
- **ORM / driver**: `pymongo`
- **Validation / settings**: Pydantic v2, Pydantic Settings
- **Auth**: JWT using `PyJWT`

### 2.2 Frontend stack

- **Build tool**: Vite
- **Framework**: React + TypeScript
- **Routing**: React Router
- **Styling**: TailwindCSS (via the new Tailwind v4 style import)

### 2.3 Overall architecture

I designed the application in a classic **SPA + API** architecture:

- The **frontend** is a Single Page Application (SPA) built with React and Vite. It communicates with the backend via JSON REST APIs over HTTP.
- The **backend** is a stateless FastAPI service that exposes endpoints for authentication and CRUD operations (notes, threads, job links).
- **JWT tokens** are returned by the backend on login or signup and are then included by the frontend in the `Authorization: Bearer <token>` header for protected requests.
- **MongoDB** stores all persistent data: users, notes, threads, and job links.

This decoupling makes it easy to deploy the backend to **Render** and the frontend to **Netlify** independently.

---

## 3. Backend design (FastAPI + MongoDB)

### 3.1 Project structure (backend)

The backend code lives under the `backend/` folder. The structure is:

- `backend/app/main.py` – FastAPI application and router registration.
- `backend/app/config.py` – Application settings (Mongo URI, JWT secret, CORS, etc.).
- `backend/app/db.py` – MongoDB connection management and collection access helpers.
- `backend/app/security.py` – Password hashing, JWT creation, and decoding.
- `backend/app/schemas.py` – Pydantic models for requests and responses.
- `backend/app/utils.py` – Utility helpers (e.g., ObjectId conversion, timestamps).
- `backend/app/deps.py` – Dependency functions (e.g., `get_current_user`).
- `backend/app/routers/` – Routers for each feature:
  - `auth.py` – Signup and login.
  - `users.py` – Current user profile (`/users/me`).
  - `notes.py` – CRUD for notes.
  - `threads.py` – CRUD for discussion threads.
  - `job_links.py` – CRUD for job notification links.

### 3.2 Configuration handling

I used `pydantic-settings` to define a `Settings` class in `config.py`. This class centralizes configuration:

- `mongodb_uri` – Default: `mongodb://localhost:27017`
- `mongodb_db` – Default: `scu`
- `jwt_secret` – Default: `"change-me-super-secret"` (overridden in production)
- `jwt_algorithm` – `"HS256"`
- `access_token_expire_minutes` – 7 days by default
- `cors_origins` – Comma‑separated list of frontend origins

The `Settings` class reads values from environment variables. This allows me to keep the code generic while using different configuration for local development and deployment.

There is also a `backend/config.example` file which documents the main environment variables and the values I expect to set when deploying.

### 3.3 Database layer (MongoDB)

In `db.py` I encapsulated MongoDB access inside a `Database` class. It:

- Holds a single `MongoClient` instance.
- Provides easy access to collections:
  - `db.users`
  - `db.notes`
  - `db.threads`
  - `db.job_links`

On application startup (`@app.on_event("startup")` in `main.py`):

- I call `db.connect()` to initialize the `MongoClient`.
- I run `db.client.admin.command("ping")` to fail fast if MongoDB is unreachable.
- I create **indexes**:
  - Unique index on `users.email`.
  - Indexes on `notes` and `job_links` by `user_id` and `updated_at`.
  - Index on `threads` by `updated_at`.

This design gives:

- Better query performance.
- Early detection of configuration errors (e.g., Mongo not running).

### 3.4 Security: password hashing and JWT

I decided not to rely on heavy external libraries for password hashing and instead used a secure **PBKDF2** based approach implemented by myself in `security.py`:

- Uses `hashlib.pbkdf2_hmac` with:
  - Algorithm: SHA‑256
  - Salt: 16 random bytes
  - Iterations: 210,000
  - Derived key length: 32 bytes
- Stores the hash in a format like:

`pbkdf2_sha256$ITERATIONS$BASE64_SALT$BASE64_HASH`

For JWT tokens:

- I use `PyJWT` to sign and verify tokens.
- A token payload contains:
  - `sub`: user ID
  - `email`: user email
  - `iat`: issued‑at timestamp
  - `exp`: expiration time
  - `type`: `"access"`

The `create_access_token` function uses the configured `jwt_secret` and algorithm (`HS256`).
The `decode_access_token` function validates the signature, expiration, and token type.

### 3.5 Authentication flow

#### 3.5.1 Signup

- Endpoint: `POST /auth/signup`
- Request body:
  - `name`
  - `email`
  - `password`
- Process:
  1. Check if a user with the same email already exists.
  2. Hash the password using the PBKDF2 helper.
  3. Insert a new user document into MongoDB.
  4. Generate a JWT token for the new user.
  5. Return `{ access_token, token_type: "bearer" }`.

#### 3.5.2 Login

- Endpoint: `POST /auth/login`
- Request body:
  - `email`
  - `password`
- Process:
  1. Fetch the user by email.
  2. Compare the provided password with the stored hash.
  3. If valid, generate a new JWT token and return it.

The frontend stores this token and attaches it to all subsequent protected requests.

#### 3.5.3 Current user

- Endpoint: `GET /users/me`
- Uses a dependency `get_current_user` which:
  - Extracts the `Authorization: Bearer <token>` header.
  - Decodes and validates the token.
  - Loads the user from MongoDB.
  - Raises 401 if anything fails.

This endpoint is used on the frontend to fetch the logged‑in user’s profile after the token is loaded from localStorage.

### 3.6 Notes API

Notes are **private** to each user.

- `GET /notes` — list all notes for the current user.
- `POST /notes` — create a new note (title, content, tags).
- `PUT /notes/{note_id}` — update an existing note (title, content, tags).
- `DELETE /notes/{note_id}` — delete a note.

The data model includes:

- `user_id` – ID of the owning user.
- `title`
- `content`
- `tags` – list of strings.
- `created_at`
- `updated_at`

### 3.7 Threads API

Threads are **public discussions**.

- `GET /threads` — list latest threads (public).
- `POST /threads` — create a new thread (requires authentication).
- `PUT /threads/{thread_id}` — update a thread (only by creator).
- `DELETE /threads/{thread_id}` — delete a thread (only by creator).

Each thread contains:

- `user_id` – ID of the creator.
- `author_name` – name of the user at creation time.
- `title`
- `body`
- `tags`
- `created_at`
- `updated_at`

I enforce authorization so that only the original creator can modify or delete their thread.

### 3.8 Job links API

Job links are **personal** to each user, similar to notes.

- `GET /job-links` — list all job links for the current user.
- `POST /job-links` — create a new job link.
- `PUT /job-links/{id}` — update a job link.
- `DELETE /job-links/{id}` — delete a job link.

Each job link contains:

- `user_id`
- `title`
- `url`
- `company` (optional)
- `location` (optional)
- `notes` (optional)
- `tags`
- `created_at`
- `updated_at`

This allows each student to maintain their personal list of recruitment resources.

---

## 4. Frontend design (Vite + React + TypeScript)

### 4.1 Project structure (frontend)

The frontend code is under `frontend/`:

- `src/main.tsx` – React app entry point and router setup.
- `src/App.tsx` – Overall layout (top navigation and outlet).
- `src/index.css` – Global Tailwind import and background styling.
- `src/lib/`:
  - `api.ts` – Wrapper for calling the backend APIs.
  - `auth.tsx` – Authentication context provider and hook.
  - `storage.ts` – LocalStorage helpers to persist JWT tokens.
- `src/components/`:
  - `Brand.tsx` – App branding component.
  - `Button.tsx` – Styled button component.
  - `Input.tsx` – Styled text input.
  - `TextArea.tsx` – Styled textarea.
  - `Container.tsx` – Layout container.
  - `Card.tsx` – Glass‑like card UI component.
  - `TopNav.tsx` – Top navigation bar.
  - `Toast.tsx` – Simple toast notification for errors.
  - `RequireAuth.tsx` – Higher‑order component to protect routes.
- `src/pages/`:
  - `Home.tsx` – Landing page.
  - `Login.tsx` – Login form.
  - `Signup.tsx` – Signup form.
  - `Notes.tsx` – Notes management UI.
  - `Threads.tsx` – Threads UI.
  - `Jobs.tsx` – Job links UI.

### 4.2 Routing

I used **React Router** to manage navigation:

- `/` – Home
- `/login` – Login page
- `/signup` – Signup page
- `/notes` – Protected route (requires login)
- `/threads` – Public threads page
- `/jobs` – Protected route (requires login)

Protected routes use the `RequireAuth` component which:

- Shows a loading state while checking for a stored token.
- Redirects to `/login` if the user is not authenticated.

### 4.3 Authentication on the frontend

The auth flow on the frontend is:

1. On login / signup, the backend returns a JWT token.
2. The frontend stores this token in localStorage using `storage.ts`.
3. An `AuthProvider` component (context) reads the token and calls `/users/me` to get the current user.
4. The auth context exposes:
   - `token`
   - `user`
   - `login(token)`
   - `logout()`
   - `isLoading`
   - `error`
5. Components like `TopNav` and protected pages use this context to show the appropriate UI (e.g., logged‑in user name, log‑out button).

### 4.4 API client abstraction

In `src/lib/api.ts` I wrote a small wrapper around `fetch`:

- `API_BASE_URL` is taken from `VITE_API_BASE_URL` if set, otherwise defaults to `http://127.0.0.1:8000`.
- The `request` helper:
  - Automatically sets `Content-Type: application/json`.
  - Adds `Authorization: Bearer <token>` header if provided.
  - On non‑OK responses, tries to parse a JSON error and throws a descriptive `Error`.

Then I defined namespaced API helpers:

- `api.auth.signup`, `api.auth.login`
- `api.users.me`
- `api.notes.list`, `api.notes.create`, `api.notes.update`, `api.notes.remove`
- `api.threads.list`, `api.threads.create`, `api.threads.update`, `api.threads.remove`
- `api.jobLinks.list`, `api.jobLinks.create`, `api.jobLinks.update`, `api.jobLinks.remove`

This makes the page components cleaner and reduces repetition.

### 4.5 UI and styling decisions

I wanted the UI to feel **modern, minimal, and student‑friendly**, so I:

- Used a **dark background** with gradient glows.
- Used a custom **brand color palette** defined in `tailwind.config.js`.
- Created reusable UI components (`Button`, `Card`, `Input`, `TextArea`, etc.).
- Made sure the layout is responsive:
  - Narrow columns on smaller screens.
  - Two‑column layout (form + list) on larger screens for notes, threads, and jobs.

Each main page (Notes, Threads, Jobs) uses a similar layout:

- Left: a card with a form for creating new content.
- Right: a list of existing items rendered in cards.

### 4.6 Error handling and toasts

Whenever an API call fails (e.g., network error, invalid credentials), I show a small toast message at the top‑right using the `Toast` component.

The toast:

- Displays a header (e.g., “Something went wrong”).
- Displays the backend error message (if available).
- Disappears automatically after a few seconds or can be dismissed manually.

This keeps error feedback visible without being intrusive.

---

## 5. Running the project locally

### 5.1 Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **MongoDB** (either local or MongoDB Atlas)

### 5.2 Steps to run the backend

1. Open PowerShell.
2. Navigate to the backend folder:

   ```powershell
   cd backend
   ```

3. (Optional but recommended) create and activate a virtual environment:

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

4. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

5. Make sure MongoDB is running (locally or Atlas).

6. Set required environment variables for development (example for local Mongo):

   ```powershell
   $env:MONGODB_URI="mongodb://localhost:27017"
   $env:JWT_SECRET="my-super-strong-dev-secret-1234567890"
   ```

7. Start the FastAPI server:

   ```powershell
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

8. Open API docs at `http://127.0.0.1:8000/docs`.

### 5.3 Steps to run the frontend

1. Open another PowerShell window.
2. Navigate to the frontend folder:

   ```powershell
   cd frontend
   ```

3. Install dependencies:

   ```powershell
   npm install
   ```

4. Start the development server:

   ```powershell
   npm run dev
   ```

5. Open the app in a browser at `http://127.0.0.1:5173`.

---

## 6. Deployment (Netlify + Render)

### 6.1 Deploying the backend to Render

I prepared a `backend/render.yaml` file which can be used as a Render Blueprint, or I can manually configure a Python web service with the same settings:

- **Root directory**: `backend`
- **Build command**: `pip install -r requirements.txt`
- **Start command**:

  ```text
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

Required environment variables in Render:

- `MONGODB_URI` – set to the MongoDB Atlas connection string.
- `JWT_SECRET` – a strong secret (different from local dev).

Optional environment variable:

- `CORS_ORIGINS` – set to the Netlify domain or `*` if I want to allow any origin (safe enough here because I use JWT in headers, not cookies).

### 6.2 Deploying the frontend to Netlify

I created:

- `frontend/public/_redirects` with:

  ```text
  /* /index.html 200
  ```

  This ensures that all React Router routes are served by `index.html`.

- `frontend/netlify.toml`:

  ```toml
  [build]
    base = "frontend"
    command = "npm run build"
    publish = "dist"

  [build.environment]
    VITE_API_BASE_URL = "https://YOUR-RENDER-BACKEND.onrender.com"
  ```

To deploy:

1. Connect the repository to Netlify.
2. Use:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. In `netlify.toml`, set `VITE_API_BASE_URL` to the actual Render backend URL and deploy.

---

## 7. Security and privacy considerations

### 7.1 Password storage

I never store plain text passwords. Instead:

- I hash passwords with PBKDF2 + SHA‑256 + salt + many iterations.
- Even if the database were leaked, the password hashes are computationally expensive to crack.

### 7.2 JWT handling

- Tokens are signed using a secret key (`JWT_SECRET`).
- The backend validates:
  - Signature.
  - Expiration time.
  - Token type.
- Tokens are stored on the frontend in `localStorage`, which fits this use case since I am not using cookies or cross‑site requests for authentication.

### 7.3 Authorization rules

- Notes:
  - Only the owner can access or modify their notes.
- Job links:
  - Only the owner can access their job links.
- Threads:
  - Everyone can read public threads.
  - Only the creator can edit or delete their own thread.

These checks are enforced at the backend level using the authenticated user ID from the token.

---

## 8. Testing and validation

### 8.1 Manual testing

I performed the following manual tests:

- Signup flow:
  - New user registration.
  - Duplicate email prevention.
- Login flow:
  - Correct credentials.
  - Wrong password.
  - Non‑existent email.
- Notes:
  - Create, list, and delete notes.
  - Ensure notes from one user are not visible to another.
- Threads:
  - Public listing without login.
  - Posting threads only when logged in.
  - Deleting thread only by creator.
- Job links:
  - Create, list, and delete job links.
  - Check that links are private to each user.

### 8.2 Build and linter checks

- Frontend:
  - `npm run build` passes successfully.
  - TypeScript compiles without errors after fixing type‑only imports and JSX types.
- Backend:
  - `python -c "import app.main"` works, confirming imports and configuration.
  - Errors are descriptive if MongoDB is not reachable.

---

## 9. Challenges and decisions

### 9.1 Handling environment variables without `.env` files

In this project, I deliberately relied on **environment variables** instead of checked‑in `.env` files. This approach:

- Keeps secrets like `JWT_SECRET` and database credentials out of version control.
- Is compatible with deployment platforms like Render and Netlify where environment variables are first‑class citizens.

I used `config.example` files to document what variables need to be set.

### 9.2 Choosing JWT over session cookies

I decided to use JWT tokens stored in localStorage because:

- It simplifies the API: every request is stateless and only needs the token header.
- It works well in a multi‑origin scenario (different frontend and backend hosts).

For a production‑grade app dealing with more sensitive data, I would consider secure HTTP‑only cookies and stricter CORS rules, but for this student collaboration hub, JWT + header auth is a suitable choice.

### 9.3 UI / UX design

Designing the UI was an important part of the project:

- I wanted a layout that **feels like a modern SaaS dashboard**, not a typical basic CRUD UI.
- I used gradient backgrounds, glassmorphism‑like cards, and a vibrant brand palette.
- I tried to keep the pages consistent:
  - Card layout.
  - Clear section titles.
  - Subtle explanatory text.

---

## 10. Conclusion and future work

### 10.1 Summary of what I built

In this project I built a complete **Student Collaboration Hub** consisting of:

- A **FastAPI backend** with:
  - Secure authentication using JWT.
  - Password hashing with PBKDF2.
  - MongoDB persistence for users, notes, threads, and job links.
  - Clean routing and Pydantic schemas.
- A **React + Vite frontend** with:
  - Modern, responsive UI using TailwindCSS.
  - React Router for navigation and protected routes.
  - A reusable auth context and API client.
  - Pages for Home, Login, Signup, Notes, Threads, and Job Links.
- A deployment‑ready setup targeting:
  - **Render** for the backend.
  - **Netlify** for the frontend.

### 10.2 Possible future enhancements

If I continue this project, I would like to add:

- **Rich text editing** for notes (e.g., markdown support).
- **Comments** on threads.
- **File upload** support for attaching PDFs or images to notes.
- **Search and filtering** by tags or content.
- **Notifications** for new threads or replies.

Even in its current form, the Student Collaboration Hub already solves the core problem I set out to address: giving students a central platform to **store notes**, **discuss topics**, and **track job opportunities** in a modern, easy‑to‑use web application.


# Exam Seating Arrangement System (MERN Stack)

A full-stack MERN (MongoDB, Express, React, Node.js) application that automates
exam seating arrangements: manage halls/rooms, manage/upload students, generate
conflict-free seating plans, view printable hall-wise charts, look up a student's
seat, and export plans as CSV.

## Features

- **Polished front page** — a public landing page (hero section, feature grid,
  "how it works" steps, and CTAs) that greets everyone at `/` before they log in.
- **Role-based accounts (Admin & Student)** — fully separate login/signup flows:
  - **Admin**: the first visitor to `/admin/login` sets up the one bootstrap
    admin account; afterward, new admins can only be added by an existing
    admin. Admins manage rooms, students, seating generation, and manual overrides.
  - **Student**: students self-register at `/student/signup` using their
    **roll number**, which is verified against the roster an admin already
    uploaded — so only real students can create an account. Once logged in, a
    student's dashboard (`/student/my-seat`) automatically shows their hall,
    row and seat for every generated plan — no manual searching needed.
  - Viewing a generated plan, printing it, exporting it, and the public
    roll-number lookup on the plan page stay open to everyone (no login) so
    invigilators/visitors can use those too.
- **Room/Hall management** — add halls with rows × seats-per-row, auto-computed capacity.
- **Student management** — add manually or bulk-upload via CSV (`rollNo,name,className,subject`).
- **Seating generation algorithm** with 3 strategies:
  - `no-adjacent-subject` — interleaves students by subject and performs a local
    swap-repair pass so that, wherever possible, no two adjacent seats
    (left/right/up/down) hold students of the same subject — the classic
    anti-cheating rule.
  - `alternate-class` — alternates seat-by-seat between class/section groups.
  - `sequential` — simple roll-number order, no spacing rules.
- **Multi-hall allocation** — students are distributed across selected halls in
  order until capacity runs out; any leftover students are reported as "unseated".
- **Hall-wise printable seat charts** — colour-coded by subject, browser print (Ctrl+P) ready.
- **Manual seat override** — logged-in admins can enter "Swap Mode" on a plan's
  view page and click any two seats within the same hall to swap their
  occupants (e.g. to fix a last-minute conflict or accommodate a request),
  without regenerating the whole plan.
- **Roll-number lookup** — find any student's hall/row/seat instantly within a generated plan.
- **CSV export** — download the full seat allotment for notice boards / ERP import.
- **PDF export** — download a printable, hall-wise PDF (one page per hall) generated with `pdfkit`.

## Project Structure

```
exam-seating-mern/
├── backend/
│   ├── config/db.js              MongoDB connection
│   ├── models/                   Room, Student, SeatingPlan, User schemas
│   ├── controllers/              Business logic for rooms/students/seating/auth
│   ├── middleware/authMiddleware.js  JWT verification (protect routes)
│   ├── routes/                   Express route definitions
│   ├── utils/seatingAlgorithm.js Core seat-allocation algorithm
│   └── server.js                 App entry point
├── frontend/
│   ├── src/pages/                Landing, AdminLogin, StudentLogin, StudentSignup, MySeat,
│   │                             Dashboard, Rooms, Students, GenerateSeating, Plans, ViewSeating
│   ├── src/components/           Navbar, SeatGrid, ProtectedRoute (role-aware)
│   ├── src/context/AuthContext.jsx  Role-based login/signup/session state
│   ├── src/api/axios.js          API client (auto-attaches JWT)
│   └── src/styles.css            Styling incl. landing page + print styles
└── sample-students.csv           Sample data to try the CSV upload
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (or an Atlas connection string)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env      # edit MONGO_URI if needed
npm install
npm run dev                # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## Usage Walkthrough

**As the admin:**
1. Open the app (`/`) and click **Admin Login**. Since no admin exists yet,
   you'll be prompted to **create the admin account** — a one-time bootstrap.
2. Go to **Rooms** and add one or more halls (e.g. "Hall A", 6 rows × 8 seats).
3. Go to **Students** and either add students one by one, or upload
   `sample-students.csv` (included in the project root) using the **Bulk Upload** form.
   This roster is what student sign-ups get verified against.
4. Go to **Generate Plan**, pick a title/date, choose a spacing strategy
   (e.g. *No two adjacent seats — same subject*), select the halls to use, and
   click **Generate Plan**.
5. On the plan page: use **Print**, **Export PDF**, or **Export CSV**, and
   click **✏️ Manual Seat Override** to swap any two seats in a hall if needed.

**As a student:**
1. From the front page, click **Student Sign Up**, and enter your roll number
   exactly as your admin listed it, plus a name/email/password. Sign-up fails
   if the roll number isn't on the roster yet — ask your admin to add you.
2. Log in any time at **Student Login** — you'll land on **My Seat**, which
   automatically lists your hall, row, seat and subject for every plan you
   appear in (no need to search).
3. You can also use the **View Plans** page (no login required) to browse any
   published plan, print a hall chart, or look up any roll number manually.

## API Reference (backend)

| Method | Endpoint                          | Auth          | Description                          |
|--------|-------------------------------------|---------------|-----------------------------------------|
| GET    | /api/auth/bootstrap-status          | Public        | Whether an admin account exists yet   |
| POST   | /api/auth/register                  | Bootstrap\*   | Create admin account                  |
| POST   | /api/auth/student-signup            | Public\*\*    | Student self-signup (roll no. verified) |
| POST   | /api/auth/login                     | Public        | Log in (admin or student), returns a JWT |
| GET    | /api/auth/me                        | Any logged in | Get current logged-in user            |
| GET    | /api/rooms                          | Public        | List rooms                            |
| POST   | /api/rooms                          | Admin         | Create room                           |
| PUT    | /api/rooms/:id                      | Admin         | Update room                           |
| DELETE | /api/rooms/:id                      | Admin         | Delete room                           |
| GET    | /api/students                       | Public        | List students                         |
| POST   | /api/students                       | Admin         | Add student                           |
| PUT    | /api/students/:id                   | Admin         | Update student                        |
| DELETE | /api/students/:id                   | Admin         | Delete student                        |
| DELETE | /api/students/all                   | Admin         | Delete all students                   |
| POST   | /api/students/upload-csv            | Admin         | Bulk import via CSV (`file` field)    |
| POST   | /api/seating/generate               | Admin         | Generate a new seating plan           |
| GET    | /api/seating/my-seat                | Student       | Auto-find the logged-in student's seat(s) |
| GET    | /api/seating                        | Public        | List all seating plans (summary)      |
| GET    | /api/seating/:id                    | Public        | Get full seating plan                 |
| DELETE | /api/seating/:id                    | Admin         | Delete a seating plan                 |
| GET    | /api/seating/:id/export             | Public        | Download plan as CSV                  |
| GET    | /api/seating/:id/export-pdf         | Public        | Download plan as a hall-wise PDF      |
| GET    | /api/seating/:id/lookup?rollNo=     | Public        | Find a student's seat in a plan       |
| POST   | /api/seating/:id/swap-seats         | Admin         | Manually swap two seats in a hall     |

\* `/api/auth/register` is open with no token only while zero admins exist
(first-run bootstrap); afterward it requires a logged-in admin's token.
\*\* `/api/auth/student-signup` always requires the submitted `rollNo` to
already exist in the Student roster; otherwise it's rejected.

Protected routes expect `Authorization: Bearer <token>`; the frontend's
`api/axios.js` attaches this automatically once you're logged in.

## Notes / Possible Extensions

- Add an "absentee" toggle so invigilators can mark no-shows without regenerating the plan.
- Add password-reset flows for both admins and students.
- Add drag-and-drop (instead of click-to-select) for the manual seat override.
- Rate-limit `/api/auth/login` and `/api/auth/student-signup` to slow down brute-force attempts in production.
- Let admins invite/manage other admins from a settings page instead of the API only.

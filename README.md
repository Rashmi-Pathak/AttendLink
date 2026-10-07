# AttendLink

### Smart Wireless & Location-Aware Attendance System

**Tagline:** Smart, Secure & Location-Aware Attendance

---

## Overview

**AttendLink** is a smart digital attendance verification platform that combines modern web architecture with wireless device positioning and location-aware geofencing. Built to eliminate proxy attendance, roll-call fraud, and manual tracking inefficiencies in universities and academic institutions, AttendLink guarantees that attendance records correspond to verified, physical student presence in the designated lecture hall or classroom.

---

## The Problem

Traditional paper sheets, static signatures, and manual roll calls suffer from significant limitations:
- **Proxy Attendance:** Students sign or check in on behalf of absent peers.
- **Attendance Fraud:** Sharing credentials, static links, or unverified forms outside the lecture room.
- **Lost Lecture Time:** Manual roll calls in classes of 50–200 students consume 10–20% of class time.
- **Lack of Real-Time Visibility:** Instructors and academic departments lack instant, verifiable records of student attendance.
- **Inability to Prove Physical Presence:** Standard web portals cannot prove whether a student was actually inside the lecture venue.

---

## The Solution

AttendLink solves these problems through **dynamic geofencing and wireless positioning**:
1. An instructor starts an attendance session from their device inside the lecture hall, creating an anchored geographic coordinate point (latitude/longitude) and setting an allowable radius (e.g. 30–100 meters).
2. Students connect to the session over wireless internet / mobile data via their browser.
3. The student device queries high-accuracy device location coordinates via the Geolocation API.
4. The AttendLink server executes server-side validation using the **Haversine formula** to measure geodesic distance against the instructor's anchor.
5. If the student is strictly within the geofenced perimeter, attendance is committed with a unique constraint per student roll number per session.
6. Instructors monitor real-time attendees and can immediately generate verified PDF and CSV reports.

---

## System Architecture

```
Student Mobile / Laptop Device
              │
              ▼ (Browser Geolocation API: High Accuracy GPS)
       Device Coordinates
              │
              ▼ (Wireless Internet / Mobile 4G/5G Network)
       AttendLink Server (Next.js App Router)
              │
              ▼ (Haversine Formula Calculation)
    Geofence Radius Validation
     [Distance ≤ Allowed Radius?]
         ├── NO  ──► HTTP 400 (Distance Exceeded / Outside Perimeter)
         └── YES ──► Commit Record to PostgreSQL Database
                          │
                          ▼
                   Instructor Console
            (Live Attendance Stream & PDF/CSV Export)
```

### Wireless Communication Systems Perspective
In modern wireless networking and pervasive computing, location-based services (LBS) leverage client-side radio receivers (GNSS/GPS, cellular base station multilateration, and Wi-Fi positioning) exposed via standard W3C Geolocation interfaces. AttendLink demonstrates client-server wireless interaction:
- **RF Capture:** Hardware device radio captures positioning signals.
- **Payload Transmission:** Location parameters transmitted over wireless TCP/IP sockets to the application server.
- **Spatial Verification:** Backend computes spherical distance vectors to enforce access boundaries.

---

## Features

- **Dynamic Geofence Radius:** Instructors configure boundary tolerances (e.g., 30m, 50m, 100m) to fit small classrooms or large auditoriums.
- **Session Lifespans & Timers:** Automated session expiration prevents attendance submissions after lecture start.
- **Manual Session Closure:** Instructors can immediately shut down attendance marking at any moment.
- **Anti-Proxy Protection:**
  - Strict server-side geodesic distance verification.
  - Unique constraint per session roll number prevents double submission.
  - Basic device fingerprint tracking.
- **Live Real-Time Stream:** Automatic polling synchronization updates instructor dashboard in real-time.
- **Instant Report Generation:**
  - One-click formatted **PDF Attendance Report** with session metadata.
  - One-click **CSV Spreadsheet Export** with Excel UTF-8 BOM compatibility.
- **Responsive Mobile & Desktop UI:** Tailored dark-mode UI optimized for both faculty laptops and student smartphones.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16 (App Router, React 19) |
| **Styling** | Tailwind CSS v4 |
| **Backend & APIs** | Next.js Route Handlers (Serverless/Node.js) |
| **ORM & Database** | Prisma ORM with PostgreSQL |
| **Spatial / Geodesic Calculation** | Geolib (Haversine Formula) |
| **Reporting & Export** | jsPDF, jsPDF-AutoTable, csv-writer |
| **Icons & Typography** | React Icons, Geist Font Family |

---

## Project Structure

```
AttendLink/
├── prisma/
│   └── schema.prisma         # Prisma data schema (Session, AttendanceRecord)
├── public/                   # Static assets & icons
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── attendance/   # Server-side geofence validation & record creation
│   │   │   ├── export/[id]/  # CSV export route handler
│   │   │   ├── session/      # Session creation route handler
│   │   │   └── session/[id]/ # Session retrieval & status patch route handler
│   │   ├── professor/        # Faculty dashboard & session console
│   │   ├── student/[sessionId]/ # Student check-in & location verification page
│   │   ├── globals.css       # Global styles & Tailwind configuration
│   │   ├── layout.tsx        # Root HTML layout with AttendLink metadata
│   │   └── page.tsx          # AttendLink landing page & architecture overview
│   └── lib/
│       └── prisma.ts         # Singleton Prisma client instance
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore configuration
├── package.json              # Project dependencies & scripts
├── tsconfig.json             # TypeScript configuration
└── vercel.json               # Deployment configuration
```

---

## Database Schema

```prisma
model Session {
  id            String             @id @default(cuid())
  professorName String
  courseCode    String
  createdAt     DateTime           @default(now())
  isActive      Boolean            @default(true)
  expiresAt     DateTime?
  latitude      Float
  longitude     Float
  radius        Float              @default(50) // in meters
  attendees     AttendanceRecord[]
}

model AttendanceRecord {
  id                String   @id @default(cuid())
  sessionId         String
  session           Session  @relation(fields: [sessionId], references: [id])
  studentName       String
  rollNumber        String
  timestamp         DateTime @default(now())
  latitude          Float?
  longitude         Float?
  deviceFingerprint String?
  
  @@unique([sessionId, rollNumber])
}
```

---

## Setup & Local Development

### Prerequisites
- Node.js 18.x or newer
- npm or yarn
- A PostgreSQL database instance (Neon, Supabase, AWS RDS, or local PostgreSQL)

### 1. Clone the repository
```bash
git clone <YOUR_NEW_REPOSITORY_URL>
cd AttendLink
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the database connection strings in `.env`:
```env
POSTGRES_PRISMA_URL="postgresql://username:password@hostname:5432/attendlink?sslmode=require&pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgresql://username:password@hostname:5432/attendlink?sslmode=require"
```

### 4. Push schema to database
```bash
npx prisma db push
```

### 5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Deployment

### Vercel Deployment
1. Connect the GitHub repository to [Vercel](https://vercel.com).
2. Configure the environment variables in the Vercel dashboard:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
3. The build configuration in `vercel.json` will automatically execute `prisma generate && next build`.

---

## License

This project is licensed under the MIT License.
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->
<!-- attendlink-commit-sync -->

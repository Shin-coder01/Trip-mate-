# TripMate

TripMate is a full-stack budget-based travel planning platform built from the `alagappan567/travel-agency` Next.js codebase and extended with a Spring Boot backend.

Stage 1 is complete here: structure, routes, typography hierarchy, protected frontend flows, backend/API wiring, MySQL schema, seed data, and Docker Compose. Animation and final visual polish are intentionally reserved for later stages.

## Stack

- Frontend: Next.js App Router, React, Tailwind CSS
- Backend: Spring Boot, Spring Security, JWT, WebSocket STOMP
- Database: MySQL
- Design direction: vintage boarding-pass / travel-ticket aesthetic using kraft paper, stamp-red accents, serif headlines, and monospace data labels

## Core Features

- JWT auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Budget planner: `POST /api/planner/suggestions`
- Trips: create, list, join by invite code, view details
- Shared itinerary: add, update, delete trip itinerary items
- Expenses: log expenses and calculate simplified settlements
- Live mode: STOMP WebSocket room per trip at `/ws-trips`
- Seed data: 6 destinations with day-by-day itinerary templates

## Local Setup

### Docker

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- MySQL: localhost:3306, database `tripmate`, user `tripmate`, password `tripmate`

### Manual Development

Start MySQL first with a `tripmate` database and matching credentials, or update `backend/src/main/resources/application.yml`.

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend:

```bash
npm install
npm run dev
```

The frontend expects:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8080/ws-trips
```

## Frontend Routes

- `/` landing and product entry
- `/register` create account
- `/login` authenticate
- `/planner` protected budget planner
- `/trips` protected trip dashboard
- `/trips/[id]` protected shared trip room
- `/invite/[code]` protected invite join flow

## Backend Layout

- `domain`: normalized JPA entities for users, trips, trip members, destinations, itinerary items, expenses, and splits
- `repository`: Spring Data repositories
- `service`: auth, planner, trip collaboration, and expense settlement logic
- `web`: REST controllers and STOMP location controller
- `resources/schema.sql`: MySQL table definitions with foreign keys
- `resources/data.sql`: destination and itinerary seed data

## Notes

The cloned repo's GSAP, Framer Motion, Lenis, Three.js/canvas hero assets, and gallery components are left in place for Stage 2. They are not mounted in Stage 1 so the first pass remains focused on structure and backend functionality.

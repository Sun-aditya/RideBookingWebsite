# RideBooking Monorepo

This repository contains both the RideBooking frontend and backend projects.

## Repository Structure

- Frontend (Vite + React): `./`
- Backend (Node.js + Express + Socket.IO): `./ridebooking-backend`

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB connection string for backend

## Frontend Setup

Run from repository root:

```bash
npm install
npm run dev
```

Frontend default URL (Vite):

- http://localhost:5173

## Backend Setup

Run from `ridebooking-backend` folder:

```bash
cd ridebooking-backend
npm install
cp .env.example .env
# update .env values
npm run dev
```

If `cp` is not available on your system, create `.env` manually using `.env.example` as reference.

Backend default URL:

- http://localhost:5000

## Environment Notes

Backend requires valid values in `.env` for:

- `MONGODB_URI`
- `JWT_SECRET`
- Any other variables used by backend services

Frontend may require API base URL configuration depending on your local setup.

## Run Both Together (Two Terminals)

Terminal 1 (repo root):

```bash
npm run dev
```

Terminal 2 (`ridebooking-backend`):

```bash
npm run dev
```

## Scripts

### Frontend (root)

- `npm run dev` - Start frontend dev server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build

### Backend (`ridebooking-backend`)

- `npm run dev` - Start backend in development mode
- `npm start` - Start backend in production mode (if configured)

## Deployment

Deploy frontend and backend as separate services, or host backend and serve frontend from a static hosting provider.

## License

For personal/academic project usage.

# RideBooking Platform (Frontend + Backend)

RideBooking is a full-stack ride-booking platform with:
- A React + Vite frontend for riders and drivers
- A Node.js + Express + MongoDB backend API
- Socket.IO for real-time ride, location, and chat updates

This repository is a monorepo containing both applications.

## Repository Structure

```text
RideBookinMain/
├── README.md
├── RideBooking/                 # Frontend (React + Vite + Tailwind)
└── ridebooking-backend/         # Backend (Express + MongoDB + Socket.IO)
```

## Tech Stack

Frontend:
- React 18
- Vite 5
- React Router
- Axios
- Tailwind CSS
- Framer Motion
- Socket.IO Client

Backend:
- Node.js
- Express 4
- MongoDB + Mongoose
- JWT authentication
- bcryptjs password hashing
- Socket.IO
- Helmet, CORS, Morgan

## Core Features

Rider features:
- Rider registration and login
- Profile and password management
- Nearby driver discovery
- Fare estimate before booking
- Ride booking and active ride tracking
- Ride cancellation
- Ride history and post-ride ratings
- Real-time driver assignment, status updates, live location, and chat

Driver features:
- Driver registration and login
- Driver profile fetch
- Driver online/offline toggle
- Driver location updates
- Accept rides, status changes, OTP verification, earnings/history APIs
- Real-time request handling and rider chat

Platform features:
- JWT-based auth with role-based route protection
- Geospatial driver location handling
- Ride lifecycle management
- Real-time events for ride progress, location, chat, and SOS

## Application Architecture

1. Frontend sends REST requests to backend under /api.
2. Frontend stores auth token in local storage and sends Bearer token in Axios interceptor.
3. Frontend connects to Socket.IO after login.
4. Backend validates socket auth and maps user-specific rooms.
5. Ride state transitions and location updates are pushed in real time.

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- MongoDB Atlas (or local MongoDB)

## Environment Variables

Backend (ridebooking-backend/.env):

```env
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_make_it_long_random_string
JWT_EXPIRE=7d
NODE_ENV=development
```

Optional but useful backend variable:

```env
CLIENT_URL=http://localhost:5173
```

Frontend (RideBooking/.env):

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

If frontend env vars are not set, defaults are already coded to localhost values above.

## Installation and Run

### 1) Install Frontend

```bash
cd RideBooking
npm install
```

### 2) Install Backend

```bash
cd ../ridebooking-backend
npm install
```

### 3) Configure Environment

- In backend folder, copy .env.example to .env and fill values.
- In frontend folder, create .env only if you want custom API/socket URLs.

Windows PowerShell copy command:

```powershell
Copy-Item .env.example .env
```

### 4) Start Both Apps (2 terminals)

Terminal A (frontend):

```bash
cd RideBooking
npm run dev
```

Terminal B (backend):

```bash
cd ridebooking-backend
npm run dev
```

Default local URLs:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## NPM Scripts

Frontend (RideBooking/package.json):
- npm run dev: start Vite dev server
- npm run build: production build
- npm run preview: preview production build

Backend (ridebooking-backend/package.json):
- npm run dev: start with nodemon
- npm start: start with node

## Frontend Routes

Public:
- /
- /login
- /signup

Rider protected:
- /home
- /book
- /tracking/:rideId
- /history
- /payment

Shared protected (rider + driver):
- /profile

Driver protected:
- /driver/dashboard

## REST API Overview

Health:
- GET /
- GET /api/health

User auth (rider):
- POST /api/auth/user/register
- POST /api/auth/user/login
- GET /api/auth/user/me
- PUT /api/auth/user/update-profile
- PUT /api/auth/user/change-password
- POST /api/auth/user/logout

Driver auth:
- POST /api/auth/driver/register
- POST /api/auth/driver/login
- GET /api/auth/driver/me
- PUT /api/auth/driver/update-location
- PUT /api/auth/driver/toggle-status

Rides (rider-facing):
- GET /api/rides/nearby-drivers
- GET /api/rides/fare-estimate
- POST /api/rides/book
- GET /api/rides/active
- GET /api/rides/history
- GET /api/rides/:id
- PATCH /api/rides/:id/cancel
- POST /api/rides/:id/rate

Driver ride operations:
- GET /api/driver/rides/active
- GET /api/driver/rides/history
- GET /api/driver/rides/earnings
- PATCH /api/driver/rides/:id/accept
- PATCH /api/driver/rides/:id/status
- POST /api/driver/rides/:id/verify-otp

## Socket.IO Events

Client emits commonly used:
- ride:request
- ride:accepted
- ride:status_changed
- ride:cancelled
- ride:otp_verify
- ride:sos
- location:driver_update
- location:rider_update
- location:get_driver
- location:start_tracking
- chat:send_message
- chat:typing
- chat:message_read

Server emits commonly used:
- connected
- ride:new_request
- ride:requested
- ride:driver_assigned
- ride:status_update
- ride:completed
- ride:cancelled
- ride:otp_verified
- ride:otp_error
- location:driver_moved
- location:driver_position
- location:updated
- chat:new_message
- chat:user_typing
- chat:message_seen
- sos:alert
- sos:received

## Data Models

Backend defines these MongoDB models:
- User
- Driver
- Ride
- Payment
- Rating

Highlights:
- Driver model includes geospatial point data and 2dsphere index support.
- Ride model stores lifecycle state, distance, duration, fare, OTP, and cancellation metadata.
- Payment and Rating models support post-ride transactions and feedback.

## Authentication and Authorization

- JWT token is returned on successful login.
- Frontend stores token in local storage and sends it as Bearer token.
- Protected backend routes use auth middleware.
- Role guard logic restricts access for rider and driver routes.

## Error Handling

Backend uses a global error handler and a 404 route fallback.
Typical response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Deployment Notes

- Deploy frontend and backend as separate services.
- Configure CORS and CLIENT_URL for your deployed frontend domain.
- Set production-safe values for NODE_ENV, MONGODB_URI, JWT_SECRET, and JWT_EXPIRE.
- Point frontend VITE_API_URL and VITE_SOCKET_URL to your deployed backend URL.

## Troubleshooting

Common issues:
- 401 Unauthorized in frontend:
  - Token may be expired or invalid. Re-login.
- Frontend cannot reach backend:
  - Check VITE_API_URL and backend PORT.
- Socket not connecting:
  - Check VITE_SOCKET_URL and backend CORS/CLIENT_URL.
- MongoDB connection failure:
  - Validate MONGODB_URI and network access in Atlas.

## Security Notes

- Never commit real .env secrets.
- Rotate JWT secret if exposed.
- Restrict CORS origin in production.

## Future Improvements

- Add automated tests for API and frontend flows
- Add CI/CD pipeline
- Add payment gateway integration
- Add admin panel and moderation tools
- Add stronger observability and metrics

## License

MIT

# RideBooking Backend API

Complete backend infrastructure for the RideFlow ride-booking application built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.io
- **Caching**: Redis (ioredis)
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Validation**: express-validator

## Project Structure

```
ridebooking-backend/
├── config/
│   └── db.js                 # MongoDB connection setup
├── models/
│   ├── User.js              # Rider/Admin user schema
│   ├── Driver.js            # Driver schema with geospatial index
│   ├── Ride.js              # Ride/trip schema
│   ├── Payment.js           # Payment transaction schema
│   └── Rating.js            # Ride rating schema
├── .env                     # Environment variables (local)
├── .env.example             # Template for .env
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── server.js                # Express app setup and entry point
└── README.md                # This file
```

## Installation

1. **Clone the repository**
   ```bash
   cd ridebooking-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   - Copy `.env.example` to `.env`
   - Add your MongoDB Atlas connection string
   - Generate a strong JWT secret
   - Set the port (default: 5000)

   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ridebooking
   PORT=5000
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

## Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /` - Root endpoint returns API status
- `GET /api/health` - API health check with uptime

## Database Models

### User Model
- Full name, email, phone (unique)
- Password (hashed with bcryptjs)
- Role: rider or admin
- Email verification with OTP
- Saved places (home, work, etc.)
- Wallet system with balance tracking
- Ride statistics and ratings
- Timestamps

**Methods**:
- `matchPassword(password)` - Compare entered password with hash
- `generateJWT()` - Create JWT token valid for 7 days

### Driver Model
- Full name, email, phone (unique)
- Password (hashed)
- Approval status by admin
- Online/offline status
- Current location (GeoJSON Point for geospatial queries)
- Vehicle details (make, model, year, plate, type)
- Documents (license, insurance, registration, background check)
- Earnings tracking and ratings
- Availability status
- **2dsphere geospatial index** for location-based queries
- Timestamps

**Methods**:
- `matchPassword(password)` - Compare password
- `generateJWT()` - Create JWT token

### Ride Model
- Rider and driver references
- Pickup and drop locations with coordinates
- Vehicle type selection
- Status tracking: requested → accepted → driver_arriving → in_progress → completed/cancelled
- Fare calculation (base + distance + time + surge)
- Distance and duration (estimated and actual)
- Payment method and status
- OTP for ride verification
- Cancellation tracking (by rider/driver/system)
- Start and end timestamps
- Indexes on frequently queried fields (rider, driver, status)

### Payment Model
- Ride reference
- Rider and driver IDs
- Amount and currency
- Payment method (cash, card, wallet)
- Status: pending → completed/failed/refunded
- Transaction ID from payment gateway
- Gateway response object
- Refund tracking with reason
- Timestamps

### Rating Model
- Ride reference
- Rater and rated person IDs
- Rater and rated person types (rider/driver)
- Rating: 1-5 stars
- Optional comment up to 500 characters
- Timestamps

## Database Indexes

Optimized indexes for performance:

**User**: email, phone, role
**Driver**: email, phone, isApproved, isAvailable, currentLocation (2dsphere)
**Ride**: rider, driver, status, createdAt, paymentStatus
**Payment**: ride, rider, driver, status, createdAt
**Rating**: ride, ratedBy, ratedTo, ratedByType, ratedToType, createdAt

## Security Features

- Helmet.js for HTTP headers security
- CORS enabled for cross-origin requests
- Password hashing with bcryptjs (10 salt rounds)
- JWT-based authentication
- Environment variables for sensitive data
- Input validation with express-validator
- Global error handling with stack traces in development

## Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=a_very_long_random_secret_string_at_least_32_characters
JWT_EXPIRE=7d
```

## Error Handling

The API returns standardized JSON error responses:

```json
{
  "success": false,
  "message": "Error description",
  "stack": "Stack trace (development only)"
}
```

## Development Notes

- Models are automatically imported and registered in Mongoose on server startup
- Geospatial indexing on Driver location allows nearby driver queries
- Pre-save hooks ensure passwords are always hashed before storage
- Timestamps (createdAt, updatedAt) are automatically managed by Mongoose

## Next Steps

1. Create route controllers for:
   - Authentication (register, login, refresh token)
   - User profile management
   - Driver management and approval
   - Ride booking and tracking
   - Payment processing
   - Rating and reviews

2. Implement WebSocket handlers with Socket.io for:
   - Real-time ride updates
   - Live driver location tracking
   - Chat messaging

3. Add Redis caching for:
   - Active driver locations
   - Frequent queries (user profile, ride history)
   - Session management

4. Setup payment gateway integration (Stripe, Razorpay)

5. Add email/SMS notifications

## License

MIT

## Author

Your Name

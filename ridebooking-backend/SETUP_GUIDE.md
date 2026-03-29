# Backend Setup Guide

## 📦 What Was Created

A complete production-ready backend infrastructure for the RideFlow ride-booking app with:

### File Structure Created:
```
ridebooking-backend/
├── config/
│   └── db.js                    # MongoDB Atlas Connection
├── models/
│   ├── User.js                  # User/Rider Schema (2 indexes)
│   ├── Driver.js                # Driver Schema (2dsphere index for geolocation)
│   ├── Ride.js                  # Ride Schema (5 indexes)
│   ├── Payment.js               # Payment Transaction Schema (5 indexes)
│   └── Rating.js                # Review Rating Schema (6 indexes)
├── node_modules/                # Dependencies (185 packages)
├── .env                         # Environment variables
├── .env.example                 # Template for .env
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies & scripts
├── server.js                    # Express server & middleware
├── README.md                    # Full documentation
└── SETUP_GUIDE.md              # This file
```

## 🚀 Quick Start

### 1. Navigate to Backend Directory
```bash
cd ridebooking-backend
```

### 2. Install Dependencies (if not done)
```bash
npm install
```

### 3. Configure Environment Variables
Edit `.env` with your MongoDB Atlas credentials:
```env
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/ridebooking?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_long_random_secret_key_at_least_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
```

### 4. Start Development Server
```bash
npm run dev
```

Server starts on: `http://localhost:5000`

## 📊 Database Schemas

### User Model
```javascript
{
  fullName: String,           // Required, min 3 chars
  email: String,              // Required, unique
  phone: String,              // Required, unique, min 10 digits
  password: String,           // Hashed with bcryptjs
  avatar: String,
  role: 'rider' | 'admin',
  isVerified: Boolean,
  otp: String,                // For email verification
  otpExpire: Date,
  savedPlaces: [{
    label: String,            // Home, Work, etc.
    address: String,
    coordinates: { lat, lng }
  }],
  wallet: {
    balance: Number,          // Min 0
    currency: 'INR'
  },
  totalRides: Number,         // Min 0
  averageRating: Number,      // 0-5
  createdAt: Date,
  updatedAt: Date
}
```

**Instance Methods**:
- `matchPassword(password)` → Boolean (async)
- `generateJWT()` → String

**Indexes**: email, phone, role

---

### Driver Model
```javascript
{
  fullName: String,
  email: String,              // Required, unique
  phone: String,              // Required, unique
  password: String,           // Hashed
  avatar: String,
  role: 'driver',             // Immutable
  isVerified: Boolean,
  isApproved: Boolean,        // Admin approval
  isOnline: Boolean,
  currentLocation: {
    type: 'Point',            // GeoJSON format
    coordinates: [lng, lat]   // Longitude first!
  },
  vehicle: {
    make: String,
    model: String,
    year: Number,
    color: String,
    plateNumber: String,
    type: 'UberX'|'Comfort'|'XL'|'Black'
  },
  documents: {
    license: String,
    insurance: String,
    registration: String,
    backgroundCheck: String
  },
  wallet: {
    balance: Number,
    currency: 'INR'
  },
  totalRides: Number,         // Min 0
  totalEarnings: Number,      // Min 0
  averageRating: Number,      // 1-5
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Instance Methods**: Same as User (matchPassword, generateJWT)

**Indexes**: 
- currentLocation (2dsphere) — for nearby driver queries
- email, phone, isApproved, isAvailable

---

### Ride Model
```javascript
{
  rider: ObjectId → User,     // Required
  driver: ObjectId → Driver,  // Assigned when accepted
  pickupLocation: {
    address: String,
    coordinates: { lat, lng }
  },
  dropLocation: {
    address: String,
    coordinates: { lat, lng }
  },
  vehicleType: 'UberX'|'Comfort'|'XL'|'Black',
  status: 'requested'|'accepted'|'driver_arriving'|'in_progress'|'completed'|'cancelled',
  fare: {
    baseFare: Number,
    distanceFare: Number,
    timeFare: Number,
    surgeMultiplier: Number,  // Min 1
    totalFare: Number,
    currency: 'INR'
  },
  distance: Number,           // km
  duration: Number,           // minutes (estimated)
  actualDuration: Number,     // minutes (actual)
  paymentMethod: 'cash'|'card'|'wallet',
  paymentStatus: 'pending'|'completed'|'failed'|'refunded',
  otp: String,                // 4-digit verification
  cancelledBy: 'rider'|'driver'|'system',
  cancellationReason: String,
  startTime: Date,
  endTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: rider, driver, status, createdAt, paymentStatus

---

### Payment Model
```javascript
{
  ride: ObjectId → Ride,      // Required
  rider: ObjectId → User,     // Required
  driver: ObjectId → Driver,  // Required
  amount: Number,             // Min 0
  currency: 'INR',
  method: 'cash'|'card'|'wallet',
  status: 'pending'|'completed'|'failed'|'refunded',
  transactionId: String,      // From payment gateway
  gatewayResponse: Object,    // Raw response
  refundAmount: Number,       // Min 0
  refundReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: ride, rider, driver, status, createdAt

---

### Rating Model
```javascript
{
  ride: ObjectId → Ride,      // Required
  ratedBy: ObjectId,          // User or Driver ID
  ratedTo: ObjectId,          // User or Driver ID
  ratedByType: 'rider'|'driver',
  ratedToType: 'rider'|'driver',
  rating: Number,             // 1-5 (required)
  comment: String,            // Max 500 chars
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: ride, ratedBy, ratedTo, ratedByType, ratedToType, createdAt

---

## 🔐 Security Features

✅ **Helmet.js** - HTTP headers hardening
✅ **CORS** - Cross-origin request handling
✅ **bcryptjs** - Password hashing (10 salt rounds)
✅ **JWT** - Token-based authentication (7 day expiry)
✅ **dotenv** - Secure environment variable management
✅ **express-validator** - Input validation & sanitization
✅ **Global error handler** - Standardized JSON responses
✅ **morgan** - HTTP request logging

## 📡 API Endpoints (Basic)

```
GET  /                    # API health check
GET  /api/health         # Health status with uptime
```

## 🔧 Scripts

```bash
npm run dev    # Start with auto-reload (recommended for development)
npm start      # Start production server
npm install    # Install dependencies
```

## 🗄️ Database Queries Examples

### Connect to MongoDB Atlas
```javascript
// Already configured in config/db.js
// Automatically runs on server startup
```

### Query Examples (to use in controllers)
```javascript
const User = require('./models/User');
const Driver = require('./models/Driver');
const Ride = require('./models/Ride');

// Find users
const user = await User.findById(userId);
const userByEmail = await User.findOne({ email });

// Find drivers near a location (2dsphere index)
const nearbyDrivers = await Driver.find({
  currentLocation: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [lng, lat]  // Longitude first!
      },
      $maxDistance: 5000  // 5km in meters
    }
  },
  isAvailable: true
});

// Find rides with population
const rides = await Ride.find({ rider: userId })
  .populate('driver', 'fullName vehicle')
  .sort({ createdAt: -1 });

// Create ride
const ride = await Ride.create({
  rider: userId,
  vehicleType: 'UberX',
  pickupLocation: { address, coordinates },
  dropLocation: { address, coordinates }
});
```

## 🚨 Error Handling

All errors return JSON:
```json
{
  "success": false,
  "message": "Error description",
  "stack": "Stack trace (development only)"
}
```

## 📝 Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `MONGODB_URI` | mongodb+srv://... | MongoDB Atlas connection string |
| `PORT` | 5000 | Server port |
| `JWT_SECRET` | random_key_32_chars+ | Secret for signing JWT tokens |
| `JWT_EXPIRE` | 7d | Token expiration time |
| `NODE_ENV` | development | Environment mode |

## 🔗 MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create account and new cluster
3. Create database user with password
4. Whitelist your IP or use 0.0.0.0 (allows all)
5. Get connection string and add to `.env`
6. Done! Server will connect on startup

## ✅ Validation Checklist

- [x] All 5 models created with proper schemas
- [x] Password hashing implemented (bcryptjs)
- [x] JWT token generation implemented
- [x] Geospatial indexing on Driver location
- [x] All required indexes added
- [x] Express server with middleware setup
- [x] Global error handler
- [x] CORS and Helmet security
- [x] Environment variables configured
- [x] Models auto-registered on startup
- [x] Dependencies installed successfully
- [x] Syntax validation passed

## 📚 Next Steps

### Create Routes
1. `routes/auth.js` - User registration, login, logout
2. `routes/rides.js` - Ride booking, tracking, history
3. `routes/drivers.js` - Driver management, approval
4. `routes/payments.js` - Payment processing
5. `routes/ratings.js` - Ride ratings

### Add Controllers
- `controllers/authController.js`
- `controllers/rideController.js`
- `controllers/driverController.js`
- `controllers/paymentController.js`

### Add Middleware
- `middleware/auth.js` - JWT verification
- `middleware/validators.js` - Input validation

### Integrate
- Payment gateway (Stripe/Razorpay)
- Email service (nodemailer)
- SMS service (Twilio)
- Redis caching
- WebSocket for real-time updates

## 🐛 Debugging

### Check MongoDB connection
```bash
# In server.js output, look for:
✓ MongoDB Atlas Connected: cluster-xxx.mongodb.net
```

### Check models registered
```bash
# In server.js output, look for:
✓ Registered Mongoose Models:
  - User
  - Driver
  - Ride
  - Payment
  - Rating
```

### Test API
```bash
curl http://localhost:5000
# Should return:
# {"success":true,"message":"RideBooking API is running","version":"1.0.0"}
```

## 📞 Support

For issues:
1. Check MongoDB credentials in `.env`
2. Ensure MongoDB Atlas network access is configured
3. Check node version (v14+ recommended)
4. Check npm logs: `npm logs`
5. Review `.gitignore` — don't commit `.env`!

---

**Happy coding! 🎉**

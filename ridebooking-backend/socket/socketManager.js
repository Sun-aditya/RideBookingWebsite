/*
RIDER EMITS:
  ride:request          -> notify driver of new ride
  ride:cancelled        -> cancel the ride
  ride:sos              -> emergency alert
  ride:otp_verify       -> verify OTP (actually driver emits this)
  location:rider_update -> update rider position
  location:get_driver   -> get driver's current position
  location:start_tracking -> start tracking driver
  chat:send_message     -> send chat message
  chat:typing           -> typing indicator

DRIVER EMITS:
  ride:accepted         -> accept a ride request
  ride:status_changed   -> update ride status
  location:driver_update -> update driver position (every 3-5s)
  chat:send_message     -> send chat message
  chat:typing           -> typing indicator

SERVER EMITS TO RIDER:
  connected             -> connection confirmed
  ride:requested        -> ride booking confirmed
  ride:driver_assigned  -> driver found and assigned
  ride:status_update    -> any ride status change
  ride:completed        -> ride finished with fare summary
  ride:cancelled        -> ride cancelled
  location:driver_moved -> driver moved (live tracking)
  location:driver_position -> driver's current location
  chat:new_message      -> incoming chat message
  chat:user_typing      -> typing indicator
  sos:received          -> SOS alert acknowledged

SERVER EMITS TO DRIVER:
  connected             -> connection confirmed
  ride:new_request      -> new ride available to accept
  ride:status_update    -> ride status changed
  ride:otp_verified     -> OTP correct, start ride
  ride:otp_error        -> wrong OTP
  location:updated      -> location update acknowledged
  location:tracking_started -> rider started tracking
  chat:new_message      -> incoming chat message
  chat:user_typing      -> typing indicator
*/

const { Server } = require("socket.io");
const socketAuthMiddleware = require("./middlewares/socketAuth");
const rideHandler = require("./handlers/rideHandler");
const locationHandler = require("./handlers/locationHandler");
const chatHandler = require("./handlers/chatHandler");
const Ride = require("../models/Ride");
const Driver = require("../models/Driver");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(socketAuthMiddleware);

  const riderNamespace = io.of("/rider");
  const driverNamespace = io.of("/driver");

  riderNamespace.use(socketAuthMiddleware);
  driverNamespace.use(socketAuthMiddleware);

  const connectedRiders = new Map();
  const connectedDrivers = new Map();

  const getConnectedDriverSocket = (driverId) => connectedDrivers.get(driverId.toString()) || null;

  const getConnectedRiderSocket = (riderId) => connectedRiders.get(riderId.toString()) || null;

  const emitToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
  };

  const registerConnection = (socket, source = "main") => {
    console.log(
      `Socket connected: ${socket.id} | User: ${socket.userId} | Role: ${socket.role} | Source: ${source}`
    );

    if (socket.role === "rider") {
      connectedRiders.set(socket.userId, socket.id);
    } else if (socket.role === "driver") {
      connectedDrivers.set(socket.userId, socket.id);
    }

    socket.join(`user_${socket.userId}`);
    socket.emit("connected", {
      message: "Connected to RideBooking real-time server",
      userId: socket.userId,
      role: socket.role,
    });

    rideHandler(io, socket, connectedRiders, connectedDrivers);
    locationHandler(io, socket, connectedRiders, connectedDrivers);
    chatHandler(io, socket, connectedRiders, connectedDrivers);

    socket.on("disconnect", async (reason) => {
      try {
        console.log(`Socket disconnected: ${socket.id} | User: ${socket.userId} | Reason: ${reason}`);

        if (socket.role === "rider") {
          connectedRiders.delete(socket.userId);
        } else if (socket.role === "driver") {
          connectedDrivers.delete(socket.userId);

          await Driver.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            isAvailable: false,
          });

          const activeRide = await Ride.findOne({
            driver: socket.userId,
            status: { $in: ["accepted", "driver_arriving", "in_progress"] },
          }).select("_id");

          if (activeRide) {
            io.to(`ride_${activeRide._id}`).emit("driver_disconnected", {
              rideId: activeRide._id,
              message: "Driver disconnected from real-time service",
              timestamp: new Date(),
            });
          }
        }
      } catch (error) {
        console.log("Socket disconnect cleanup error:", error.message);
      }
    });
  };

  io.on("connection", (socket) => registerConnection(socket, "main"));

  riderNamespace.on("connection", (socket) => registerConnection(socket, "rider_namespace"));

  driverNamespace.on("connection", (socket) => registerConnection(socket, "driver_namespace"));

  return {
    io,
    connectedRiders,
    connectedDrivers,
    getConnectedDriverSocket,
    getConnectedRiderSocket,
    emitToUser,
  };
};

module.exports = initializeSocket;

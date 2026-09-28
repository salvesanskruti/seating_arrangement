require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const roomRoutes = require("./routes/roomRoutes");
const studentRoutes = require("./routes/studentRoutes");
const seatingRoutes = require("./routes/seatingRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/seating", seatingRoutes);

// Fallback 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

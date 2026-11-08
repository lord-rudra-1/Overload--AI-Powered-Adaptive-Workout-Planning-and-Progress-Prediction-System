require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const exerciseRoutes = require("./routes/exercises");
const workoutRoutes = require("./routes/workouts");
const performanceRoutes = require("./routes/performance");
const analyticsRoutes = require("./routes/analytics");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error.",
  });
});

const PORT = parseInt(process.env.PORT, 10) || 5001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Overload server running on http://localhost:${PORT}`);
  });
}

module.exports = app;

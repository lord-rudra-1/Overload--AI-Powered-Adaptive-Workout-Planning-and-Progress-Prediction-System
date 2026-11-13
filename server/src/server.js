require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Download genuine animated GIFs directly from source CDN
async function ensureAnimatedGifs() {
  const targetDir = path.resolve(__dirname, "../../client/public/images");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy user uploaded anime lifter & auth background image
  try {
    const uploadDir = "C:/Users/divya/.gemini/antigravity/brain/a97f9f0d-923a-4289-a26c-1a22a4bd6b7c/.user_uploaded";
    const lifterSrc = path.join(uploadDir, "media_1794578203685_f1474d84.png");
    const lifterDst = path.join(targetDir, "anime-lifter.png");
    if (fs.existsSync(lifterSrc)) {
      fs.copyFileSync(lifterSrc, lifterDst);
      console.log("✅ Synced anime-lifter.png to client assets");
    }

    const authBgSrc = path.join(uploadDir, "media_1794578884635_a367e488.jpg");
    const authBgDst = path.join(targetDir, "auth-bg.jpg");
    if (fs.existsSync(authBgSrc)) {
      fs.copyFileSync(authBgSrc, authBgDst);
      console.log("✅ Synced auth-bg.jpg to client assets");
    }
  } catch (err) {
    console.warn("Notice syncing images:", err.message);
  }

  const items = [
    {
      name: "goku-stretch.gif",
      url: "https://media.tenor.com/EYwxFtU_sNsAAAAC/goku-warm-up.gif",
    },
    {
      name: "goku-boots.gif",
      url: "https://media.tenor.com/aqXWxPCQlEkAAAAC/goku-training-in-space-goku.gif",
    },
    {
      name: "goku-shadowbox.gif",
      url: "https://media.tenor.com/6ny1xegsDQAAAAAC/goku-ultra-instinct-ultra-instinct-goku.gif",
    },
  ];

  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      });
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        const header = buffer.subarray(0, 6).toString("ascii");
        if (header.startsWith("GIF")) {
          fs.writeFileSync(path.join(targetDir, item.name), buffer);
          console.log(`✅ Loaded animated ${item.name} (${buffer.length} bytes)`);
        }
      }
    } catch (err) {
      console.warn(`Notice loading ${item.name}:`, err.message);
      }
    }
  }
  ensureAnimatedGifs();

  const { seedMonthHistory } = require("./scripts/seedMonthData");
  seedMonthHistory();

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

// Root & Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Overload Backend API is running. Access the web interface at http://localhost:5173",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

// One-click endpoint to seed/refresh 1-month active history
app.all("/api/seed-history", async (req, res) => {
  try {
    await seedMonthHistory();
    res.json({ success: true, message: "1-month active training history generated for all users!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/database");
const routes = require("./routes");

/**
 * Google Drive Clone - Backend Server
 * A simplified drive application with file upload, folders, sharing, and versioning
 */

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory");
}

// Connect to MongoDB
connectDB();

// ===================
// MIDDLEWARE
// ===================

// CORS - Allow frontend to access API
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://google-drive-vert.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory (for file preview)
app.use("/uploads", express.static(uploadsDir));

// Request logging (simple version)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===================
// ROUTES
// ===================

// API routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Google Drive Clone API",
    version: "1.0.0",
    endpoints: {
      files: "/api/files",
      folders: "/api/folders",
      share: "/api/share",
      versions: "/api/versions",
      health: "/api/health",
    },
  });
});

// ===================
// ERROR HANDLING
// ===================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 50MB",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ===================
// START SERVER
// ===================

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   🚀 Google Drive Clone API Server               ║
  ║                                                   ║
  ║   Server running on: http://localhost:${PORT}       ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);
});

module.exports = app;

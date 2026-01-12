const express = require("express");
const router = express.Router();

const fileRoutes = require("./fileRoutes");
const folderRoutes = require("./folderRoutes");
const shareRoutes = require("./shareRoutes");
const versionRoutes = require("./versionRoutes");
const aiRoutes = require("./aiRoutes"); // AI/RAG integration routes
const featuresRoutes = require("./featuresRoutes"); // Starred, Trash, Analytics, Preview

/**
 * Main Router
 * Combines all route modules
 */

// Mount route modules
router.use("/files", fileRoutes);
router.use("/folders", folderRoutes);
router.use("/share", shareRoutes);
router.use("/versions", versionRoutes);
router.use("/ai", aiRoutes); // AI endpoints for RAG features
router.use("/features", featuresRoutes); // Starred, Trash, Analytics, Preview features

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Google Drive Clone API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

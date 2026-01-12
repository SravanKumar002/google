const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { versionController } = require("../controllers");

/**
 * Multer Configuration for Version Upload
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

/**
 * Version Routes
 * Base path: /api/versions
 */

// GET /api/versions/:fileId - Get version history for a file
router.get("/:fileId", versionController.getVersionHistory);

// POST /api/versions/:fileId - Upload a new version
router.post(
  "/:fileId",
  upload.single("file"),
  versionController.uploadNewVersion
);

// GET /api/versions/:fileId/:versionNumber/download - Download a specific version
router.get(
  "/:fileId/:versionNumber/download",
  versionController.downloadVersion
);

// POST /api/versions/:fileId/:versionNumber/restore - Restore a previous version
router.post(
  "/:fileId/:versionNumber/restore",
  versionController.restoreVersion
);

module.exports = router;

const express = require("express");
const router = express.Router();
const { shareController } = require("../controllers");

/**
 * Share Routes
 * Base path: /api/share
 */

// POST /api/share/:fileId/enable - Enable sharing and generate link
router.post("/:fileId/enable", shareController.enableSharing);

// POST /api/share/:fileId/disable - Disable sharing
router.post("/:fileId/disable", shareController.disableSharing);

// GET /api/share/:fileId/status - Get share status for a file
router.get("/:fileId/status", shareController.getShareStatus);

// GET /api/share/:shareLink - Access a shared file (public)
router.get("/:shareLink", shareController.accessSharedFile);

// GET /api/share/:shareLink/download - Download a shared file (public)
router.get("/:shareLink/download", shareController.downloadSharedFile);

module.exports = router;

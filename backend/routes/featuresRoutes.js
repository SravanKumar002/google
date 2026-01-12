/**
 * Features Routes
 * Routes for starred files, trash, analytics, preview, and tags
 */

const express = require("express");
const router = express.Router();
const {
  // Starred
  getStarredFiles,
  toggleStar,
  // Trash
  getTrash,
  moveToTrash,
  restoreFromTrash,
  permanentDelete,
  emptyTrash,
  autoCleanupTrash,
  // Analytics
  getStorageAnalytics,
  // Preview
  getFilePreview,
  // Tags
  updateTags,
  getFilesByTag,
  getAllTags,
  // Recent
  getRecentFiles,
  // Search
  searchFilesAndFolders,
} = require("../controllers/featuresController");

// ============================================================================
// SEARCH
// ============================================================================
router.get("/search", searchFilesAndFolders);

// ============================================================================
// STARRED FILES
// ============================================================================
router.get("/starred", getStarredFiles);
router.patch("/star/:id", toggleStar);

// ============================================================================
// TRASH / RECYCLE BIN
// ============================================================================
router.get("/trash", getTrash);
router.patch("/trash/:id", moveToTrash);
router.patch("/restore/:id", restoreFromTrash);
router.delete("/trash/:id", permanentDelete);
router.delete("/trash", emptyTrash);
router.post("/trash/cleanup", autoCleanupTrash);

// ============================================================================
// STORAGE ANALYTICS
// ============================================================================
router.get("/analytics", getStorageAnalytics);

// ============================================================================
// FILE PREVIEW
// ============================================================================
router.get("/preview/:id", getFilePreview);

// ============================================================================
// TAGS
// ============================================================================
router.get("/tags", getAllTags);
router.get("/tags/:tag", getFilesByTag);
router.patch("/tags/:id", updateTags);

// ============================================================================
// RECENT FILES
// ============================================================================
router.get("/recent", getRecentFiles);

module.exports = router;

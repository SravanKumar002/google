const express = require("express");
const router = express.Router();
const { folderController } = require("../controllers");

/**
 * Folder Routes
 * Base path: /api/folders
 */

// GET /api/folders - Get all folders (optional query: parentFolder)
router.get("/", folderController.getFolders);

// GET /api/folders/:id - Get a specific folder with its contents
router.get("/:id", folderController.getFolderById);

// GET /api/folders/:id/breadcrumb - Get folder breadcrumb path
router.get("/:id/breadcrumb", folderController.getFolderBreadcrumb);

// POST /api/folders - Create a new folder
router.post("/", folderController.createFolder);

// PATCH /api/folders/:id - Rename a folder
router.patch("/:id", folderController.renameFolder);

// DELETE /api/folders/:id - Delete a folder and its contents
router.delete("/:id", folderController.deleteFolder);

module.exports = router;

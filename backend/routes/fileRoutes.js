const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { fileController } = require("../controllers");

/**
 * Multer Configuration for File Upload
 * Stores files in the 'uploads' directory with unique names
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomnumber-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// File filter - allow common file types
const fileFilter = (req, file, cb) => {
  // Allow all file types for this simplified version
  // You can restrict to specific types if needed
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

/**
 * File Routes
 * Base path: /api/files
 */

// GET /api/files/drive - Get drive contents (folders and files)
router.get("/drive", fileController.getDriveContents);

// GET /api/files - Get all files (optional query: folder)
router.get("/", fileController.getFiles);

// GET /api/files/:id - Get a specific file
router.get("/:id", fileController.getFileById);

// GET /api/files/:id/download - Download a file
router.get("/:id/download", fileController.downloadFile);

// POST /api/files - Upload a new file
router.post("/", upload.single("file"), fileController.uploadFile);

// PATCH /api/files/:id/move - Move a file to a different folder
router.patch("/:id/move", fileController.moveFile);

// PATCH /api/files/:id/rename - Rename a file
router.patch("/:id/rename", fileController.renameFile);

// DELETE /api/files/:id - Delete a file
router.delete("/:id", fileController.deleteFile);

module.exports = router;

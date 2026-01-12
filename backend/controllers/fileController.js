const fs = require("fs");
const path = require("path");
const { File, FileVersion, Folder } = require("../models");
const { nanoid } = require("nanoid");

/**
 * File Controller
 * Handles all file-related operations including upload, download, and management
 */

// Uploads directory path
const uploadsDir = path.join(__dirname, "..", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Get all files at root level or within a specific folder
 * GET /api/files?folder=<folderId>
 */
const getFiles = async (req, res) => {
  try {
    const { folder } = req.query;

    const query = {
      folder: folder || null,
      isDeleted: { $ne: true }, // Exclude trashed files
    };

    const files = await File.find(query).sort({ originalName: 1 }).lean();

    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch files",
      error: error.message,
    });
  }
};

/**
 * Get a single file by ID
 * GET /api/files/:id
 */
const getFileById = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id).populate("folder", "name path").lean();

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.json({
      success: true,
      data: file,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch file",
      error: error.message,
    });
  }
};

/**
 * Upload a new file
 * POST /api/files
 * Body: multipart/form-data with 'file' field and optional 'folder' field
 */
const uploadFile = async (req, res) => {
  try {
    // Check if file was provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    const { folder } = req.body;

    // Verify folder exists if provided
    if (folder) {
      const folderExists = await Folder.findById(folder);
      if (!folderExists) {
        // Delete uploaded file if folder doesn't exist
        fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          message: "Target folder not found",
        });
      }
    }

    // Extract file extension
    const extension = path.extname(req.file.originalname).toLowerCase();

    // Create file record
    const file = new File({
      originalName: req.file.originalname,
      currentFileName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extension: extension,
      folder: folder || null,
      currentVersion: 1,
      sharing: {
        isShared: false,
        shareLink: null,
        sharedAt: null,
      },
    });

    await file.save();

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: file,
    });
  } catch (error) {
    console.error("Error uploading file:", error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error.message,
    });
  }
};

/**
 * Download a file
 * GET /api/files/:id/download
 */
const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const filePath = path.join(uploadsDir, file.currentFileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    // Set headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`
    );
    res.setHeader("Content-Type", file.mimeType);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download file",
      error: error.message,
    });
  }
};

/**
 * Move a file to a different folder
 * PATCH /api/files/:id/move
 * Body: { targetFolder: string | null }
 */
const moveFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetFolder } = req.body;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Verify target folder exists (if not moving to root)
    if (targetFolder) {
      const folderExists = await Folder.findById(targetFolder);
      if (!folderExists) {
        return res.status(404).json({
          success: false,
          message: "Target folder not found",
        });
      }
    }

    // Check for duplicate filename in target location
    const duplicate = await File.findOne({
      originalName: file.originalName,
      folder: targetFolder || null,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "A file with this name already exists in the target folder",
      });
    }

    // Move the file
    file.folder = targetFolder || null;
    await file.save();

    res.json({
      success: true,
      message: "File moved successfully",
      data: file,
    });
  } catch (error) {
    console.error("Error moving file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to move file",
      error: error.message,
    });
  }
};

/**
 * Rename a file
 * PATCH /api/files/:id/rename
 * Body: { name: string }
 */
const renameFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "File name is required",
      });
    }

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Keep the original extension
    const newName = name.trim().includes(".")
      ? name.trim()
      : `${name.trim()}${file.extension}`;

    // Check for duplicate in same folder
    const duplicate = await File.findOne({
      originalName: newName,
      folder: file.folder,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "A file with this name already exists in this folder",
      });
    }

    file.originalName = newName;
    await file.save();

    res.json({
      success: true,
      message: "File renamed successfully",
      data: file,
    });
  } catch (error) {
    console.error("Error renaming file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to rename file",
      error: error.message,
    });
  }
};

/**
 * Delete a file
 * DELETE /api/files/:id
 */
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Delete current file from storage
    const currentFilePath = path.join(uploadsDir, file.currentFileName);
    if (fs.existsSync(currentFilePath)) {
      fs.unlinkSync(currentFilePath);
    }

    // Delete all versions from storage
    const versions = await FileVersion.find({ file: id });
    for (const version of versions) {
      const versionPath = path.join(uploadsDir, version.fileName);
      if (fs.existsSync(versionPath)) {
        fs.unlinkSync(versionPath);
      }
    }

    // Delete versions from database
    await FileVersion.deleteMany({ file: id });

    // Delete file record
    await File.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: error.message,
    });
  }
};

/**
 * Get drive contents (folders and files) at root or in a folder
 * GET /api/files/drive?folder=<folderId>
 */
const getDriveContents = async (req, res) => {
  try {
    const { folder } = req.query;

    const query = folder
      ? { $or: [{ parentFolder: folder }, { folder: folder }] }
      : null;

    const [folders, files] = await Promise.all([
      Folder.find({ parentFolder: folder || null })
        .sort({ name: 1 })
        .lean(),
      File.find({ folder: folder || null, isDeleted: { $ne: true } })
        .sort({ originalName: 1 })
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        folders,
        files,
        currentFolder: folder || null,
      },
    });
  } catch (error) {
    console.error("Error fetching drive contents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch drive contents",
      error: error.message,
    });
  }
};

module.exports = {
  getFiles,
  getFileById,
  uploadFile,
  downloadFile,
  moveFile,
  renameFile,
  deleteFile,
  getDriveContents,
};

const fs = require("fs");
const path = require("path");
const { File, FileVersion } = require("../models");

/**
 * Version Controller
 * Handles file versioning - updating files while preserving history
 */

const uploadsDir = path.join(__dirname, "..", "uploads");

/**
 * Upload a new version of an existing file
 * POST /api/versions/:fileId
 * Body: multipart/form-data with 'file' field
 */
const uploadNewVersion = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Check if file was provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    // Find the existing file
    const existingFile = await File.findById(fileId);

    if (!existingFile) {
      // Delete uploaded file if original doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Save current version to history before updating
    const versionRecord = new FileVersion({
      file: existingFile._id,
      versionNumber: existingFile.currentVersion,
      fileName: existingFile.currentFileName,
      originalName: existingFile.originalName,
      size: existingFile.size,
      mimeType: existingFile.mimeType,
    });

    await versionRecord.save();

    // Update the file with new version info
    const extension = path.extname(req.file.originalname).toLowerCase();

    existingFile.currentFileName = req.file.filename;
    existingFile.originalName = req.file.originalname;
    existingFile.mimeType = req.file.mimetype;
    existingFile.size = req.file.size;
    existingFile.extension = extension;
    existingFile.currentVersion += 1;

    await existingFile.save();

    res.json({
      success: true,
      message: `File updated to version ${existingFile.currentVersion}`,
      data: {
        file: existingFile,
        previousVersion: versionRecord,
      },
    });
  } catch (error) {
    console.error("Error uploading new version:", error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Failed to upload new version",
      error: error.message,
    });
  }
};

/**
 * Get version history for a file
 * GET /api/versions/:fileId
 */
const getVersionHistory = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get the current file
    const currentFile = await File.findById(fileId).lean();

    if (!currentFile) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Get all previous versions
    const versions = await FileVersion.find({ file: fileId })
      .sort({ versionNumber: -1 })
      .lean();

    // Combine current version with history
    const allVersions = [
      {
        _id: "current",
        versionNumber: currentFile.currentVersion,
        fileName: currentFile.currentFileName,
        originalName: currentFile.originalName,
        size: currentFile.size,
        mimeType: currentFile.mimeType,
        createdAt: currentFile.updatedAt,
        isCurrent: true,
      },
      ...versions.map((v) => ({
        ...v,
        isCurrent: false,
      })),
    ];

    res.json({
      success: true,
      data: {
        fileId: fileId,
        fileName: currentFile.originalName,
        currentVersion: currentFile.currentVersion,
        versions: allVersions,
      },
    });
  } catch (error) {
    console.error("Error fetching version history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch version history",
      error: error.message,
    });
  }
};

/**
 * Download a specific version of a file
 * GET /api/versions/:fileId/:versionNumber/download
 */
const downloadVersion = async (req, res) => {
  try {
    const { fileId, versionNumber } = req.params;
    const versionNum = parseInt(versionNumber);

    // Get the current file
    const currentFile = await File.findById(fileId);

    if (!currentFile) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    let fileName, originalName, mimeType;

    // Check if requesting current version
    if (versionNum === currentFile.currentVersion) {
      fileName = currentFile.currentFileName;
      originalName = currentFile.originalName;
      mimeType = currentFile.mimeType;
    } else {
      // Find the specific version
      const version = await FileVersion.findOne({
        file: fileId,
        versionNumber: versionNum,
      });

      if (!version) {
        return res.status(404).json({
          success: false,
          message: `Version ${versionNum} not found`,
        });
      }

      fileName = version.fileName;
      originalName = version.originalName;
      mimeType = version.mimeType;
    }

    const filePath = path.join(uploadsDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File version not found on server",
      });
    }

    // Set headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalName}"`
    );
    res.setHeader("Content-Type", mimeType);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading version:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download version",
      error: error.message,
    });
  }
};

/**
 * Restore a previous version as the current version
 * POST /api/versions/:fileId/:versionNumber/restore
 */
const restoreVersion = async (req, res) => {
  try {
    const { fileId, versionNumber } = req.params;
    const versionNum = parseInt(versionNumber);

    // Get the current file
    const currentFile = await File.findById(fileId);

    if (!currentFile) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Can't restore current version
    if (versionNum === currentFile.currentVersion) {
      return res.status(400).json({
        success: false,
        message: "This is already the current version",
      });
    }

    // Find the version to restore
    const versionToRestore = await FileVersion.findOne({
      file: fileId,
      versionNumber: versionNum,
    });

    if (!versionToRestore) {
      return res.status(404).json({
        success: false,
        message: `Version ${versionNum} not found`,
      });
    }

    // Save current as a new version entry
    const currentVersionRecord = new FileVersion({
      file: currentFile._id,
      versionNumber: currentFile.currentVersion,
      fileName: currentFile.currentFileName,
      originalName: currentFile.originalName,
      size: currentFile.size,
      mimeType: currentFile.mimeType,
    });

    await currentVersionRecord.save();

    // Copy the old version file to a new file (so we keep both)
    const oldFilePath = path.join(uploadsDir, versionToRestore.fileName);
    const newFileName = `${Date.now()}-restored-${
      versionToRestore.originalName
    }`;
    const newFilePath = path.join(uploadsDir, newFileName);

    if (fs.existsSync(oldFilePath)) {
      fs.copyFileSync(oldFilePath, newFilePath);
    } else {
      return res.status(404).json({
        success: false,
        message: "Version file not found on server",
      });
    }

    // Update current file with restored version info
    currentFile.currentFileName = newFileName;
    currentFile.originalName = versionToRestore.originalName;
    currentFile.size = versionToRestore.size;
    currentFile.mimeType = versionToRestore.mimeType;
    currentFile.currentVersion += 1;

    await currentFile.save();

    res.json({
      success: true,
      message: `Restored to version ${versionNum} as new version ${currentFile.currentVersion}`,
      data: currentFile,
    });
  } catch (error) {
    console.error("Error restoring version:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore version",
      error: error.message,
    });
  }
};

module.exports = {
  uploadNewVersion,
  getVersionHistory,
  downloadVersion,
  restoreVersion,
};

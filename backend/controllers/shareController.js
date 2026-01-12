const { File } = require("../models");
const { nanoid } = require("nanoid");

/**
 * Share Controller
 * Handles file sharing functionality - generating and managing share links
 */

/**
 * Generate a shareable link for a file
 * POST /api/share/:fileId/enable
 */
const enableSharing = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // If already shared, return existing link
    if (file.sharing.isShared && file.sharing.shareLink) {
      return res.json({
        success: true,
        message: "File is already shared",
        data: {
          shareLink: file.sharing.shareLink,
          fullUrl: `${
            process.env.BASE_URL || "http://localhost:5000"
          }/api/share/${file.sharing.shareLink}`,
        },
      });
    }

    // Generate unique share link ID (10 characters)
    const shareLink = nanoid(10);

    // Update file with sharing info
    file.sharing = {
      isShared: true,
      shareLink: shareLink,
      sharedAt: new Date(),
    };

    await file.save();

    res.json({
      success: true,
      message: "Share link generated successfully",
      data: {
        shareLink: shareLink,
        fullUrl: `${
          process.env.BASE_URL || "http://localhost:5000"
        }/api/share/${shareLink}`,
      },
    });
  } catch (error) {
    console.error("Error enabling sharing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to enable sharing",
      error: error.message,
    });
  }
};

/**
 * Disable sharing for a file
 * POST /api/share/:fileId/disable
 */
const disableSharing = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Disable sharing
    file.sharing = {
      isShared: false,
      shareLink: null,
      sharedAt: null,
    };

    await file.save();

    res.json({
      success: true,
      message: "Sharing disabled successfully",
    });
  } catch (error) {
    console.error("Error disabling sharing:", error);
    res.status(500).json({
      success: false,
      message: "Failed to disable sharing",
      error: error.message,
    });
  }
};

/**
 * Get share status for a file
 * GET /api/share/:fileId/status
 */
const getShareStatus = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId)
      .select("sharing originalName")
      .lean();

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.json({
      success: true,
      data: {
        fileName: file.originalName,
        isShared: file.sharing.isShared,
        shareLink: file.sharing.shareLink,
        fullUrl: file.sharing.isShared
          ? `${process.env.BASE_URL || "http://localhost:5000"}/api/share/${
              file.sharing.shareLink
            }`
          : null,
        sharedAt: file.sharing.sharedAt,
      },
    });
  } catch (error) {
    console.error("Error getting share status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get share status",
      error: error.message,
    });
  }
};

/**
 * Access a shared file by share link
 * GET /api/share/:shareLink
 */
const accessSharedFile = async (req, res) => {
  try {
    const { shareLink } = req.params;

    const file = await File.findOne({ "sharing.shareLink": shareLink }).lean();

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Shared file not found or link is invalid",
      });
    }

    if (!file.sharing.isShared) {
      return res.status(403).json({
        success: false,
        message: "This file is no longer shared",
      });
    }

    res.json({
      success: true,
      data: {
        _id: file._id,
        fileName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        extension: file.extension,
        uploadedAt: file.createdAt,
        downloadUrl: `${
          process.env.BASE_URL || "http://localhost:5000"
        }/api/share/${shareLink}/download`,
      },
    });
  } catch (error) {
    console.error("Error accessing shared file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to access shared file",
      error: error.message,
    });
  }
};

/**
 * Download a shared file
 * GET /api/share/:shareLink/download
 */
const downloadSharedFile = async (req, res) => {
  try {
    const { shareLink } = req.params;
    const fs = require("fs");
    const path = require("path");

    const file = await File.findOne({ "sharing.shareLink": shareLink });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "Shared file not found or link is invalid",
      });
    }

    if (!file.sharing.isShared) {
      return res.status(403).json({
        success: false,
        message: "This file is no longer shared",
      });
    }

    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      file.currentFileName
    );

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
    console.error("Error downloading shared file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download shared file",
      error: error.message,
    });
  }
};

module.exports = {
  enableSharing,
  disableSharing,
  getShareStatus,
  accessSharedFile,
  downloadSharedFile,
};

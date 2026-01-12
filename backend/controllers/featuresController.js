/**
 * Features Controller
 * Handles starred files, trash, storage analytics, and file preview
 */

const fs = require("fs");
const path = require("path");
const { File, Folder } = require("../models");

const uploadsDir = path.join(__dirname, "..", "uploads");

// ============================================================================
// STARRED FILES
// ============================================================================

/**
 * Get all starred files
 * GET /api/features/starred
 */
const getStarredFiles = async (req, res) => {
  try {
    const files = await File.find({
      isStarred: true,
      isDeleted: { $ne: true },
    })
      .sort({ starredAt: -1 })
      .lean();

    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error("Error fetching starred files:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch starred files",
      error: error.message,
    });
  }
};

/**
 * Toggle star status for a file
 * PATCH /api/features/star/:id
 */
const toggleStar = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    file.isStarred = !file.isStarred;
    file.starredAt = file.isStarred ? new Date() : null;
    await file.save();

    res.json({
      success: true,
      message: file.isStarred ? "File starred" : "File unstarred",
      data: file,
    });
  } catch (error) {
    console.error("Error toggling star:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle star",
      error: error.message,
    });
  }
};

// ============================================================================
// TRASH / RECYCLE BIN
// ============================================================================

/**
 * Get all files in trash
 * GET /api/features/trash
 */
const getTrash = async (req, res) => {
  try {
    const files = await File.find({ isDeleted: true })
      .sort({ deletedAt: -1 })
      .lean();

    // Add days remaining before permanent deletion
    const filesWithExpiry = files.map((file) => {
      const deletedAt = new Date(file.deletedAt);
      const expiryDate = new Date(
        deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      const daysRemaining = Math.ceil(
        (expiryDate - new Date()) / (24 * 60 * 60 * 1000)
      );
      return {
        ...file,
        daysRemaining: Math.max(0, daysRemaining),
        expiryDate,
      };
    });

    res.json({
      success: true,
      data: filesWithExpiry,
    });
  } catch (error) {
    console.error("Error fetching trash:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trash",
      error: error.message,
    });
  }
};

/**
 * Move file to trash (soft delete)
 * PATCH /api/features/trash/:id
 */
const moveToTrash = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    file.isDeleted = true;
    file.deletedAt = new Date();
    await file.save();

    res.json({
      success: true,
      message: "File moved to trash",
      data: file,
    });
  } catch (error) {
    console.error("Error moving to trash:", error);
    res.status(500).json({
      success: false,
      message: "Failed to move to trash",
      error: error.message,
    });
  }
};

/**
 * Restore file from trash
 * PATCH /api/features/restore/:id
 */
const restoreFromTrash = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    file.isDeleted = false;
    file.deletedAt = null;
    await file.save();

    res.json({
      success: true,
      message: "File restored from trash",
      data: file,
    });
  } catch (error) {
    console.error("Error restoring file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore file",
      error: error.message,
    });
  }
};

/**
 * Permanently delete file
 * DELETE /api/features/trash/:id
 */
const permanentDelete = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Delete physical file
    const filePath = path.join(uploadsDir, file.currentFileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await File.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "File permanently deleted",
    });
  } catch (error) {
    console.error("Error permanently deleting file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to permanently delete file",
      error: error.message,
    });
  }
};

/**
 * Empty entire trash
 * DELETE /api/features/trash
 */
const emptyTrash = async (req, res) => {
  try {
    const trashedFiles = await File.find({ isDeleted: true });

    // Delete physical files
    for (const file of trashedFiles) {
      const filePath = path.join(uploadsDir, file.currentFileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from database
    await File.deleteMany({ isDeleted: true });

    res.json({
      success: true,
      message: `Permanently deleted ${trashedFiles.length} files`,
      count: trashedFiles.length,
    });
  } catch (error) {
    console.error("Error emptying trash:", error);
    res.status(500).json({
      success: false,
      message: "Failed to empty trash",
      error: error.message,
    });
  }
};

/**
 * Auto-cleanup trash (files older than 30 days)
 * Can be called by a cron job or manually
 * POST /api/features/trash/cleanup
 */
const autoCleanupTrash = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const expiredFiles = await File.find({
      isDeleted: true,
      deletedAt: { $lt: thirtyDaysAgo },
    });

    // Delete physical files
    for (const file of expiredFiles) {
      const filePath = path.join(uploadsDir, file.currentFileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from database
    await File.deleteMany({
      isDeleted: true,
      deletedAt: { $lt: thirtyDaysAgo },
    });

    res.json({
      success: true,
      message: `Auto-cleaned ${expiredFiles.length} expired files`,
      count: expiredFiles.length,
    });
  } catch (error) {
    console.error("Error auto-cleaning trash:", error);
    res.status(500).json({
      success: false,
      message: "Failed to auto-clean trash",
      error: error.message,
    });
  }
};

// ============================================================================
// STORAGE ANALYTICS
// ============================================================================

/**
 * Get storage analytics
 * GET /api/features/analytics
 */
const getStorageAnalytics = async (req, res) => {
  try {
    // Get all non-deleted files
    const files = await File.find({ isDeleted: { $ne: true } }).lean();

    // Calculate total storage
    const totalStorage = files.reduce((sum, file) => sum + file.size, 0);

    // Group by file type
    const typeBreakdown = {};
    files.forEach((file) => {
      const type = getFileCategory(file.mimeType, file.extension);
      if (!typeBreakdown[type]) {
        typeBreakdown[type] = { count: 0, size: 0 };
      }
      typeBreakdown[type].count += 1;
      typeBreakdown[type].size += file.size;
    });

    // Get largest files (top 10)
    const largestFiles = files
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map((file) => ({
        _id: file._id,
        name: file.originalName,
        size: file.size,
        type: getFileCategory(file.mimeType, file.extension),
      }));

    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUploads = files.filter(
      (file) => new Date(file.createdAt) > sevenDaysAgo
    ).length;

    // Storage limit (configurable, default 5GB)
    const storageLimit = 5 * 1024 * 1024 * 1024; // 5GB in bytes

    res.json({
      success: true,
      data: {
        totalFiles: files.length,
        totalStorage,
        storageLimit,
        storageUsedPercent: ((totalStorage / storageLimit) * 100).toFixed(2),
        typeBreakdown,
        largestFiles,
        recentUploads,
        trashCount: await File.countDocuments({ isDeleted: true }),
        starredCount: await File.countDocuments({
          isStarred: true,
          isDeleted: { $ne: true },
        }),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

/**
 * Helper: Categorize file by type
 */
function getFileCategory(mimeType, extension) {
  if (mimeType?.startsWith("image/")) return "Images";
  if (mimeType?.startsWith("video/")) return "Videos";
  if (mimeType?.startsWith("audio/")) return "Audio";
  if (mimeType === "application/pdf") return "PDFs";
  if (
    mimeType?.includes("document") ||
    mimeType?.includes("msword") ||
    [".doc", ".docx", ".odt"].includes(extension)
  )
    return "Documents";
  if (
    mimeType?.includes("spreadsheet") ||
    mimeType?.includes("excel") ||
    [".xls", ".xlsx", ".csv"].includes(extension)
  )
    return "Spreadsheets";
  if (
    mimeType?.includes("presentation") ||
    mimeType?.includes("powerpoint") ||
    [".ppt", ".pptx"].includes(extension)
  )
    return "Presentations";
  if (
    mimeType?.startsWith("text/") ||
    [
      ".txt",
      ".md",
      ".json",
      ".js",
      ".py",
      ".jsx",
      ".ts",
      ".tsx",
      ".html",
      ".css",
    ].includes(extension)
  )
    return "Text/Code";
  if (
    mimeType?.includes("zip") ||
    mimeType?.includes("archive") ||
    [".zip", ".rar", ".7z", ".tar", ".gz"].includes(extension)
  )
    return "Archives";
  return "Other";
}

// ============================================================================
// FILE PREVIEW
// ============================================================================

/**
 * Get file content for preview
 * GET /api/features/preview/:id
 */
const getFilePreview = async (req, res) => {
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

    const previewType = getPreviewType(file.mimeType, file.extension);

    // For text-based files, return content
    if (previewType === "text" || previewType === "code") {
      const content = fs.readFileSync(filePath, "utf-8");
      return res.json({
        success: true,
        data: {
          type: previewType,
          content: content.slice(0, 100000), // Limit to 100KB of text
          language: getCodeLanguage(file.extension),
          file,
        },
      });
    }

    // For images, return base64 or URL
    if (previewType === "image") {
      return res.json({
        success: true,
        data: {
          type: "image",
          url: `/uploads/${file.currentFileName}`,
          file,
        },
      });
    }

    // For PDFs, return URL
    if (previewType === "pdf") {
      return res.json({
        success: true,
        data: {
          type: "pdf",
          url: `/uploads/${file.currentFileName}`,
          file,
        },
      });
    }

    // For videos
    if (previewType === "video") {
      return res.json({
        success: true,
        data: {
          type: "video",
          url: `/uploads/${file.currentFileName}`,
          file,
        },
      });
    }

    // For audio
    if (previewType === "audio") {
      return res.json({
        success: true,
        data: {
          type: "audio",
          url: `/uploads/${file.currentFileName}`,
          file,
        },
      });
    }

    // Unsupported preview
    res.json({
      success: true,
      data: {
        type: "unsupported",
        message: "Preview not available for this file type",
        file,
      },
    });
  } catch (error) {
    console.error("Error getting file preview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get file preview",
      error: error.message,
    });
  }
};

/**
 * Helper: Determine preview type
 */
function getPreviewType(mimeType, extension) {
  if (mimeType?.startsWith("image/")) return "image";
  if (mimeType?.startsWith("video/")) return "video";
  if (mimeType?.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";

  const codeExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".py",
    ".java",
    ".cpp",
    ".c",
    ".h",
    ".css",
    ".html",
    ".json",
    ".xml",
    ".yaml",
    ".yml",
    ".sh",
    ".bash",
    ".sql",
  ];
  if (codeExtensions.includes(extension)) return "code";

  if (
    mimeType?.startsWith("text/") ||
    [".txt", ".md", ".log"].includes(extension)
  )
    return "text";

  return "unsupported";
}

/**
 * Helper: Get code language for syntax highlighting
 */
function getCodeLanguage(extension) {
  const languages = {
    ".js": "javascript",
    ".jsx": "jsx",
    ".ts": "typescript",
    ".tsx": "tsx",
    ".py": "python",
    ".java": "java",
    ".cpp": "cpp",
    ".c": "c",
    ".h": "c",
    ".css": "css",
    ".html": "html",
    ".json": "json",
    ".xml": "xml",
    ".yaml": "yaml",
    ".yml": "yaml",
    ".sh": "bash",
    ".bash": "bash",
    ".sql": "sql",
    ".md": "markdown",
    ".txt": "plaintext",
  };
  return languages[extension] || "plaintext";
}

// ============================================================================
// TAGS
// ============================================================================

/**
 * Update file tags
 * PATCH /api/features/tags/:id
 */
const updateTags = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    file.tags = tags || [];
    await file.save();

    res.json({
      success: true,
      message: "Tags updated",
      data: file,
    });
  } catch (error) {
    console.error("Error updating tags:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tags",
      error: error.message,
    });
  }
};

/**
 * Get files by tag
 * GET /api/features/tags/:tag
 */
const getFilesByTag = async (req, res) => {
  try {
    const { tag } = req.params;

    const files = await File.find({
      tags: tag,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error("Error fetching files by tag:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch files",
      error: error.message,
    });
  }
};

/**
 * Get all unique tags
 * GET /api/features/tags
 */
const getAllTags = async (req, res) => {
  try {
    const tags = await File.distinct("tags", { isDeleted: { $ne: true } });

    res.json({
      success: true,
      data: tags.filter((tag) => tag), // Remove nulls/empty
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tags",
      error: error.message,
    });
  }
};

// ============================================================================
// RECENT FILES
// ============================================================================

/**
 * Get recent files
 * GET /api/features/recent
 */
const getRecentFiles = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const files = await File.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error("Error fetching recent files:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent files",
      error: error.message,
    });
  }
};

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Search files and folders
 * GET /api/features/search?q=query
 */
const searchFilesAndFolders = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: { files: [], folders: [] },
      });
    }

    const searchQuery = q.trim();
    const searchRegex = new RegExp(searchQuery, "i");

    // Search files
    const files = await File.find({
      isDeleted: { $ne: true },
      $or: [
        { originalName: searchRegex },
        { tags: searchRegex },
        { "aiMetadata.keywords": searchRegex },
      ],
    })
      .limit(parseInt(limit))
      .lean();

    // Search folders
    const folders = await Folder.find({
      name: searchRegex,
    })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        files,
        folders,
        query: searchQuery,
      },
    });
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search",
      error: error.message,
    });
  }
};

module.exports = {
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
};

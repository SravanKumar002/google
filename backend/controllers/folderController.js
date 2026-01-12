const { Folder, File } = require("../models");

/**
 * Folder Controller
 * Handles all folder-related operations
 */

/**
 * Get all folders at root level or within a specific parent folder
 * GET /api/folders?parentFolder=<folderId>
 */
const getFolders = async (req, res) => {
  try {
    const { parentFolder } = req.query;

    // Build query - null parentFolder means root level
    const query = {
      parentFolder: parentFolder || null,
    };

    const folders = await Folder.find(query)
      .sort({ name: 1 }) // Sort alphabetically
      .lean();

    res.json({
      success: true,
      data: folders,
    });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch folders",
      error: error.message,
    });
  }
};

/**
 * Get a single folder by ID with its contents
 * GET /api/folders/:id
 */
const getFolderById = async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await Folder.findById(id)
      .populate("parentFolder", "name path")
      .lean();

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    // Get subfolders and files in this folder
    const [subfolders, files] = await Promise.all([
      Folder.find({ parentFolder: id }).sort({ name: 1 }).lean(),
      File.find({ folder: id }).sort({ originalName: 1 }).lean(),
    ]);

    res.json({
      success: true,
      data: {
        folder,
        subfolders,
        files,
      },
    });
  } catch (error) {
    console.error("Error fetching folder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch folder",
      error: error.message,
    });
  }
};

/**
 * Create a new folder
 * POST /api/folders
 * Body: { name: string, parentFolder?: string }
 */
const createFolder = async (req, res) => {
  try {
    const { name, parentFolder } = req.body;

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Folder name is required",
      });
    }

    // If parentFolder is provided, verify it exists
    let parentPath = "";
    if (parentFolder) {
      const parent = await Folder.findById(parentFolder);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent folder not found",
        });
      }
      parentPath = parent.path;
    }

    // Check for duplicate folder name in same location
    const existingFolder = await Folder.findOne({
      name: name.trim(),
      parentFolder: parentFolder || null,
    });

    if (existingFolder) {
      return res.status(400).json({
        success: false,
        message: "A folder with this name already exists in this location",
      });
    }

    // Create the folder
    const folder = new Folder({
      name: name.trim(),
      parentFolder: parentFolder || null,
      path:
        parentPath === "/" ? `/${name.trim()}` : `${parentPath}/${name.trim()}`,
    });

    await folder.save();

    res.status(201).json({
      success: true,
      message: "Folder created successfully",
      data: folder,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create folder",
      error: error.message,
    });
  }
};

/**
 * Rename a folder
 * PATCH /api/folders/:id
 * Body: { name: string }
 */
const renameFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Folder name is required",
      });
    }

    const folder = await Folder.findById(id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    // Check for duplicate name in same location
    const duplicate = await Folder.findOne({
      name: name.trim(),
      parentFolder: folder.parentFolder,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "A folder with this name already exists in this location",
      });
    }

    // Update folder name and path
    const oldPath = folder.path;
    const parentPath = oldPath.substring(0, oldPath.lastIndexOf("/")) || "/";
    const newPath =
      parentPath === "/" ? `/${name.trim()}` : `${parentPath}/${name.trim()}`;

    folder.name = name.trim();
    folder.path = newPath;
    await folder.save();

    // Update paths of all subfolders
    await updateSubfolderPaths(oldPath, newPath);

    res.json({
      success: true,
      message: "Folder renamed successfully",
      data: folder,
    });
  } catch (error) {
    console.error("Error renaming folder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to rename folder",
      error: error.message,
    });
  }
};

/**
 * Helper function to update subfolder paths when parent is renamed
 */
const updateSubfolderPaths = async (oldPath, newPath) => {
  const subfolders = await Folder.find({
    path: { $regex: `^${oldPath}/` },
  });

  for (const subfolder of subfolders) {
    subfolder.path = subfolder.path.replace(oldPath, newPath);
    await subfolder.save();
  }
};

/**
 * Delete a folder and all its contents
 * DELETE /api/folders/:id
 */
const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const fs = require("fs");
    const path = require("path");

    const folder = await Folder.findById(id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found",
      });
    }

    // Get all subfolders (including nested ones)
    const allSubfolders = await Folder.find({
      path: { $regex: `^${folder.path}/` },
    });

    const folderIds = [id, ...allSubfolders.map((f) => f._id)];

    // Get all files in these folders and delete them from storage
    const filesToDelete = await File.find({
      folder: { $in: folderIds },
    });

    // Delete physical files
    const uploadsDir = path.join(__dirname, "..", "uploads");
    for (const file of filesToDelete) {
      const filePath = path.join(uploadsDir, file.currentFileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete all files from database
    await File.deleteMany({ folder: { $in: folderIds } });

    // Delete all subfolders
    await Folder.deleteMany({ _id: { $in: folderIds } });

    res.json({
      success: true,
      message: "Folder and all contents deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete folder",
      error: error.message,
    });
  }
};

/**
 * Get folder breadcrumb path
 * GET /api/folders/:id/breadcrumb
 */
const getFolderBreadcrumb = async (req, res) => {
  try {
    const { id } = req.params;
    const breadcrumb = [];

    let currentFolder = await Folder.findById(id).lean();

    while (currentFolder) {
      breadcrumb.unshift({
        _id: currentFolder._id,
        name: currentFolder.name,
      });

      if (currentFolder.parentFolder) {
        currentFolder = await Folder.findById(
          currentFolder.parentFolder
        ).lean();
      } else {
        currentFolder = null;
      }
    }

    res.json({
      success: true,
      data: breadcrumb,
    });
  } catch (error) {
    console.error("Error fetching breadcrumb:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch breadcrumb",
      error: error.message,
    });
  }
};

module.exports = {
  getFolders,
  getFolderById,
  createFolder,
  renameFolder,
  deleteFolder,
  getFolderBreadcrumb,
};

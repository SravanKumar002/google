const mongoose = require("mongoose");

/**
 * Folder Schema
 * Represents a folder in the drive system
 * Supports nested folder hierarchy through parentFolder reference
 */
const folderSchema = new mongoose.Schema(
  {
    // Folder display name
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      maxlength: [255, "Folder name cannot exceed 255 characters"],
    },

    // Reference to parent folder (null for root-level folders)
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    // Full path for easier querying (e.g., "/Documents/Work")
    path: {
      type: String,
      default: "/",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for faster queries on parent folder
folderSchema.index({ parentFolder: 1 });
folderSchema.index({ path: 1 });

module.exports = mongoose.model("Folder", folderSchema);

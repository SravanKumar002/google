const mongoose = require("mongoose");

/**
 * FileVersion Schema
 * Stores historical versions of files
 * Each time a file is updated, the old version is saved here
 */
const fileVersionSchema = new mongoose.Schema(
  {
    // Reference to the parent file
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },

    // Version number (1, 2, 3, etc.)
    versionNumber: {
      type: Number,
      required: true,
    },

    // Stored filename for this version
    fileName: {
      type: String,
      required: true,
    },

    // Original filename at time of upload
    originalName: {
      type: String,
      required: true,
    },

    // File size at this version
    size: {
      type: Number,
      required: true,
    },

    // MIME type at this version
    mimeType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt serves as version upload date
  }
);

// Compound index for efficient version queries
fileVersionSchema.index({ file: 1, versionNumber: -1 });

module.exports = mongoose.model("FileVersion", fileVersionSchema);

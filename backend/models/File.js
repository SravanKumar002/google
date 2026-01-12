const mongoose = require("mongoose");

/**
 * File Schema
 * Represents a file in the drive system
 * Stores metadata about the file, not the actual file content
 */
const fileSchema = new mongoose.Schema(
  {
    // Original filename uploaded by user
    originalName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },

    // Current stored filename (with unique identifier)
    currentFileName: {
      type: String,
      required: true,
    },

    // File MIME type (e.g., 'application/pdf', 'image/png')
    mimeType: {
      type: String,
      required: true,
    },

    // File size in bytes
    size: {
      type: Number,
      required: true,
    },

    // File extension (e.g., '.pdf', '.png')
    extension: {
      type: String,
      default: "",
    },

    // Reference to parent folder (null for root-level files)
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },

    // Current version number (starts at 1)
    currentVersion: {
      type: Number,
      default: 1,
    },

    // Sharing settings
    sharing: {
      // Whether the file is publicly accessible via link
      isShared: {
        type: Boolean,
        default: false,
      },
      // Unique share link identifier
      shareLink: {
        type: String,
        default: null,
        index: { sparse: true }, // Sparse index for non-null values only
      },
      // When sharing was enabled
      sharedAt: {
        type: Date,
        default: null,
      },
    },

    // ==================
    // NEW FEATURES
    // ==================

    // Starred/Favorites
    isStarred: {
      type: Boolean,
      default: false,
    },
    starredAt: {
      type: Date,
      default: null,
    },

    // Trash/Recycle Bin (soft delete)
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    // AI Auto-Tags
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // AI-generated metadata
    aiMetadata: {
      summary: {
        type: String,
        default: null,
      },
      keywords: [
        {
          type: String,
        },
      ],
      category: {
        type: String,
        default: null,
      },
      lastAnalyzed: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Indexes for faster queries
fileSchema.index({ folder: 1 });
// Note: shareLink index is defined in schema with unique + sparse
fileSchema.index({ originalName: "text" }); // Text search on filename
fileSchema.index({ isStarred: 1 }); // Starred files queries
fileSchema.index({ isDeleted: 1 }); // Trash queries
fileSchema.index({ deletedAt: 1 }); // For auto-cleanup
fileSchema.index({ tags: 1 }); // Tag-based queries

module.exports = mongoose.model("File", fileSchema);

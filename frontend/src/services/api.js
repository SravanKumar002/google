import axios from "axios";

/**
 * API Service
 * Centralized API calls for the Google Drive Clone
 */

// Use environment variable or fallback to local backend
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================
// FILE OPERATIONS
// ==================

/**
 * Get drive contents (folders and files)
 * @param {string|null} folderId - Parent folder ID (null for root)
 */
export const getDriveContents = async (folderId = null) => {
  const params = folderId ? { folder: folderId } : {};
  const response = await api.get("/files/drive", { params });
  return response.data;
};

/**
 * Upload a file
 * @param {File} file - File object to upload
 * @param {string|null} folderId - Target folder ID
 * @param {function} onProgress - Progress callback
 */
export const uploadFile = async (file, folderId = null, onProgress = null) => {
  const formData = new FormData();
  formData.append("file", file);
  if (folderId) {
    formData.append("folder", folderId);
  }

  const response = await api.post("/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

/**
 * Download a file
 * @param {string} fileId - File ID
 * @param {string} fileName - Original filename
 */
export const downloadFile = async (fileId, fileName) => {
  const response = await api.get(`/files/${fileId}/download`, {
    responseType: "blob",
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Move a file to a different folder
 */
export const moveFile = async (fileId, targetFolderId) => {
  const response = await api.patch(`/files/${fileId}/move`, {
    targetFolder: targetFolderId,
  });
  return response.data;
};

/**
 * Rename a file
 */
export const renameFile = async (fileId, newName) => {
  const response = await api.patch(`/files/${fileId}/rename`, {
    name: newName,
  });
  return response.data;
};

/**
 * Delete a file
 */
export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};

// ==================
// FOLDER OPERATIONS
// ==================

/**
 * Get folders at a specific level
 */
export const getFolders = async (parentFolderId = null) => {
  const params = parentFolderId ? { parentFolder: parentFolderId } : {};
  const response = await api.get("/folders", { params });
  return response.data;
};

/**
 * Get folder details with contents
 */
export const getFolderById = async (folderId) => {
  const response = await api.get(`/folders/${folderId}`);
  return response.data;
};

/**
 * Get folder breadcrumb path
 */
export const getFolderBreadcrumb = async (folderId) => {
  const response = await api.get(`/folders/${folderId}/breadcrumb`);
  return response.data;
};

/**
 * Create a new folder
 */
export const createFolder = async (name, parentFolderId = null) => {
  const response = await api.post("/folders", {
    name,
    parentFolder: parentFolderId,
  });
  return response.data;
};

/**
 * Rename a folder
 */
export const renameFolder = async (folderId, newName) => {
  const response = await api.patch(`/folders/${folderId}`, {
    name: newName,
  });
  return response.data;
};

/**
 * Delete a folder and its contents
 */
export const deleteFolder = async (folderId) => {
  const response = await api.delete(`/folders/${folderId}`);
  return response.data;
};

// ==================
// SHARING OPERATIONS
// ==================

/**
 * Enable sharing for a file
 */
export const enableSharing = async (fileId) => {
  const response = await api.post(`/share/${fileId}/enable`);
  return response.data;
};

/**
 * Disable sharing for a file
 */
export const disableSharing = async (fileId) => {
  const response = await api.post(`/share/${fileId}/disable`);
  return response.data;
};

/**
 * Get share status for a file
 */
export const getShareStatus = async (fileId) => {
  const response = await api.get(`/share/${fileId}/status`);
  return response.data;
};

/**
 * Access a shared file (public)
 */
export const accessSharedFile = async (shareLink) => {
  const response = await api.get(`/share/${shareLink}`);
  return response.data;
};

// ==================
// VERSION OPERATIONS
// ==================

/**
 * Get version history for a file
 */
export const getVersionHistory = async (fileId) => {
  const response = await api.get(`/versions/${fileId}`);
  return response.data;
};

/**
 * Upload a new version of a file
 */
export const uploadNewVersion = async (fileId, file, onProgress = null) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/versions/${fileId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

/**
 * Download a specific version
 */
export const downloadVersion = async (fileId, versionNumber, fileName) => {
  const response = await api.get(
    `/versions/${fileId}/${versionNumber}/download`,
    { responseType: "blob" }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Restore a previous version
 */
export const restoreVersion = async (fileId, versionNumber) => {
  const response = await api.post(
    `/versions/${fileId}/${versionNumber}/restore`
  );
  return response.data;
};

// ==================
// AI OPERATIONS (RAG)
// ==================

/**
 * Index a file for AI queries
 * Called automatically on file upload (can also be called manually)
 * @param {string} filePath - Path to the file in uploads folder
 * @param {string} fileId - MongoDB file ID
 */
export const indexFileForAI = async (filePath, fileId) => {
  const response = await api.post("/ai/index", {
    filePath,
    fileId,
  });
  return response.data;
};

/**
 * Ask a question about a file using RAG
 * @param {string} filePath - Path to the file
 * @param {string} question - User's question
 * @param {string} fileId - Optional file ID
 */
export const askAboutFile = async (filePath, question, fileId = null) => {
  const response = await api.post("/ai/ask", {
    filePath,
    question,
    fileId,
  });
  return response.data;
};

/**
 * Generate a summary of a file
 * @param {string} filePath - Path to the file
 * @param {string} fileId - Optional file ID
 */
export const summarizeFile = async (filePath, fileId = null) => {
  const response = await api.post("/ai/summarize", {
    filePath,
    fileId,
  });
  return response.data;
};

/**
 * Check if RAG AI service is available
 */
export const checkAIHealth = async () => {
  try {
    const response = await api.get("/ai/health");
    return response.data;
  } catch (error) {
    return { success: false, error: "AI service unavailable" };
  }
};

/**
 * Auto-generate tags for a file using AI
 * @param {string} filePath - Path to the file
 * @param {string} fileId - Optional file ID
 * @param {number} maxTags - Maximum number of tags
 */
export const autoTagFile = async (filePath, fileId = null, maxTags = 5) => {
  const response = await api.post("/ai/auto-tag", {
    filePath,
    fileId,
    maxTags,
  });
  return response.data;
};

/**
 * Ask a question across multiple files
 * @param {string[]} filePaths - List of file paths
 * @param {string} question - User's question
 */
export const askMultipleFiles = async (filePaths, question) => {
  const response = await api.post("/ai/ask-multi", {
    filePaths,
    question,
  });
  return response.data;
};

/**
 * Generate a structured document from file content
 * @param {string} filePath - Path to the file
 * @param {string} docType - Type of document: "summary", "report", "outline", "key_points"
 * @param {string} fileId - Optional file ID
 */
export const generateDocument = async (filePath, docType, fileId = null) => {
  const response = await api.post("/ai/generate-doc", {
    filePath,
    docType,
    fileId,
  });
  return response.data;
};

// ==================
// STARRED FILES
// ==================

/**
 * Get all starred files
 */
export const getStarredFiles = async () => {
  const response = await api.get("/features/starred");
  return response.data;
};

/**
 * Toggle star status for a file
 */
export const toggleStar = async (fileId) => {
  const response = await api.patch(`/features/star/${fileId}`);
  return response.data;
};

// ==================
// TRASH / RECYCLE BIN
// ==================

/**
 * Get all files in trash
 */
export const getTrash = async () => {
  const response = await api.get("/features/trash");
  return response.data;
};

/**
 * Move file to trash (soft delete)
 */
export const moveToTrash = async (fileId) => {
  const response = await api.patch(`/features/trash/${fileId}`);
  return response.data;
};

/**
 * Restore file from trash
 */
export const restoreFromTrash = async (fileId) => {
  const response = await api.patch(`/features/restore/${fileId}`);
  return response.data;
};

/**
 * Permanently delete file from trash
 */
export const permanentDelete = async (fileId) => {
  const response = await api.delete(`/features/trash/${fileId}`);
  return response.data;
};

/**
 * Empty all trash
 */
export const emptyTrash = async () => {
  const response = await api.delete("/features/trash");
  return response.data;
};

// ==================
// STORAGE ANALYTICS
// ==================

/**
 * Get storage analytics
 */
export const getStorageAnalytics = async () => {
  const response = await api.get("/features/analytics");
  return response.data;
};

// ==================
// FILE PREVIEW
// ==================

/**
 * Get file preview data
 */
export const getFilePreview = async (fileId) => {
  const response = await api.get(`/features/preview/${fileId}`);
  return response.data;
};

// ==================
// TAGS
// ==================

/**
 * Get all unique tags
 */
export const getAllTags = async () => {
  const response = await api.get("/features/tags");
  return response.data;
};

/**
 * Get files by tag
 */
export const getFilesByTag = async (tag) => {
  const response = await api.get(`/features/tags/${encodeURIComponent(tag)}`);
  return response.data;
};

/**
 * Update file tags
 */
export const updateFileTags = async (fileId, tags) => {
  const response = await api.patch(`/features/tags/${fileId}`, { tags });
  return response.data;
};

// ==================
// RECENT FILES
// ==================

/**
 * Get recent files
 */
export const getRecentFiles = async (limit = 20) => {
  const response = await api.get("/features/recent", { params: { limit } });
  return response.data;
};

// ==================
// SEARCH
// ==================

/**
 * Search files and folders
 */
export const searchFilesAndFolders = async (query) => {
  const response = await api.get("/features/search", { params: { q: query } });
  return response.data;
};

export default api;

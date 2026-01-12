/**
 * Utility functions for the Google Drive Clone
 */

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Format date to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // Less than 24 hours ago
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return "Just now";
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  // Less than 7 days ago
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  // Older - show full date
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Get file type icon based on MIME type or extension
 * @param {string} mimeType - File MIME type
 * @param {string} extension - File extension
 * @returns {string} Icon type for the file
 */
export const getFileType = (mimeType, extension) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType.includes("spreadsheet") ||
    extension === ".xlsx" ||
    extension === ".xls" ||
    extension === ".csv"
  )
    return "spreadsheet";
  if (
    mimeType.includes("presentation") ||
    extension === ".pptx" ||
    extension === ".ppt"
  )
    return "presentation";
  if (
    mimeType.includes("document") ||
    mimeType.includes("word") ||
    extension === ".docx" ||
    extension === ".doc"
  )
    return "document";
  if (
    mimeType.startsWith("text/") ||
    extension === ".txt" ||
    extension === ".md"
  )
    return "text";
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z") ||
    mimeType.includes("tar")
  )
    return "archive";
  return "file";
};

/**
 * Get color class based on file type
 * @param {string} fileType - File type from getFileType
 * @returns {string} Tailwind color class
 */
export const getFileTypeColor = (fileType) => {
  const colors = {
    image: "text-red-500",
    video: "text-purple-500",
    audio: "text-pink-500",
    pdf: "text-red-600",
    spreadsheet: "text-green-600",
    presentation: "text-orange-500",
    document: "text-blue-600",
    text: "text-gray-600",
    archive: "text-yellow-600",
    file: "text-gray-500",
  };
  return colors[fileType] || "text-gray-500";
};

/**
 * Truncate filename if too long
 * @param {string} name - File/folder name
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated name
 */
export const truncateName = (name, maxLength = 30) => {
  if (name.length <= maxLength) return name;

  const extension =
    name.lastIndexOf(".") > 0 ? name.substring(name.lastIndexOf(".")) : "";

  const nameWithoutExt = name.substring(0, name.length - extension.length);
  const truncated = nameWithoutExt.substring(
    0,
    maxLength - extension.length - 3
  );

  return `${truncated}...${extension}`;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};

/**
 * Get file icon type based on extension and MIME type
 * Returns icon type string for use with Lucide icons
 */
export const getFileIcon = (extension, mimeType) => {
  const ext = extension?.toLowerCase();

  // Check by extension first
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"].includes(ext))
    return "image";
  if ([".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv"].includes(ext))
    return "video";
  if ([".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"].includes(ext))
    return "audio";
  if (ext === ".pdf") return "pdf";
  if ([".doc", ".docx", ".odt", ".rtf"].includes(ext)) return "document";
  if ([".xls", ".xlsx", ".csv", ".ods"].includes(ext)) return "spreadsheet";
  if ([".ppt", ".pptx", ".odp"].includes(ext)) return "presentation";
  if (
    [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".java",
      ".cpp",
      ".c",
      ".html",
      ".css",
      ".json",
      ".xml",
      ".yaml",
      ".yml",
    ].includes(ext)
  )
    return "code";
  if ([".txt", ".md", ".log"].includes(ext)) return "text";
  if ([".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"].includes(ext))
    return "archive";

  // Check by MIME type as fallback
  if (mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.includes("word") || mimeType.includes("document"))
      return "document";
    if (mimeType.includes("sheet") || mimeType.includes("excel"))
      return "spreadsheet";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return "presentation";
    if (mimeType.startsWith("text/")) return "text";
    if (
      mimeType.includes("zip") ||
      mimeType.includes("archive") ||
      mimeType.includes("compressed")
    )
      return "archive";
  }

  return "file";
};

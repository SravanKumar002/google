/**
 * Recent Page Component
 * Displays recently uploaded files
 */

import React, { useState, useEffect } from "react";
import {
  Clock,
  File as FileIcon,
  Download,
  Eye,
  Sparkles,
  Star,
  Image,
  Film,
  Music,
  FileText,
  Code,
  Archive,
} from "lucide-react";
import { getRecentFiles, toggleStar, downloadFile } from "../services/api";
import { formatFileSize, getFileIcon } from "../utils/helpers";

// Map icon type to Lucide component
const iconComponents = {
  image: Image,
  video: Film,
  audio: Music,
  pdf: FileText,
  document: FileText,
  spreadsheet: FileText,
  presentation: FileText,
  code: Code,
  text: FileText,
  archive: Archive,
  file: FileIcon,
};

const RecentPage = ({ onPreview, onAskAI, onRefresh }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentFiles = async () => {
    try {
      setLoading(true);
      const response = await getRecentFiles(50);
      if (response.success) {
        setFiles(response.data);
      }
    } catch (err) {
      setError("Failed to load recent files");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  const handleToggleStar = async (fileId, currentlyStarred) => {
    try {
      await toggleStar(fileId);
      // Update local state
      setFiles((prev) =>
        prev.map((f) =>
          f._id === fileId
            ? {
                ...f,
                isStarred: !currentlyStarred,
                starredAt: !currentlyStarred ? new Date() : null,
              }
            : f
        )
      );
      onRefresh?.();
    } catch (err) {
      console.error("Failed to toggle star:", err);
    }
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile(file._id, file.originalName);
    } catch (err) {
      console.error("Failed to download file:", err);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return then.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={fetchRecentFiles}
            className="text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Clock className="text-blue-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recent</h1>
          <p className="text-sm text-gray-500">Your recently uploaded files</p>
        </div>
      </div>

      {/* File List */}
      {files.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No recent files
          </h3>
          <p className="text-gray-500">Upload files to see them here</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {files.map((file) => {
                const iconType = getFileIcon(file.extension, file.mimeType);
                const IconComponent = iconComponents[iconType] || FileIcon;
                return (
                  <tr
                    key={file._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-500">
                          <IconComponent size={20} />
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {file.originalName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatTimeAgo(file.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onPreview?.(file)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onAskAI?.(file)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Ask AI"
                        >
                          <Sparkles size={16} />
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleStar(file._id, file.isStarred)
                          }
                          className={`p-1.5 rounded transition-colors ${
                            file.isStarred
                              ? "text-yellow-500 hover:text-gray-500"
                              : "text-gray-500 hover:text-yellow-500"
                          }`}
                          title={file.isStarred ? "Unstar" : "Star"}
                        >
                          <Star
                            size={16}
                            fill={file.isStarred ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentPage;

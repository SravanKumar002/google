/**
 * Starred Page Component
 * Displays all starred/favorited files
 */

import React, { useState, useEffect } from "react";
import {
  Star,
  File as FileIcon,
  Download,
  Eye,
  Sparkles,
  Image,
  Film,
  Music,
  FileText,
  Code,
  Archive,
} from "lucide-react";
import { getStarredFiles, toggleStar, downloadFile } from "../services/api";
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

const StarredPage = ({ onPreview, onAskAI, onRefresh }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStarredFiles = async () => {
    try {
      setLoading(true);
      const response = await getStarredFiles();
      if (response.success) {
        setFiles(response.data);
      }
    } catch (err) {
      setError("Failed to load starred files");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStarredFiles();
  }, []);

  const handleUnstar = async (fileId) => {
    try {
      await toggleStar(fileId);
      // Remove from local state
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      onRefresh?.();
    } catch (err) {
      console.error("Failed to unstar file:", err);
    }
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile(file._id, file.originalName);
    } catch (err) {
      console.error("Failed to download file:", err);
    }
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
            onClick={fetchStarredFiles}
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
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Star className="text-yellow-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Starred</h1>
          <p className="text-sm text-gray-500">
            {files.length} starred {files.length === 1 ? "file" : "files"}
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length === 0 ? (
        <div className="text-center py-16">
          <Star className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No starred files
          </h3>
          <p className="text-gray-500">
            Star files to quickly access them here
          </p>
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
                  Starred
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
                      {file.starredAt
                        ? new Date(file.starredAt).toLocaleDateString()
                        : "-"}
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
                          onClick={() => handleUnstar(file._id)}
                          className="p-1.5 text-yellow-500 hover:text-gray-500 hover:bg-gray-100 rounded transition-colors"
                          title="Remove from starred"
                        >
                          <Star size={16} fill="currentColor" />
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

export default StarredPage;

/**
 * Trash Page Component
 * Displays deleted files with restore and permanent delete options
 */

import React, { useState, useEffect } from "react";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileIcon,
  X,
  Clock,
} from "lucide-react";
import {
  getTrash,
  restoreFromTrash,
  permanentDelete,
  emptyTrash,
} from "../services/api";
import { formatFileSize, getFileIcon } from "../utils/helpers";

const TrashPage = ({ onRefresh }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const response = await getTrash();
      if (response.success) {
        setFiles(response.data);
      }
    } catch (err) {
      setError("Failed to load trash");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (fileId) => {
    try {
      setActionLoading(fileId);
      await restoreFromTrash(fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      onRefresh?.();
    } catch (err) {
      console.error("Failed to restore file:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (fileId) => {
    if (
      !window.confirm("Permanently delete this file? This cannot be undone.")
    ) {
      return;
    }

    try {
      setActionLoading(fileId);
      await permanentDelete(fileId);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      onRefresh?.();
    } catch (err) {
      console.error("Failed to delete file:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      setActionLoading("empty");
      await emptyTrash();
      setFiles([]);
      setShowEmptyConfirm(false);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to empty trash:", err);
    } finally {
      setActionLoading(null);
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
            onClick={fetchTrash}
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Trash2 className="text-red-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
            <p className="text-sm text-gray-500">
              {files.length} {files.length === 1 ? "item" : "items"} • Files are
              permanently deleted after 30 days
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <button
            onClick={() => setShowEmptyConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Empty Trash
          </button>
        )}
      </div>

      {/* Empty Trash Confirmation */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h2 className="text-lg font-semibold">Empty Trash?</h2>
            </div>
            <p className="text-gray-600 mb-6">
              All {files.length} items in the trash will be permanently deleted.
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEmptyConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyTrash}
                disabled={actionLoading === "empty"}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === "empty" ? "Deleting..." : "Empty Trash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length === 0 ? (
        <div className="text-center py-16">
          <Trash2 className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Trash is empty
          </h3>
          <p className="text-gray-500">Deleted files will appear here</p>
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
                  Deleted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {files.map((file) => {
                const IconComponent = getFileIcon(
                  file.extension,
                  file.mimeType
                );
                const isLoading = actionLoading === file._id;

                return (
                  <tr
                    key={file._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">
                          {typeof IconComponent === "function" ? (
                            <IconComponent size={20} />
                          ) : (
                            <FileIcon size={20} />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-600 truncate max-w-xs">
                          {file.originalName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {file.deletedAt
                        ? new Date(file.deletedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        <span
                          className={`text-sm ${
                            file.daysRemaining <= 7
                              ? "text-red-500 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {file.daysRemaining} days
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(file._id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                          title="Restore"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(file._id)}
                          disabled={isLoading}
                          className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                          title="Delete permanently"
                        >
                          <X size={14} />
                          Delete
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

export default TrashPage;

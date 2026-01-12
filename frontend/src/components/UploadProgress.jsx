import { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  Upload,
  Loader2,
  ChevronUp,
  ChevronDown,
  File,
} from "lucide-react";

/**
 * Upload Item Status
 */
const UploadItem = ({ upload, onRetry, onCancel }) => {
  const statusIcons = {
    pending: <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />,
    uploading: <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />,
    complete: <CheckCircle className="w-4 h-4 text-green-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
  };

  return (
    <div className="flex items-center p-3 hover:bg-gray-50">
      <File className="w-5 h-5 text-gray-400 mr-3" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 truncate">{upload.name}</p>
        {upload.status === "uploading" && (
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${upload.progress}%` }}
              />
            </div>
          </div>
        )}
        {upload.status === "error" && (
          <p className="text-xs text-red-500 mt-0.5">{upload.error}</p>
        )}
      </div>
      <div className="flex items-center space-x-2 ml-3">
        {statusIcons[upload.status]}
        {upload.status === "error" && onRetry && (
          <button
            onClick={() => onRetry(upload)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Retry
          </button>
        )}
        {(upload.status === "pending" || upload.status === "uploading") &&
          onCancel && (
            <button
              onClick={() => onCancel(upload)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
      </div>
    </div>
  );
};

/**
 * Upload Progress Panel
 * Shows all uploads in progress with their status
 */
const UploadProgressPanel = ({
  uploads = [],
  onRetry,
  onCancel,
  onClear,
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const pendingCount = uploads.filter((u) => u.status === "pending").length;
  const uploadingCount = uploads.filter((u) => u.status === "uploading").length;
  const completeCount = uploads.filter((u) => u.status === "complete").length;
  const errorCount = uploads.filter((u) => u.status === "error").length;
  const totalCount = uploads.length;

  const inProgress = pendingCount + uploadingCount;
  const overallProgress =
    totalCount > 0
      ? Math.round(
          uploads.reduce((acc, u) => acc + (u.progress || 0), 0) / totalCount
        )
      : 0;

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Upload className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">
            {inProgress > 0
              ? `Uploading ${inProgress} file${inProgress > 1 ? "s" : ""}`
              : `${completeCount} uploaded`}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {inProgress === 0 && (
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Overall Progress */}
      {inProgress > 0 && (
        <div className="px-3 py-2 bg-blue-50">
          <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
            <span>{overallProgress}% complete</span>
            <span>
              {completeCount}/{totalCount} files
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload List */}
      {!isMinimized && (
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
          {uploads.map((upload) => (
            <UploadItem
              key={upload.id}
              upload={upload}
              onRetry={onRetry}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}

      {/* Footer Actions */}
      {!isMinimized && inProgress === 0 && (
        <div className="p-2 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClear}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * useUploadProgress Hook
 * Manages upload queue and progress tracking
 */
export const useUploadProgress = () => {
  const [uploads, setUploads] = useState([]);

  const addUpload = (file) => {
    const upload = {
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      file,
      status: "pending",
      progress: 0,
      error: null,
    };
    setUploads((prev) => [...prev, upload]);
    return upload.id;
  };

  const updateUpload = (id, updates) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  const removeUpload = (id) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status !== "complete"));
  };

  const clearAll = () => {
    setUploads([]);
  };

  return {
    uploads,
    addUpload,
    updateUpload,
    removeUpload,
    clearCompleted,
    clearAll,
  };
};

export default UploadProgressPanel;

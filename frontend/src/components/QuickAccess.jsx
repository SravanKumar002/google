import { Clock, Star, ChevronRight, File, Folder } from "lucide-react";
import { formatDate } from "../utils/helpers";

/**
 * QuickAccess Component
 * Shows starred items and recent files in a quick access panel
 */
const QuickAccess = ({
  starredFiles = [],
  recentFiles = [],
  onFileClick,
  onFolderClick,
  onViewAll,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const hasStarred = starredFiles.length > 0;
  const hasRecent = recentFiles.length > 0;

  if (!hasStarred && !hasRecent) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      {/* Starred Section */}
      {hasStarred && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="font-medium text-gray-900">Starred</h3>
            </div>
            <button
              onClick={() => onViewAll?.("starred")}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {starredFiles.slice(0, 6).map((file) => (
              <button
                key={file._id}
                onClick={() => onFileClick?.(file)}
                className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <File className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                <span className="text-xs text-gray-700 mt-2 truncate w-full text-center">
                  {file.originalName}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Section */}
      {hasRecent && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <h3 className="font-medium text-gray-900">Recent</h3>
            </div>
            <button
              onClick={() => onViewAll?.("recent")}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {recentFiles.slice(0, 5).map((file) => (
              <button
                key={file._id}
                onClick={() => onFileClick?.(file)}
                className="flex items-center w-full p-2 rounded-lg hover:bg-gray-50 transition-colors group text-left"
              >
                <File className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 ml-3 truncate flex-1">
                  {file.originalName}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  {formatDate(file.lastAccessedAt || file.updatedAt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickAccess;

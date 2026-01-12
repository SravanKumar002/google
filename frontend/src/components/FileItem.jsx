import { useState } from "react";
import {
  File,
  Image,
  FileText,
  Film,
  Music,
  Archive,
  MoreVertical,
  Download,
  Trash2,
  Edit2,
  Share2,
  History,
  FolderInput,
  Sparkles, // AI icon
  Star, // Star icon
  Eye, // Preview icon
} from "lucide-react";
import {
  formatFileSize,
  formatDate,
  getFileType,
  getFileTypeColor,
} from "../utils/helpers";

/**
 * Get icon component based on file type
 */
const getFileIcon = (mimeType, extension) => {
  const type = getFileType(mimeType, extension);
  const colorClass = getFileTypeColor(type);

  const icons = {
    image: <Image className={`w-10 h-10 ${colorClass}`} />,
    video: <Film className={`w-10 h-10 ${colorClass}`} />,
    audio: <Music className={`w-10 h-10 ${colorClass}`} />,
    pdf: <FileText className={`w-10 h-10 ${colorClass}`} />,
    document: <FileText className={`w-10 h-10 ${colorClass}`} />,
    text: <FileText className={`w-10 h-10 ${colorClass}`} />,
    archive: <Archive className={`w-10 h-10 ${colorClass}`} />,
    spreadsheet: <FileText className={`w-10 h-10 ${colorClass}`} />,
    presentation: <FileText className={`w-10 h-10 ${colorClass}`} />,
    file: <File className={`w-10 h-10 ${colorClass}`} />,
  };

  return icons[type] || icons.file;
};

/**
 * FileItem Component
 * Displays a file with actions (download, rename, delete, share, versions, move, AI, star, preview)
 */
const FileItem = ({
  file,
  onDownload,
  onRename,
  onDelete,
  onShare,
  onVersions,
  onMove,
  onAskAI, // New: AI assistant handler
  onToggleStar, // New: Star toggle handler
  onPreview, // New: Preview handler
  folders,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.originalName);
  const [showMoveModal, setShowMoveModal] = useState(false);

  const handleRename = async () => {
    if (newName.trim() && newName !== file.originalName) {
      await onRename(file._id, newName.trim());
    }
    setIsRenaming(false);
    setNewName(file.originalName);
  };

  const handleDelete = async () => {
    if (window.confirm(`Move "${file.originalName}" to trash?`)) {
      await onDelete(file._id);
    }
    setShowMenu(false);
  };

  const handleMove = async (targetFolderId) => {
    await onMove(file._id, targetFolderId);
    setShowMoveModal(false);
  };

  return (
    <div className="drive-item relative group bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center space-x-4">
        {/* File Icon */}
        <div className="flex-shrink-0">
          {getFileIcon(file.mimeType, file.extension)}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyPress={(e) => e.key === "Enter" && handleRename()}
              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
              autoFocus
            />
          ) : (
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.originalName}
            </p>
          )}
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-xs text-gray-500">
              {formatFileSize(file.size)}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">
              {formatDate(file.createdAt)}
            </span>
            {file.currentVersion > 1 && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-blue-600">
                  v{file.currentVersion}
                </span>
              </>
            )}
            {file.sharing?.isShared && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-green-600 flex items-center">
                  <Share2 className="w-3 h-3 mr-1" />
                  Shared
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Star Button */}
          {onToggleStar && (
            <button
              onClick={() => onToggleStar(file._id, file.isStarred)}
              className={`p-2 rounded-full ${
                file.isStarred
                  ? "text-yellow-500 hover:bg-yellow-50"
                  : "hover:bg-gray-100"
              }`}
              title={file.isStarred ? "Unstar" : "Star"}
            >
              <Star
                className="w-4 h-4"
                fill={file.isStarred ? "currentColor" : "none"}
              />
            </button>
          )}
          {/* Preview Button */}
          {onPreview && (
            <button
              onClick={() => onPreview(file)}
              className="p-2 hover:bg-blue-100 rounded-full"
              title="Preview"
            >
              <Eye className="w-4 h-4 text-blue-600" />
            </button>
          )}
          {/* AI Assistant Button - Only show for supported file types */}
          {(file.extension === ".pdf" ||
            file.extension === ".txt" ||
            file.extension === ".docx" ||
            file.extension === ".md" ||
            file.extension === ".json" ||
            file.extension === ".js" ||
            file.extension === ".py") &&
            onAskAI && (
              <button
                onClick={() => onAskAI(file)}
                className="p-2 hover:bg-purple-100 rounded-full"
                title="Ask AI about this file"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
              </button>
            )}
          <button
            onClick={() => onDownload(file._id, file.originalName)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Download"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onShare(file)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Share"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onVersions(file)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Version History"
          >
            <History className="w-4 h-4 text-gray-600" />
          </button>

          {/* More Actions Menu */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-14 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[150px]">
                <button
                  onClick={() => {
                    setIsRenaming(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => {
                    setShowMoveModal(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FolderInput className="w-4 h-4" />
                  <span>Move to</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Move to Trash</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Move Modal */}
      {showMoveModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowMoveModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Move to folder</h2>
            <div className="max-h-60 overflow-y-auto">
              <button
                onClick={() => handleMove(null)}
                className="flex items-center space-x-2 w-full px-4 py-3 text-left hover:bg-gray-100 rounded-lg"
              >
                <span className="text-sm">📁 My Drive (root)</span>
              </button>
              {folders.map((folder) => (
                <button
                  key={folder._id}
                  onClick={() => handleMove(folder._id)}
                  className="flex items-center space-x-2 w-full px-4 py-3 text-left hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-sm">📁 {folder.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowMoveModal(false)}
              className="mt-4 w-full py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileItem;

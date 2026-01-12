import { useState } from "react";
import { Folder, MoreVertical, Trash2, Edit2 } from "lucide-react";

/**
 * FolderItem Component
 * Displays a folder with actions (rename, delete)
 */
const FolderItem = ({ folder, onClick, onRename, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const handleRename = async () => {
    if (newName.trim() && newName !== folder.name) {
      await onRename(folder._id, newName.trim());
    }
    setIsRenaming(false);
    setNewName(folder.name);
  };

  const handleDelete = async () => {
    if (
      window.confirm(`Delete folder "${folder.name}" and all its contents?`)
    ) {
      await onDelete(folder._id);
    }
    setShowMenu(false);
  };

  return (
    <div
      className="drive-item relative group bg-white border border-gray-200 rounded-xl p-4 cursor-pointer"
      onClick={() => !isRenaming && onClick(folder._id)}
    >
      <div className="flex items-center space-x-3">
        {/* Folder Icon */}
        <div className="flex-shrink-0">
          <Folder className="w-10 h-10 text-gray-400 fill-gray-100" />
        </div>

        {/* Folder Name */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyPress={(e) => e.key === "Enter" && handleRename()}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none"
              autoFocus
            />
          ) : (
            <p className="text-sm font-medium text-gray-900 truncate">
              {folder.name}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[150px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderItem;

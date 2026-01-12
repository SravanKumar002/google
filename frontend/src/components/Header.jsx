import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, FolderPlus, X, Search, Loader2 } from "lucide-react";

const Header = ({
  onUpload,
  onCreateFolder,
  currentFolder,
  searchQuery = "",
  onSearch,
  onClearSearch,
  isSearching = false,
}) => {
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Sync local search with prop
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Debounced search
  const handleSearchChange = useCallback(
    (value) => {
      setLocalSearchQuery(value);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (onSearch) {
          onSearch(value);
        }
      }, 300);
    },
    [onSearch]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle file selection
  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload files one by one
      for (let i = 0; i < files.length; i++) {
        await onUpload(files[i], (progress) => {
          // Calculate overall progress
          const overallProgress =
            (i / files.length) * 100 + progress / files.length;
          setUploadProgress(Math.round(overallProgress));
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    try {
      await onCreateFolder(folderName.trim());
      setFolderName("");
      setShowNewFolderModal(false);
    } catch (error) {
      console.error("Create folder error:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45-6.9 3.45-6.9-3.45L12 4.18zM4 8.27l7 3.5v7.73l-7-3.5V8.27zm9 11.23V15.77l7-3.5v7.73l-7 3.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Drive Clone</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <input
              type="text"
              placeholder="Search files and folders..."
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            {localSearchQuery && (
              <button
                onClick={() => {
                  setLocalSearchQuery("");
                  if (onClearSearch) onClearSearch();
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* New Folder Button */}
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FolderPlus className="w-5 h-5" />
            <span>New Folder</span>
          </button>

          {/* Upload Button */}
          <label className="flex items-center space-x-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>Upload</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Folder</h2>
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              autoFocus
            />

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!folderName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

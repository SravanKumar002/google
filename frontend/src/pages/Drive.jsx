import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Header,
  Breadcrumb,
  FolderItem,
  FileItem,
  ShareModal,
  VersionModal,
  EmptyState,
  AskAIModal, // AI Chat Modal
  Sidebar, // Navigation Sidebar
  PreviewModal, // File Preview Modal
  DropZone, // Drag & Drop Upload
  ViewToggle, // Grid/List View Toggle
  useToast, // Toast notifications
} from "../components";
import {
  getDriveContents,
  uploadFile,
  downloadFile,
  moveFile,
  renameFile,
  createFolder,
  renameFolder,
  deleteFolder,
  getFolderBreadcrumb,
  getFolders,
  askAboutFile, // AI: Ask question
  summarizeFile, // AI: Summarize
  toggleStar, // Star toggle
  moveToTrash, // Soft delete
  getStorageAnalytics, // Analytics for sidebar
  searchFilesAndFolders, // Search
} from "../services/api";

/**
 * Drive Page
 * Main page showing folders and files in a Google Drive-like layout
 */
const Drive = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // State
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [allFolders, setAllFolders] = useState([]); // For move dropdown
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null); // For sidebar stats

  // View state
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState("name"); // 'name', 'date', 'size', 'type'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Modal state
  const [shareFile, setShareFile] = useState(null);
  const [versionFile, setVersionFile] = useState(null);
  const [aiFile, setAiFile] = useState(null); // AI modal state
  const [previewFile, setPreviewFile] = useState(null); // Preview modal state

  // Determine current view from path
  const currentView =
    location.pathname === "/" ? "drive" : location.pathname.slice(1);

  // Fetch analytics for sidebar
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await getStorageAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  }, []);

  // Fetch drive contents
  const fetchContents = useCallback(async (folderId = null) => {
    try {
      setLoading(true);
      setError("");

      const response = await getDriveContents(folderId);
      if (response.success) {
        setFolders(response.data.folders);
        setFiles(response.data.files);
        setCurrentFolder(folderId);
      }

      // Fetch breadcrumb if in a folder
      if (folderId) {
        const breadcrumbResponse = await getFolderBreadcrumb(folderId);
        if (breadcrumbResponse.success) {
          setBreadcrumb(breadcrumbResponse.data);
        }
      } else {
        setBreadcrumb([]);
      }

      // Fetch all folders for move functionality
      const allFoldersResponse = await getFolders();
      if (allFoldersResponse.success) {
        setAllFolders(allFoldersResponse.data);
      }
    } catch (err) {
      console.error("Error fetching contents:", err);
      setError("Failed to load drive contents");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchContents();
    fetchAnalytics();
  }, [fetchContents, fetchAnalytics]);

  // Navigation
  const handleNavigate = (folderId) => {
    fetchContents(folderId);
  };

  // Sidebar navigation
  const handleSidebarNavigate = (view) => {
    if (view === "drive") {
      navigate("/");
    } else {
      navigate(`/${view}`);
    }
  };

  // Search handler
  const handleSearch = useCallback(
    async (query) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setSearchResults(null);
        return;
      }

      try {
        setIsSearching(true);
        const response = await searchFilesAndFolders(query);
        if (response.success) {
          setSearchResults(response.data);
        }
      } catch (err) {
        console.error("Search error:", err);
        showToast("Search failed", "error");
      } finally {
        setIsSearching(false);
      }
    },
    [showToast]
  );

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  // Sorting helper
  const sortItems = useCallback(
    (items, type = "file") => {
      return [...items].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "name":
            const nameA = type === "file" ? a.originalName : a.name;
            const nameB = type === "file" ? b.originalName : b.name;
            comparison = nameA.localeCompare(nameB);
            break;
          case "date":
            comparison = new Date(b.updatedAt) - new Date(a.updatedAt);
            break;
          case "size":
            if (type === "file") {
              comparison = (b.size || 0) - (a.size || 0);
            }
            break;
          case "type":
            if (type === "file") {
              comparison = (a.mimeType || "").localeCompare(b.mimeType || "");
            }
            break;
          default:
            break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
    },
    [sortBy, sortOrder]
  );

  // File operations
  const handleUpload = async (file, onProgress) => {
    try {
      await uploadFile(file, currentFolder, onProgress);
      fetchContents(currentFolder);
      fetchAnalytics();
      showToast(`"${file.name}" uploaded successfully`, "success");
    } catch (err) {
      console.error("Upload error:", err);
      showToast(`Failed to upload "${file.name}"`, "error");
      throw err;
    }
  };

  // Drag & drop upload handler
  const handleDropUpload = async (droppedFiles) => {
    for (const file of droppedFiles) {
      try {
        await uploadFile(file, currentFolder);
        showToast(`"${file.name}" uploaded successfully`, "success");
      } catch (err) {
        console.error("Upload error:", err);
        showToast(`Failed to upload "${file.name}"`, "error");
      }
    }
    fetchContents(currentFolder);
    fetchAnalytics();
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      await downloadFile(fileId, fileName);
      showToast(`"${fileName}" downloaded`, "success");
    } catch (err) {
      console.error("Download error:", err);
      showToast("Download failed", "error");
    }
  };

  const handleRenameFile = async (fileId, newName) => {
    try {
      await renameFile(fileId, newName);
      fetchContents(currentFolder);
      showToast("File renamed successfully", "success");
    } catch (err) {
      console.error("Rename error:", err);
      showToast("Failed to rename file", "error");
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await moveToTrash(fileId);
      fetchContents(currentFolder);
      fetchAnalytics(); // Update sidebar counts
      showToast("File moved to trash", "success");
    } catch (err) {
      console.error("Move to trash error:", err);
      showToast("Failed to move file to trash", "error");
    }
  };

  // Star toggle
  const handleToggleStar = async (fileId, currentlyStarred) => {
    try {
      await toggleStar(fileId);
      // Update local state immediately for responsiveness
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
      fetchAnalytics(); // Update sidebar counts
      showToast(
        currentlyStarred ? "Removed from starred" : "Added to starred",
        "success"
      );
    } catch (err) {
      console.error("Star toggle error:", err);
      showToast("Failed to update starred status", "error");
    }
  };

  const handleMoveFile = async (fileId, targetFolderId) => {
    try {
      await moveFile(fileId, targetFolderId);
      fetchContents(currentFolder);
      showToast("File moved successfully", "success");
    } catch (err) {
      console.error("Move error:", err);
      showToast("Failed to move file", "error");
    }
  };

  // Folder operations
  const handleCreateFolder = async (name) => {
    try {
      await createFolder(name, currentFolder);
      fetchContents(currentFolder);
      showToast(`Folder "${name}" created`, "success");
    } catch (err) {
      console.error("Create folder error:", err);
      showToast("Failed to create folder", "error");
      throw err;
    }
  };

  const handleRenameFolder = async (folderId, newName) => {
    try {
      await renameFolder(folderId, newName);
      fetchContents(currentFolder);
      showToast("Folder renamed successfully", "success");
    } catch (err) {
      console.error("Rename folder error:", err);
      showToast("Failed to rename folder", "error");
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await deleteFolder(folderId);
      fetchContents(currentFolder);
      showToast("Folder deleted successfully", "success");
    } catch (err) {
      console.error("Delete folder error:", err);
      showToast("Failed to delete folder", "error");
    }
  };

  // ==================
  // AI OPERATIONS
  // ==================

  /**
   * Handle asking a question about a file
   * Uses RAG to find relevant content and generate answer
   */
  const handleAskAI = async (file, question) => {
    try {
      // Use the currentFileName as the file path (stored in uploads folder)
      const response = await askAboutFile(
        file.currentFileName,
        question,
        file._id
      );
      return response;
    } catch (err) {
      console.error("AI ask error:", err);
      return { success: false, error: err.message || "Failed to get answer" };
    }
  };

  /**
   * Handle summarizing a file
   */
  const handleSummarize = async (file) => {
    try {
      const response = await summarizeFile(file.currentFileName, file._id);
      return response;
    } catch (err) {
      console.error("AI summarize error:", err);
      return { success: false, error: err.message || "Failed to summarize" };
    }
  };

  // Refresh on modal close
  const handleModalUpdate = () => {
    fetchContents(currentFolder);
  };

  const isEmpty = folders.length === 0 && files.length === 0;

  // Get sorted items
  const sortedFolders = sortItems(
    searchResults ? searchResults.folders : folders,
    "folder"
  );
  const sortedFiles = sortItems(
    searchResults ? searchResults.files : files,
    "file"
  );
  const displayEmpty = sortedFolders.length === 0 && sortedFiles.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        onUpload={handleUpload}
        onCreateFolder={handleCreateFolder}
        currentFolder={currentFolder}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        isSearching={isSearching}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleSidebarNavigate}
          analytics={analytics}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200 bg-white">
            <Breadcrumb breadcrumb={breadcrumb} onNavigate={handleNavigate} />
            <ViewToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          </div>

          {/* Search Results Header */}
          {searchResults && (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
              <span className="text-blue-800">
                Search results for "<strong>{searchQuery}</strong>" -
                {sortedFolders.length} folder(s), {sortedFiles.length} file(s)
              </span>
              <button
                onClick={handleClearSearch}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Main Content with DropZone */}
          <DropZone onDrop={handleDropUpload} className="flex-1 overflow-auto">
            <main className="px-6 py-6">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
              ) : displayEmpty ? (
                searchResults ? (
                  <div className="text-center py-16">
                    <p className="text-gray-500">
                      No results found for "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  <EmptyState isRoot={!currentFolder} />
                )
              ) : (
                <div className="space-y-8">
                  {/* Folders Section */}
                  {sortedFolders.length > 0 && (
                    <section>
                      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                        Folders
                      </h2>
                      <div
                        className={
                          viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                            : "flex flex-col space-y-2"
                        }
                      >
                        {sortedFolders.map((folder) => (
                          <FolderItem
                            key={folder._id}
                            folder={folder}
                            onClick={handleNavigate}
                            onRename={handleRenameFolder}
                            onDelete={handleDeleteFolder}
                            viewMode={viewMode}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Files Section */}
                  {sortedFiles.length > 0 && (
                    <section>
                      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                        Files
                      </h2>
                      <div
                        className={
                          viewMode === "grid"
                            ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
                            : "flex flex-col space-y-2"
                        }
                      >
                        {sortedFiles.map((file) => (
                          <FileItem
                            key={file._id}
                            file={file}
                            onDownload={handleDownload}
                            onRename={handleRenameFile}
                            onDelete={handleDeleteFile}
                            onShare={setShareFile}
                            onVersions={setVersionFile}
                            onMove={handleMoveFile}
                            onAskAI={setAiFile}
                            onToggleStar={handleToggleStar}
                            onPreview={setPreviewFile}
                            folders={allFolders}
                            viewMode={viewMode}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </main>
          </DropZone>
        </div>
      </div>

      {/* Share Modal */}
      {shareFile && (
        <ShareModal
          file={shareFile}
          onClose={() => setShareFile(null)}
          onUpdate={handleModalUpdate}
        />
      )}

      {/* Version Modal */}
      {versionFile && (
        <VersionModal
          file={versionFile}
          onClose={() => setVersionFile(null)}
          onUpdate={handleModalUpdate}
        />
      )}

      {/* AI Chat Modal */}
      {aiFile && (
        <AskAIModal
          file={aiFile}
          onClose={() => setAiFile(null)}
          onAsk={handleAskAI}
          onSummarize={handleSummarize}
        />
      )}

      {/* Preview Modal */}
      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
};

export default Drive;

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tag,
  Search,
  FileText,
  ChevronRight,
  Hash,
  X,
  Loader2,
} from "lucide-react";
import { getAllTags, getFilesByTag } from "../services/api";
import { formatFileSize, formatDate } from "../utils/helpers";
import { useToast } from "../components";

/**
 * Tags Page
 * Browse and manage file tags
 */
const TagsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [tagFiles, setTagFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all tags
  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllTags();
      if (response.success) {
        setTags(response.data);
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
      showToast("Failed to load tags", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch files for a tag
  const fetchFilesForTag = useCallback(
    async (tag) => {
      try {
        setLoadingFiles(true);
        const response = await getFilesByTag(tag);
        if (response.success) {
          setTagFiles(response.data);
        }
      } catch (err) {
        console.error("Error fetching files for tag:", err);
        showToast("Failed to load files for tag", "error");
      } finally {
        setLoadingFiles(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Handle tag selection
  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    fetchFilesForTag(tag.name);
  };

  // Filter tags by search
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get color for tag based on count
  const getTagColor = (count) => {
    if (count >= 10) return "bg-blue-100 text-blue-800 border-blue-200";
    if (count >= 5) return "bg-green-100 text-green-800 border-green-200";
    if (count >= 3) return "bg-purple-100 text-purple-800 border-purple-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Tag className="w-8 h-8 text-gray-600" />
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
        </div>
        <div className="text-sm text-gray-500">
          {tags.length} tag{tags.length !== 1 && "s"}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Tags List */}
        <div className="w-1/3">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? "No tags match your search" : "No tags yet"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagClick(tag)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      selectedTag?.name === tag.name
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-800">
                        {tag.name}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${getTagColor(
                        tag.count
                      )}`}
                    >
                      {tag.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Popular Tags */}
          {tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10)
                  .map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        selectedTag?.name === tag.name
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      #{tag.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Files for Selected Tag */}
        <div className="flex-1">
          {selectedTag ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Tag Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Hash className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      #{selectedTag.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedTag.count} file{selectedTag.count !== 1 && "s"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Files List */}
              {loadingFiles ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              ) : tagFiles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No files found with this tag
                </div>
              ) : (
                <div className="space-y-3">
                  {tagFiles.map((file) => (
                    <div
                      key={file._id}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-8 h-8 text-gray-400 mr-3" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {file.originalName}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Select a Tag
              </h3>
              <p className="text-sm text-gray-500">
                Click on a tag to see all files with that tag
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagsPage;

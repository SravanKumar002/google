/**
 * SearchBar Component
 * Global search for files and folders
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, X, FileIcon, Folder, Clock, Star } from "lucide-react";
import { formatFileSize, getFileIcon } from "../utils/helpers";

const SearchBar = ({ onSearch, onSelectResult, recentSearches = [] }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await onSearch(query);
        setResults(searchResults);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowRecent(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsOpen(true);
    if (!query.trim() && recentSearches.length > 0) {
      setShowRecent(true);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const handleSelectResult = (item) => {
    onSelectResult?.(item);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder="Search in Drive"
          className="w-full pl-10 pr-10 py-2.5 bg-gray-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.trim() || showRecent) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mb-2" />
              <p className="text-sm">Searching...</p>
            </div>
          )}

          {/* Recent Searches */}
          {!loading &&
            showRecent &&
            !query.trim() &&
            recentSearches.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                  Recent
                </p>
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(item)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </button>
                ))}
              </div>
            )}

          {/* Search Results */}
          {!loading && query.trim() && results.length > 0 && (
            <div className="p-2">
              {/* Files */}
              {results.files?.length > 0 && (
                <>
                  <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                    Files
                  </p>
                  {results.files.map((file) => {
                    const IconComponent = getFileIcon(
                      file.extension,
                      file.mimeType
                    );
                    return (
                      <button
                        key={file._id}
                        onClick={() =>
                          handleSelectResult({ type: "file", ...file })
                        }
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg"
                      >
                        <div className="text-gray-500">
                          {typeof IconComponent === "function" ? (
                            <IconComponent size={18} />
                          ) : (
                            <FileIcon size={18} />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        {file.isStarred && (
                          <Star
                            className="w-4 h-4 text-yellow-500"
                            fill="currentColor"
                          />
                        )}
                      </button>
                    );
                  })}
                </>
              )}

              {/* Folders */}
              {results.folders?.length > 0 && (
                <>
                  <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase mt-2">
                    Folders
                  </p>
                  {results.folders.map((folder) => (
                    <button
                      key={folder._id}
                      onClick={() =>
                        handleSelectResult({ type: "folder", ...folder })
                      }
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Folder className="w-5 h-5 text-gray-400" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {folder.name}
                        </p>
                        <p className="text-xs text-gray-500">{folder.path}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {/* No Results */}
          {!loading &&
            query.trim() &&
            results.files?.length === 0 &&
            results.folders?.length === 0 && (
              <div className="p-6 text-center">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No results found for "{query}"</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

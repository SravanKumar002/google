import { useState } from "react";
import {
  Filter,
  Image,
  FileText,
  Film,
  Music,
  Archive,
  File,
  X,
  ChevronDown,
} from "lucide-react";

/**
 * File type filters for filtering files by type
 */
const fileTypes = [
  { id: "all", label: "All Files", icon: File },
  { id: "image", label: "Images", icon: Image, mimes: ["image/"] },
  {
    id: "document",
    label: "Documents",
    icon: FileText,
    mimes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats",
      "text/",
    ],
  },
  { id: "video", label: "Videos", icon: Film, mimes: ["video/"] },
  { id: "audio", label: "Audio", icon: Music, mimes: ["audio/"] },
  {
    id: "archive",
    label: "Archives",
    icon: Archive,
    mimes: ["application/zip", "application/x-rar", "application/x-7z"],
  },
];

/**
 * FileFilters Component
 * Filter files by type
 */
const FileFilters = ({ activeFilter = "all", onFilterChange, counts = {} }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const activeType =
    fileTypes.find((t) => t.id === activeFilter) || fileTypes[0];
  const ActiveIcon = activeType.icon;

  return (
    <div className="relative">
      {/* Mobile/Compact Dropdown */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors md:hidden"
      >
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">{activeType.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 md:hidden">
          {fileTypes.map((type) => {
            const Icon = type.icon;
            const count = counts[type.id] || 0;

            return (
              <button
                key={type.id}
                onClick={() => {
                  onFilterChange(type.id);
                  setShowDropdown(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm ${
                  activeFilter === type.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{type.label}</span>
                </div>
                {type.id !== "all" && count > 0 && (
                  <span className="text-xs text-gray-400">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Desktop Pills */}
      <div className="hidden md:flex items-center space-x-2">
        {fileTypes.map((type) => {
          const Icon = type.icon;
          const count = counts[type.id] || 0;
          const isActive = activeFilter === type.id;

          return (
            <button
              key={type.id}
              onClick={() => onFilterChange(type.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{type.label}</span>
              {type.id !== "all" && count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-blue-200" : "bg-gray-200"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {activeFilter !== "all" && (
          <button
            onClick={() => onFilterChange("all")}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            title="Clear filter"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Filter files by type
 */
export const filterFilesByType = (files, typeId) => {
  if (typeId === "all") return files;

  const type = fileTypes.find((t) => t.id === typeId);
  if (!type || !type.mimes) return files;

  return files.filter((file) =>
    type.mimes.some((mime) => file.mimeType?.startsWith(mime))
  );
};

/**
 * Count files by type
 */
export const countFilesByType = (files) => {
  const counts = { all: files.length };

  fileTypes.forEach((type) => {
    if (type.id === "all") return;
    counts[type.id] = files.filter((file) =>
      type.mimes?.some((mime) => file.mimeType?.startsWith(mime))
    ).length;
  });

  return counts;
};

export default FileFilters;

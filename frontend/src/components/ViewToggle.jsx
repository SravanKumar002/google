/**
 * ViewToggle Component
 * Toggle between grid and list view
 */

import React from "react";
import { Grid, List, ArrowUpDown, ChevronDown } from "lucide-react";

const ViewToggle = ({
  view,
  onViewChange,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const [showSortMenu, setShowSortMenu] = React.useState(false);

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "date", label: "Date modified" },
    { value: "size", label: "File size" },
    { value: "type", label: "File type" },
  ];

  const handleSortSelect = (value) => {
    if (sortBy === value) {
      // Toggle order if same field
      onSortChange(value, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Default to ascending for new field
      onSortChange(value, "asc");
    }
    setShowSortMenu(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Sort Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowSortMenu(!showSortMenu)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          <span>
            {sortOptions.find((o) => o.value === sortBy)?.label || "Sort"}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showSortMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowSortMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[160px]">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 ${
                    sortBy === option.value ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onViewChange("grid")}
          className={`p-1.5 rounded ${
            view === "grid"
              ? "bg-white shadow text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          title="Grid view"
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewChange("list")}
          className={`p-1.5 rounded ${
            view === "list"
              ? "bg-white shadow text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          title="List view"
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ViewToggle;

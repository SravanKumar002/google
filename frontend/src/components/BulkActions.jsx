import { useState } from "react";
import {
  CheckSquare,
  Square,
  Download,
  Trash2,
  Star,
  FolderInput,
  X,
} from "lucide-react";

/**
 * BulkActions Component
 * Provides multi-select functionality for files and folders
 */
const BulkActions = ({
  items,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onSelectionChange,
  onBulkDownload,
  onBulkDelete,
  onBulkStar,
  onBulkMove,
}) => {
  const [showMoveModal, setShowMoveModal] = useState(false);

  const selectedCount = selectedIds.length;
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-4 z-40">
      {/* Selection Count */}
      <div className="flex items-center space-x-2">
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="p-1 hover:bg-gray-700 rounded"
        >
          {allSelected ? (
            <CheckSquare className="w-5 h-5" />
          ) : someSelected ? (
            <Square className="w-5 h-5" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>
        <span className="text-sm font-medium">{selectedCount} selected</span>
      </div>

      <div className="w-px h-6 bg-gray-600" />

      {/* Bulk Actions */}
      <div className="flex items-center space-x-2">
        {/* Download */}
        <button
          onClick={onBulkDownload}
          className="flex items-center space-x-1 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          title="Download selected"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Download</span>
        </button>

        {/* Star */}
        <button
          onClick={onBulkStar}
          className="flex items-center space-x-1 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          title="Star selected"
        >
          <Star className="w-4 h-4" />
          <span className="text-sm">Star</span>
        </button>

        {/* Move */}
        <button
          onClick={() => setShowMoveModal(true)}
          className="flex items-center space-x-1 px-3 py-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          title="Move selected"
        >
          <FolderInput className="w-4 h-4" />
          <span className="text-sm">Move</span>
        </button>

        {/* Delete */}
        <button
          onClick={onBulkDelete}
          className="flex items-center space-x-1 px-3 py-1.5 hover:bg-red-600 rounded-lg transition-colors text-red-400 hover:text-white"
          title="Delete selected"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Delete</span>
        </button>
      </div>

      <div className="w-px h-6 bg-gray-600" />

      {/* Clear Selection */}
      <button
        onClick={onDeselectAll}
        className="p-2 hover:bg-gray-700 rounded-full"
        title="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * SelectionCheckbox Component
 * Checkbox for selecting individual items
 */
export const SelectionCheckbox = ({ isSelected, onChange, className = "" }) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!isSelected);
      }}
      className={`p-1 hover:bg-gray-100 rounded transition-colors ${className}`}
    >
      {isSelected ? (
        <CheckSquare className="w-5 h-5 text-blue-600" />
      ) : (
        <Square className="w-5 h-5 text-gray-400" />
      )}
    </button>
  );
};

export default BulkActions;

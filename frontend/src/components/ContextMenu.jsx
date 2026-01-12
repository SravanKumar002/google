/**
 * ContextMenu Component
 * Right-click context menu for files and folders
 */

import React, { useEffect, useRef } from "react";
import {
  Download,
  Share2,
  History,
  Star,
  Trash2,
  Edit2,
  FolderInput,
  Eye,
  Sparkles,
  Copy,
  Info,
} from "lucide-react";

const ContextMenu = ({
  x,
  y,
  item,
  type, // 'file' or 'folder'
  onClose,
  onDownload,
  onShare,
  onVersions,
  onStar,
  onDelete,
  onRename,
  onMove,
  onPreview,
  onAskAI,
  onCopyLink,
  onDetails,
}) => {
  const menuRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu would go off screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const adjustedX = Math.min(x, window.innerWidth - rect.width - 10);
      const adjustedY = Math.min(y, window.innerHeight - rect.height - 10);
      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [x, y]);

  const menuItems =
    type === "file"
      ? [
          {
            icon: Eye,
            label: "Preview",
            action: () => onPreview?.(item),
            show: true,
          },
          {
            icon: Download,
            label: "Download",
            action: () => onDownload?.(item._id, item.originalName),
            show: true,
          },
          { divider: true },
          {
            icon: Sparkles,
            label: "Ask AI",
            action: () => onAskAI?.(item),
            show: true,
          },
          { divider: true },
          {
            icon: Share2,
            label: "Share",
            action: () => onShare?.(item),
            show: true,
          },
          {
            icon: History,
            label: "Version history",
            action: () => onVersions?.(item),
            show: true,
          },
          { divider: true },
          {
            icon: Star,
            label: item.isStarred ? "Remove from starred" : "Add to starred",
            action: () => onStar?.(item._id, item.isStarred),
            show: true,
          },
          {
            icon: Edit2,
            label: "Rename",
            action: () => onRename?.(item),
            show: true,
          },
          {
            icon: FolderInput,
            label: "Move to",
            action: () => onMove?.(item),
            show: true,
          },
          { divider: true },
          {
            icon: Trash2,
            label: "Move to trash",
            action: () => onDelete?.(item._id),
            className: "text-red-600 hover:bg-red-50",
            show: true,
          },
        ]
      : [
          {
            icon: Eye,
            label: "Open",
            action: () => onPreview?.(item),
            show: true,
          },
          { divider: true },
          {
            icon: Edit2,
            label: "Rename",
            action: () => onRename?.(item),
            show: true,
          },
          {
            icon: FolderInput,
            label: "Move to",
            action: () => onMove?.(item),
            show: true,
          },
          { divider: true },
          {
            icon: Trash2,
            label: "Delete folder",
            action: () => onDelete?.(item._id),
            className: "text-red-600 hover:bg-red-50",
            show: true,
          },
        ];

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[200px] z-[100]"
      style={{ left: x, top: y }}
    >
      {menuItems
        .filter((item) => item.show !== false)
        .map((menuItem, idx) => {
          if (menuItem.divider) {
            return <hr key={idx} className="my-1 border-gray-200" />;
          }

          const Icon = menuItem.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                menuItem.action?.();
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                menuItem.className || "text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{menuItem.label}</span>
            </button>
          );
        })}
    </div>
  );
};

export default ContextMenu;

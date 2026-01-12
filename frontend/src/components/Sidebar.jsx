/**
 * Sidebar Component
 * Navigation sidebar with starred, trash, and analytics links
 */

import React from "react";
import {
  Home,
  Star,
  Trash2,
  Clock,
  BarChart2,
  Tag,
  HardDrive,
  ChevronRight,
  Settings,
} from "lucide-react";

const Sidebar = ({ currentView, onNavigate, analytics }) => {
  const navItems = [
    { id: "drive", label: "My Drive", icon: HardDrive },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "starred", label: "Starred", icon: Star },
    { id: "trash", label: "Trash", icon: Trash2 },
    { id: "tags", label: "Tags", icon: Tag },
    { id: "analytics", label: "Storage", icon: BarChart2 },
  ];

  const secondaryItems = [
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-blue-600" : "text-gray-500"}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === "starred" && analytics?.starredCount > 0 && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                      {analytics.starredCount}
                    </span>
                  )}
                  {item.id === "trash" && analytics?.trashCount > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                      {analytics.trashCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Secondary Navigation */}
        <div className="mt-6 pt-4 border-t border-gray-100 px-2">
          <ul className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isActive ? "text-blue-600" : "text-gray-500"}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Storage Usage */}
      {analytics && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Storage</span>
            <span className="text-xs text-gray-500">
              {formatBytes(analytics.totalStorage)} /{" "}
              {formatBytes(analytics.storageLimit)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                parseFloat(analytics.storageUsedPercent) > 80
                  ? "bg-red-500"
                  : parseFloat(analytics.storageUsedPercent) > 60
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
              style={{
                width: `${Math.min(100, analytics.storageUsedPercent)}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {analytics.storageUsedPercent}% used
          </p>
        </div>
      )}
    </aside>
  );
};

/**
 * Format bytes to human readable size
 */
function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default Sidebar;

import { useState, useEffect } from "react";
import {
  Activity,
  Upload,
  Download,
  Edit,
  Trash2,
  Share2,
  FolderPlus,
  Star,
  RotateCcw,
  X,
  Clock,
} from "lucide-react";

/**
 * Activity types and their icons
 */
const activityIcons = {
  upload: { icon: Upload, color: "text-green-500", bg: "bg-green-100" },
  download: { icon: Download, color: "text-blue-500", bg: "bg-blue-100" },
  rename: { icon: Edit, color: "text-purple-500", bg: "bg-purple-100" },
  delete: { icon: Trash2, color: "text-red-500", bg: "bg-red-100" },
  share: { icon: Share2, color: "text-cyan-500", bg: "bg-cyan-100" },
  folder_create: {
    icon: FolderPlus,
    color: "text-yellow-500",
    bg: "bg-yellow-100",
  },
  star: { icon: Star, color: "text-amber-500", bg: "bg-amber-100" },
  restore: { icon: RotateCcw, color: "text-emerald-500", bg: "bg-emerald-100" },
};

/**
 * Format relative time
 */
const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
};

/**
 * Activity Item Component
 */
const ActivityItem = ({ activity }) => {
  const iconData = activityIcons[activity.type] || activityIcons.upload;
  const IconComponent = iconData.icon;

  return (
    <div className="flex items-start space-x-3 py-3">
      <div className={`p-2 rounded-full ${iconData.bg}`}>
        <IconComponent className={`w-4 h-4 ${iconData.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{activity.action}</span>
          {activity.fileName && (
            <span className="text-gray-600"> "{activity.fileName}"</span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </div>
  );
};

/**
 * Activity Log Sidebar Panel
 */
const ActivityLogPanel = ({ isOpen, onClose, activities = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Activity</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto px-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * useActivityLog Hook
 * Tracks and manages activity log
 */
export const useActivityLog = (maxItems = 50) => {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem("driveActivityLog");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("driveActivityLog", JSON.stringify(activities));
  }, [activities]);

  const addActivity = (type, action, fileName = null) => {
    const newActivity = {
      id: Date.now(),
      type,
      action,
      fileName,
      timestamp: new Date().toISOString(),
    };

    setActivities((prev) => [newActivity, ...prev].slice(0, maxItems));
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem("driveActivityLog");
  };

  return { activities, addActivity, clearActivities };
};

export default ActivityLogPanel;

import { formatFileSize } from "../utils/helpers";

/**
 * StorageQuota Component
 * Visual indicator of storage usage
 */
const StorageQuota = ({
  usedSpace = 0,
  totalSpace = 15 * 1024 * 1024 * 1024, // Default 15GB
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-2 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-32 mt-2" />
      </div>
    );
  }

  const usedPercentage = Math.min((usedSpace / totalSpace) * 100, 100);
  const isNearLimit = usedPercentage > 80;
  const isAtLimit = usedPercentage > 95;

  // Color based on usage
  const getBarColor = () => {
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const getTextColor = () => {
    if (isAtLimit) return "text-red-600";
    if (isNearLimit) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Storage</span>
        <span className="text-xs text-gray-500">
          {usedPercentage.toFixed(0)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${usedPercentage}%` }}
        />
      </div>

      {/* Usage Text */}
      <p className={`text-xs mt-2 ${getTextColor()}`}>
        {formatFileSize(usedSpace)} of {formatFileSize(totalSpace)} used
      </p>

      {/* Warning Message */}
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-yellow-600 mt-1">
          ⚠️ Storage is almost full
        </p>
      )}
      {isAtLimit && (
        <p className="text-xs text-red-600 mt-1">🚫 Storage limit reached</p>
      )}
    </div>
  );
};

export default StorageQuota;

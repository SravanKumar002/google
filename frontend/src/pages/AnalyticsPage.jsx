/**
 * Analytics Page Component
 * Storage analytics dashboard with charts and insights
 */

import React, { useState, useEffect } from "react";
import {
  BarChart2,
  HardDrive,
  FileIcon,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  Code,
  Star,
  Trash2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { getStorageAnalytics } from "../services/api";

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getStorageAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err) {
      setError("Failed to load analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const categoryIcons = {
    Images: Image,
    Videos: Video,
    Audio: Music,
    PDFs: FileText,
    Documents: FileText,
    Spreadsheets: FileText,
    Presentations: FileText,
    "Text/Code": Code,
    Archives: Archive,
    Other: FileIcon,
  };

  const categoryColors = {
    Images: "bg-pink-500",
    Videos: "bg-purple-500",
    Audio: "bg-blue-500",
    PDFs: "bg-red-500",
    Documents: "bg-yellow-500",
    Spreadsheets: "bg-green-500",
    Presentations: "bg-orange-500",
    "Text/Code": "bg-cyan-500",
    Archives: "bg-gray-500",
    Other: "bg-gray-400",
  };

  // Calculate total for percentage
  const totalSize = Object.values(analytics.typeBreakdown).reduce(
    (sum, type) => sum + type.size,
    0
  );

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BarChart2 className="text-blue-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Storage Analytics
          </h1>
          <p className="text-sm text-gray-500">
            Insights about your file storage
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Storage */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HardDrive className="text-blue-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Storage Used</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatBytes(analytics.totalStorage)}
          </p>
          <p className="text-sm text-gray-500">
            of {formatBytes(analytics.storageLimit)}
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
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
        </div>

        {/* Total Files */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileIcon className="text-green-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Total Files</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.totalFiles}
          </p>
          <p className="text-sm text-gray-500">files in your drive</p>
        </div>

        {/* Starred Files */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="text-yellow-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">Starred</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.starredCount}
          </p>
          <p className="text-sm text-gray-500">favorite files</p>
        </div>

        {/* Trash */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="text-red-600" size={20} />
            </div>
            <span className="text-sm text-gray-500">In Trash</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {analytics.trashCount}
          </p>
          <p className="text-sm text-gray-500">files pending deletion</p>
        </div>
      </div>

      {/* Storage by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Type Breakdown Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Storage by Type
          </h2>

          {Object.keys(analytics.typeBreakdown).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileIcon className="mx-auto mb-2" size={32} />
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(analytics.typeBreakdown)
                .sort((a, b) => b[1].size - a[1].size)
                .map(([type, data]) => {
                  const Icon = categoryIcons[type] || FileIcon;
                  const percentage =
                    totalSize > 0 ? (data.size / totalSize) * 100 : 0;

                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {type}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({data.count} files)
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatBytes(data.size)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            categoryColors[type] || "bg-gray-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Largest Files */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Largest Files
            </h2>
            <TrendingUp size={18} className="text-gray-400" />
          </div>

          {analytics.largestFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileIcon className="mx-auto mb-2" size={32} />
              <p>No files to display</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.largestFiles.map((file, index) => {
                const Icon = categoryIcons[file.type] || FileIcon;

                return (
                  <div
                    key={file._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-sm font-medium text-gray-400 w-5">
                      {index + 1}
                    </span>
                    <Icon size={16} className="text-gray-500" />
                    <span
                      className="flex-1 text-sm text-gray-700 truncate"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={18} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>
        </div>
        <p className="text-gray-600">
          <span className="font-semibold text-blue-600">
            {analytics.recentUploads}
          </span>{" "}
          files uploaded in the last 7 days
        </p>
      </div>
    </div>
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

export default AnalyticsPage;

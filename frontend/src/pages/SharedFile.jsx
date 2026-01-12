import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, FileText, ArrowLeft, AlertCircle } from "lucide-react";
import { accessSharedFile } from "../services/api";
import {
  formatFileSize,
  formatDate,
  getFileType,
  getFileTypeColor,
} from "../utils/helpers";

/**
 * SharedFile Page
 * Public page for accessing shared files via link
 */
const SharedFile = () => {
  const { shareLink } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSharedFile();
  }, [shareLink]);

  const fetchSharedFile = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await accessSharedFile(shareLink);
      if (response.success) {
        setFileData(response.data);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("This file does not exist or the link is invalid.");
      } else if (err.response?.status === 403) {
        setError("This file is no longer shared.");
      } else {
        setError("Failed to load shared file.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (fileData?.downloadUrl) {
      window.open(fileData.downloadUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            File Unavailable
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Drive</span>
          </Link>
        </div>
      </div>
    );
  }

  const fileType = getFileType(fileData.mimeType, fileData.extension);
  const colorClass = getFileTypeColor(fileType);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-lg">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
            <FileText className={`w-8 h-8 ${colorClass}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {fileData.fileName}
            </h1>
            <p className="text-sm text-gray-500">Shared file</p>
          </div>
        </div>

        {/* File Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Size
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formatFileSize(fileData.size)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Type
              </p>
              <p className="text-sm font-medium text-gray-900">
                {fileData.extension || "Unknown"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Uploaded
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(fileData.uploadedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span className="font-medium">Download File</span>
        </button>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            Powered by Drive Clone
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedFile;

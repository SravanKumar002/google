import { useState, useEffect, useRef } from "react";
import {
  X,
  History,
  Download,
  RotateCcw,
  Upload,
  Check,
  Clock,
} from "lucide-react";
import {
  getVersionHistory,
  uploadNewVersion,
  downloadVersion,
  restoreVersion,
} from "../services/api";
import { formatFileSize, formatDate } from "../utils/helpers";

/**
 * VersionModal Component
 * Displays and manages file version history
 */
const VersionModal = ({ file, onClose, onUpdate }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  // Fetch version history on mount
  useEffect(() => {
    fetchVersionHistory();
  }, [file._id]);

  const fetchVersionHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getVersionHistory(file._id);
      if (response.success) {
        setVersions(response.data.versions);
      }
    } catch (err) {
      setError("Failed to fetch version history");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNewVersion = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError("");
      setSuccess("");

      await uploadNewVersion(file._id, selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      setSuccess("New version uploaded successfully!");
      fetchVersionHistory();
      onUpdate();
    } catch (err) {
      setError("Failed to upload new version");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownloadVersion = async (versionNumber, originalName) => {
    try {
      await downloadVersion(file._id, versionNumber, originalName);
    } catch (err) {
      setError("Failed to download version");
    }
  };

  const handleRestoreVersion = async (versionNumber) => {
    if (
      !window.confirm(
        `Restore version ${versionNumber}? This will create a new version from the old one.`
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await restoreVersion(file._id, versionNumber);
      setSuccess(`Version ${versionNumber} restored as new current version!`);
      fetchVersionHistory();
      onUpdate();
    } catch (err) {
      setError("Failed to restore version");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Version History</h2>
              <p className="text-sm text-gray-500 truncate max-w-[400px]">
                {file.originalName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Upload New Version */}
        <div className="mb-4">
          <label className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
            <Upload className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">Upload new version</span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUploadNewVersion}
              disabled={uploading}
            />
          </label>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Uploading new version...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center space-x-2">
            <Check className="w-5 h-5" />
            <span className="text-sm">{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Version List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : versions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No version history available
            </p>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version._id || version.versionNumber}
                  className={`p-4 rounded-lg border ${
                    version.isCurrent
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          version.isCurrent
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        v{version.versionNumber}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {version.originalName}
                          {version.isCurrent && (
                            <span className="ml-2 text-xs text-blue-600 font-normal">
                              (Current)
                            </span>
                          )}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(version.createdAt)}
                          </span>
                          <span>{formatFileSize(version.size)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Version Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleDownloadVersion(
                            version.versionNumber,
                            version.originalName
                          )
                        }
                        className="p-2 hover:bg-gray-200 rounded-full"
                        title="Download this version"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      {!version.isCurrent && (
                        <button
                          onClick={() =>
                            handleRestoreVersion(version.versionNumber)
                          }
                          className="p-2 hover:bg-blue-100 rounded-full"
                          title="Restore this version"
                        >
                          <RotateCcw className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionModal;

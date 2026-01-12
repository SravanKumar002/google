import { useState, useEffect, useRef } from "react";
import {
  X,
  Link,
  Copy,
  Check,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { enableSharing, disableSharing, getShareStatus } from "../services/api";
import { copyToClipboard } from "../utils/helpers";

/**
 * ShareModal Component
 * Handles file sharing - generating and managing share links
 */
const ShareModal = ({ file, onClose, onUpdate }) => {
  const [isShared, setIsShared] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Fetch current share status on mount
  useEffect(() => {
    fetchShareStatus();
  }, [file._id]);

  const fetchShareStatus = async () => {
    try {
      setLoading(true);
      const response = await getShareStatus(file._id);
      if (response.success) {
        setIsShared(response.data.isShared);
        setShareLink(response.data.fullUrl || "");
      }
    } catch (err) {
      setError("Failed to fetch share status");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSharing = async () => {
    try {
      setError("");
      if (isShared) {
        // Disable sharing
        await disableSharing(file._id);
        setIsShared(false);
        setShareLink("");
      } else {
        // Enable sharing
        const response = await enableSharing(file._id);
        if (response.success) {
          setIsShared(true);
          setShareLink(response.data.fullUrl);
        }
      }
      onUpdate();
    } catch (err) {
      setError("Failed to update sharing settings");
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;

    setCopying(true);
    const success = await copyToClipboard(shareLink);
    setCopying(false);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Link className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Share File</h2>
              <p className="text-sm text-gray-500 truncate max-w-[300px]">
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

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* Share Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
              <div>
                <p className="font-medium text-gray-900">Public Link</p>
                <p className="text-sm text-gray-500">
                  {isShared
                    ? "Anyone with the link can view and download"
                    : "Only you can access this file"}
                </p>
              </div>
              <button
                onClick={handleToggleSharing}
                className="flex items-center"
              >
                {isShared ? (
                  <ToggleRight className="w-10 h-10 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>

            {/* Share Link */}
            {isShared && shareLink && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    disabled={copying}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <a
                  href={shareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open link in new tab</span>
                </a>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

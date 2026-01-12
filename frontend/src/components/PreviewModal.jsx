/**
 * Preview Modal Component
 * Modal for previewing various file types (images, PDFs, text, code, video, audio)
 */

import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  FileIcon,
  Image,
  FileText,
  Code,
  Film,
  Music,
  AlertCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { getFilePreview, downloadFile } from "../services/api";

const PreviewModal = ({ file, onClose }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getFilePreview(file._id);
        if (response.success) {
          setPreview(response.data);
        } else {
          setError("Failed to load preview");
        }
      } catch (err) {
        setError("Failed to load preview");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (file) {
      fetchPreview();
    }
  }, [file]);

  const handleDownload = async () => {
    try {
      await downloadFile(file._id, file.originalName);
    } catch (err) {
      console.error("Failed to download file:", err);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, onClose]);

  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <AlertCircle size={48} className="mb-3 text-gray-300" />
          <p>{error}</p>
        </div>
      );
    }

    if (!preview) return null;

    switch (preview.type) {
      case "image":
        return (
          <div className="flex items-center justify-center p-4">
            <img
              src={`http://localhost:5001${preview.url}`}
              alt={file.originalName}
              className="max-w-full max-h-[70vh] object-contain rounded"
            />
          </div>
        );

      case "pdf":
        return (
          <div className="h-[70vh] w-full">
            <iframe
              src={`http://localhost:5001${preview.url}`}
              className="w-full h-full rounded"
              title={file.originalName}
            />
          </div>
        );

      case "video":
        return (
          <div className="flex items-center justify-center p-4">
            <video
              src={`http://localhost:5001${preview.url}`}
              controls
              className="max-w-full max-h-[70vh] rounded"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case "audio":
        return (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-6 bg-gray-100 rounded-full mb-6">
              <Music size={64} className="text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium mb-4">
              {file.originalName}
            </p>
            <audio
              src={`http://localhost:5001${preview.url}`}
              controls
              className="w-full max-w-md"
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case "text":
      case "code":
        return (
          <div className="h-[70vh] overflow-auto">
            <pre
              className={`p-4 text-sm ${
                preview.type === "code"
                  ? "bg-gray-900 text-gray-100"
                  : "bg-gray-50 text-gray-800"
              } rounded overflow-x-auto`}
            >
              <code>{preview.content}</code>
            </pre>
            {preview.language && preview.type === "code" && (
              <div className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-400 bg-gray-800 rounded-bl">
                {preview.language}
              </div>
            )}
          </div>
        );

      case "unsupported":
        return (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <FileIcon size={64} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Preview not available</p>
            <p className="text-sm text-gray-400 mb-4">
              This file type cannot be previewed
            </p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Download to view
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const getPreviewIcon = () => {
    if (!preview) return FileIcon;
    switch (preview.type) {
      case "image":
        return Image;
      case "pdf":
      case "text":
        return FileText;
      case "code":
        return Code;
      case "video":
        return Film;
      case "audio":
        return Music;
      default:
        return FileIcon;
    }
  };

  const PreviewIcon = getPreviewIcon();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all ${
          isFullscreen ? "w-full h-full" : "w-full max-w-4xl max-h-[90vh]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gray-100 rounded-lg">
              <PreviewIcon size={20} className="text-gray-600" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-900 truncate">
                {file.originalName}
              </h2>
              {preview && (
                <p className="text-xs text-gray-500 capitalize">
                  {preview.type} preview
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={18} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto relative">
          {renderPreviewContent()}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;

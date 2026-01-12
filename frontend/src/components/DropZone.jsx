/**
 * DropZone Component
 * Enables drag-and-drop file uploads
 */

import React, { useState, useCallback } from "react";
import { Upload, FileIcon } from "lucide-react";

const DropZone = ({ onDrop, children, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragging(false);
      }
      return newCount;
    });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragCounter(0);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onDrop?.(files);
      }
    },
    [onDrop]
  );

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-50/95 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-lg font-medium text-blue-700">
              Drop files to upload
            </p>
            <p className="text-sm text-blue-500 mt-1">
              Files will be uploaded to the current folder
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;

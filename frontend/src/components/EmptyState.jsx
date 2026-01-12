import { Folder, File } from "lucide-react";

/**
 * EmptyState Component
 * Shown when a folder is empty
 */
const EmptyState = ({ isRoot }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        {isRoot ? (
          <Folder className="w-12 h-12 text-gray-400" />
        ) : (
          <File className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">
        {isRoot ? "Welcome to Drive Clone" : "This folder is empty"}
      </h3>
      <p className="text-gray-500 text-center max-w-md">
        {isRoot
          ? "Get started by uploading files or creating folders using the buttons above."
          : "Upload files or create subfolders to organize your content."}
      </p>
    </div>
  );
};

export default EmptyState;

import { useEffect, useCallback } from "react";
import { Keyboard, X } from "lucide-react";

/**
 * KeyboardShortcuts Hook
 * Provides global keyboard shortcuts for the app
 */
export const useKeyboardShortcuts = ({
  onUpload,
  onNewFolder,
  onSearch,
  onRefresh,
  onToggleView,
  onHelp,
}) => {
  const handleKeyDown = useCallback(
    (e) => {
      // Don't trigger if typing in input/textarea
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + U: Upload
      if ((e.metaKey || e.ctrlKey) && e.key === "u") {
        e.preventDefault();
        onUpload?.();
      }

      // Cmd/Ctrl + Shift + N: New Folder
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        onNewFolder?.();
      }

      // / or Cmd/Ctrl + K: Focus search
      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k")) {
        e.preventDefault();
        onSearch?.();
      }

      // Cmd/Ctrl + R: Refresh
      if ((e.metaKey || e.ctrlKey) && e.key === "r") {
        e.preventDefault();
        onRefresh?.();
      }

      // Cmd/Ctrl + Shift + V: Toggle view
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "V") {
        e.preventDefault();
        onToggleView?.();
      }

      // ?: Show keyboard shortcuts help
      if (e.key === "?") {
        e.preventDefault();
        onHelp?.();
      }
    },
    [onUpload, onNewFolder, onSearch, onRefresh, onToggleView, onHelp]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * Keyboard Shortcuts Help Modal
 */
const shortcuts = [
  { keys: ["⌘", "U"], description: "Upload file" },
  { keys: ["⌘", "⇧", "N"], description: "New folder" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["⌘", "K"], description: "Focus search" },
  { keys: ["⌘", "R"], description: "Refresh" },
  { keys: ["⌘", "⇧", "V"], description: "Toggle view mode" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
];

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Keyboard className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-gray-700">{shortcut.description}</span>
              <div className="flex items-center space-x-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-700"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Use <kbd className="px-1 bg-gray-100 rounded">⌘</kbd> on Mac or{" "}
            <kbd className="px-1 bg-gray-100 rounded">Ctrl</kbd> on Windows
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;

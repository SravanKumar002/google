import { useState, useEffect } from "react";
import {
  Settings,
  Moon,
  Sun,
  Grid,
  List,
  Bell,
  BellOff,
  Trash2,
  HardDrive,
  Palette,
  Save,
} from "lucide-react";
import { useToast } from "../components";

/**
 * Settings Page
 * User preferences and app settings
 */
const SettingsPage = () => {
  const { showToast } = useToast();

  // Load settings from localStorage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("driveSettings");
    return saved
      ? JSON.parse(saved)
      : {
          theme: "light",
          defaultView: "grid",
          notifications: true,
          autoDeleteTrash: true,
          trashRetentionDays: 30,
          confirmBeforeDelete: true,
          showHiddenFiles: false,
          compactMode: false,
        };
  });

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem("driveSettings", JSON.stringify(settings));
    showToast("Settings saved successfully", "success");
  };

  // Update a specific setting
  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <Settings className="w-8 h-8 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="space-y-8">
        {/* Appearance Section */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
          </div>

          <div className="space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-800">Theme</p>
                <p className="text-sm text-gray-500">
                  Choose your preferred color theme
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateSetting("theme", "light")}
                  className={`p-2 rounded-lg flex items-center space-x-2 ${
                    settings.theme === "light"
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                      : "bg-gray-100 text-gray-600 border-2 border-transparent"
                  }`}
                >
                  <Sun className="w-5 h-5" />
                  <span className="text-sm">Light</span>
                </button>
                <button
                  onClick={() => updateSetting("theme", "dark")}
                  className={`p-2 rounded-lg flex items-center space-x-2 ${
                    settings.theme === "dark"
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                      : "bg-gray-100 text-gray-600 border-2 border-transparent"
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  <span className="text-sm">Dark</span>
                </button>
              </div>
            </div>

            {/* Default View */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-800">Default View</p>
                <p className="text-sm text-gray-500">
                  How files are displayed by default
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateSetting("defaultView", "grid")}
                  className={`p-2 rounded-lg ${
                    settings.defaultView === "grid"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => updateSetting("defaultView", "list")}
                  className={`p-2 rounded-lg ${
                    settings.defaultView === "list"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-800">Compact Mode</p>
                <p className="text-sm text-gray-500">
                  Show more items with smaller spacing
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.compactMode}
                  onChange={(e) =>
                    updateSetting("compactMode", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            {/* Enable Notifications */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-800">
                  Enable Notifications
                </p>
                <p className="text-sm text-gray-500">
                  Show toast notifications for actions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) =>
                    updateSetting("notifications", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          </div>
        </section>

        {/* Trash Section */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Trash2 className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Trash</h2>
          </div>

          <div className="space-y-4">
            {/* Confirm Before Delete */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-800">
                  Confirm Before Delete
                </p>
                <p className="text-sm text-gray-500">
                  Ask for confirmation before moving to trash
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.confirmBeforeDelete}
                  onChange={(e) =>
                    updateSetting("confirmBeforeDelete", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Auto Delete Trash */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-800">
                  Auto-delete Trash Items
                </p>
                <p className="text-sm text-gray-500">
                  Automatically delete items after retention period
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoDeleteTrash}
                  onChange={(e) =>
                    updateSetting("autoDeleteTrash", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Retention Period */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-800">Retention Period</p>
                <p className="text-sm text-gray-500">
                  Days before trash items are permanently deleted
                </p>
              </div>
              <select
                value={settings.trashRetentionDays}
                onChange={(e) =>
                  updateSetting("trashRetentionDays", Number(e.target.value))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          </div>
        </section>

        {/* Storage Section */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <HardDrive className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Storage</h2>
          </div>

          <div className="space-y-4">
            {/* Show Hidden Files */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-800">Show Hidden Files</p>
                <p className="text-sm text-gray-500">
                  Display files that start with a dot
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showHiddenFiles}
                  onChange={(e) =>
                    updateSetting("showHiddenFiles", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

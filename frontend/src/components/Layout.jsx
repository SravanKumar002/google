/**
 * Layout Component
 * Provides consistent layout with header and sidebar for all pages
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header, Sidebar, AskAIModal, PreviewModal } from "../components";
import {
  getStorageAnalytics,
  askAboutFile,
  summarizeFile,
} from "../services/api";

const Layout = ({ children, onRefresh }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [analytics, setAnalytics] = useState(null);
  const [aiFile, setAiFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  // Determine current view from path
  const currentView =
    location.pathname === "/" ? "drive" : location.pathname.slice(1);

  // Fetch analytics for sidebar
  const fetchAnalytics = async () => {
    try {
      const response = await getStorageAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [location.pathname]);

  // Sidebar navigation
  const handleSidebarNavigate = (view) => {
    if (view === "drive") {
      navigate("/");
    } else {
      navigate(`/${view}`);
    }
  };

  // Refresh handler - refetch analytics and call parent's refresh if provided
  const handleRefresh = () => {
    fetchAnalytics();
    onRefresh?.();
  };

  // AI handlers
  const handleAskAI = async (file, question) => {
    try {
      const response = await askAboutFile(
        file.currentFileName,
        question,
        file._id
      );
      return response;
    } catch (err) {
      console.error("AI ask error:", err);
      return { success: false, error: err.message || "Failed to get answer" };
    }
  };

  const handleSummarize = async (file) => {
    try {
      const response = await summarizeFile(file.currentFileName, file._id);
      return response;
    } catch (err) {
      console.error("AI summarize error:", err);
      return { success: false, error: err.message || "Failed to summarize" };
    }
  };

  // Clone children with additional props
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onPreview: setPreviewFile,
        onAskAI: setAiFile,
        onRefresh: handleRefresh,
      });
    }
    return child;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - simplified for non-Drive pages */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors"
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 87.3 78"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
                fill="#0066da"
              />
              <path
                d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
                fill="#00ac47"
              />
              <path
                d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
                fill="#ea4335"
              />
              <path
                d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
                fill="#00832d"
              />
              <path
                d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
                fill="#2684fc"
              />
              <path
                d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
                fill="#ffba00"
              />
            </svg>
            <span>Drive Clone</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleSidebarNavigate}
          analytics={analytics}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {childrenWithProps}
        </div>
      </div>

      {/* AI Chat Modal */}
      {aiFile && (
        <AskAIModal
          file={aiFile}
          onClose={() => setAiFile(null)}
          onAsk={handleAskAI}
          onSummarize={handleSummarize}
        />
      )}

      {/* Preview Modal */}
      {previewFile && (
        <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
};

export default Layout;

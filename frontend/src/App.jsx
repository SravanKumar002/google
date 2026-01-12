import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Drive,
  SharedFile,
  StarredPage,
  TrashPage,
  AnalyticsPage,
  RecentPage,
  SettingsPage,
  TagsPage,
} from "./pages";
import { Layout, ToastProvider } from "./components";

/**
 * App Component
 * Main application with routing
 */
function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Drive Page - has its own layout */}
          <Route path="/" element={<Drive />} />

          {/* Starred Files */}
          <Route
            path="/starred"
            element={
              <Layout>
                <StarredPage />
              </Layout>
            }
          />

          {/* Trash / Recycle Bin */}
          <Route
            path="/trash"
            element={
              <Layout>
                <TrashPage />
              </Layout>
            }
          />

          {/* Storage Analytics */}
          <Route
            path="/analytics"
            element={
              <Layout>
                <AnalyticsPage />
              </Layout>
            }
          />

          {/* Recent Files */}
          <Route
            path="/recent"
            element={
              <Layout>
                <RecentPage />
              </Layout>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <Layout>
                <SettingsPage />
              </Layout>
            }
          />

          {/* Tags */}
          <Route
            path="/tags"
            element={
              <Layout>
                <TagsPage />
              </Layout>
            }
          />

          {/* Shared File Page */}
          <Route path="/shared/:shareLink" element={<SharedFile />} />

          {/* Catch all - redirect to drive */}
          <Route path="*" element={<Drive />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

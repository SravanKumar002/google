import { Home, ChevronRight } from "lucide-react";

/**
 * Breadcrumb Component
 * Shows the current folder path and allows navigation
 */
const Breadcrumb = ({ breadcrumb, onNavigate }) => {
  return (
    <nav className="flex items-center space-x-2 px-6 py-3 bg-gray-50 border-b border-gray-200">
      {/* Home/Root */}
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="text-sm font-medium">My Drive</span>
      </button>

      {/* Breadcrumb Items */}
      {breadcrumb.map((item, index) => (
        <div key={item._id} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => onNavigate(item._id)}
            className={`text-sm font-medium transition-colors ${
              index === breadcrumb.length - 1
                ? "text-gray-800 cursor-default"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;

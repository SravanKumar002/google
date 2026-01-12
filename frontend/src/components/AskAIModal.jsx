import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  User,
  Loader2,
  FileText,
  Sparkles,
  AlertCircle,
} from "lucide-react";

/**
 * AskAIModal Component
 * Chat-style modal for asking questions about a file using RAG
 *
 * Features:
 * - Chat interface with message history
 * - Loading states during AI processing
 * - Error handling and display
 * - Auto-scroll to latest message
 */
const AskAIModal = ({ file, onClose, onAsk, onSummarize }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Handle asking a question
   */
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMessage = question.trim();
    setQuestion("");
    setError(null);

    // Add user message to chat
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);

    setIsLoading(true);

    try {
      const response = await onAsk(file, userMessage);

      if (response.success) {
        // Add AI response to chat
        setMessages((prev) => [
          ...prev,
          {
            type: "assistant",
            content: response.answer,
            sources: response.sources,
          },
        ]);
      } else {
        setError(response.error || "Failed to get answer");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle summarize request
   */
  const handleSummarize = async () => {
    if (isSummarizing) return;
    setError(null);

    // Add system message
    setMessages((prev) => [
      ...prev,
      { type: "user", content: "📋 Summarize this document" },
    ]);

    setIsSummarizing(true);

    try {
      const response = await onSummarize(file);

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          { type: "assistant", content: response.summary },
        ]);
      } else {
        setError(response.error || "Failed to summarize");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSummarizing(false);
    }
  };

  const isProcessing = isLoading || isSummarizing;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl h-[600px] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
              <p className="text-sm text-blue-100 truncate max-w-[300px]">
                {file.originalName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ask me about this file
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                I can answer questions based on the content of "
                {file.originalName}"
              </p>

              {/* Quick Actions */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleSummarize}
                  disabled={isProcessing}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Summarize
                </button>
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[80%] ${
                  message.type === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "user"
                      ? "bg-blue-600"
                      : "bg-gradient-to-br from-purple-500 to-blue-500"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>

                  {/* Show sources for AI responses */}
                  {message.sources && message.sources.length > 0 && (
                    <details className="mt-3 text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                        View sources ({message.sources.length})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {message.sources.map((source, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-gray-50 rounded text-gray-600 border-l-2 border-blue-400"
                          >
                            {source.text}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-sm text-gray-500">
                      {isSummarizing ? "Generating summary..." : "Thinking..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleAsk} className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isProcessing}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title="Summarize document"
            >
              <FileText className="w-5 h-5" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this file..."
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />

            <button
              type="submit"
              disabled={!question.trim() || isProcessing}
              className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskAIModal;

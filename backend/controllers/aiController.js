/**
 * AI Controller
 * Handles communication with the Python RAG service
 *
 * This controller acts as a proxy between the frontend and the Python RAG microservice.
 * It forwards requests to the RAG service and returns the responses.
 */

const axios = require("axios");
const path = require("path");

// RAG Service URL - configure via environment variable
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || "http://localhost:8000";

// Axios instance for RAG service communication
const ragClient = axios.create({
  baseURL: RAG_SERVICE_URL,
  timeout: 60000, // 60 seconds timeout for AI operations
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Index a file for RAG queries
 * Called automatically after file upload
 *
 * @route POST /api/ai/index
 */
const indexFile = async (req, res) => {
  try {
    const { filePath, fileId } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: "File path is required",
      });
    }

    console.log(`[AI] Indexing file: ${filePath}`);

    // Call RAG service
    const response = await ragClient.post("/index-file", {
      file_path: filePath,
      file_id: fileId,
    });

    console.log(`[AI] Index response:`, response.data);

    res.json(response.data);
  } catch (error) {
    console.error("[AI] Index error:", error.message);

    // Handle RAG service connection errors
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error:
          "AI service is not available. Please ensure the RAG service is running.",
      });
    }

    res.status(500).json({
      success: false,
      error:
        error.response?.data?.error || error.message || "Failed to index file",
    });
  }
};

/**
 * Ask a question about a file
 * Uses RAG to find relevant context and generate an answer
 *
 * @route POST /api/ai/ask
 */
const askQuestion = async (req, res) => {
  try {
    const { filePath, fileId, question } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: "File path is required",
      });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "Question is required",
      });
    }

    console.log(`[AI] Question for ${filePath}: "${question}"`);

    // Call RAG service
    const response = await ragClient.post("/ask", {
      file_path: filePath,
      file_id: fileId,
      question: question.trim(),
    });

    console.log(`[AI] Answer generated successfully`);

    res.json(response.data);
  } catch (error) {
    console.error("[AI] Ask error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error:
          "AI service is not available. Please ensure the RAG service is running.",
      });
    }

    res.status(500).json({
      success: false,
      error:
        error.response?.data?.error || error.message || "Failed to get answer",
    });
  }
};

/**
 * Generate a summary of a file
 *
 * @route POST /api/ai/summarize
 */
const summarizeFile = async (req, res) => {
  try {
    const { filePath, fileId } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: "File path is required",
      });
    }

    console.log(`[AI] Summarizing file: ${filePath}`);

    // Call RAG service
    const response = await ragClient.post("/summarize", {
      file_path: filePath,
      file_id: fileId,
    });

    console.log(`[AI] Summary generated successfully`);

    res.json(response.data);
  } catch (error) {
    console.error("[AI] Summarize error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error:
          "AI service is not available. Please ensure the RAG service is running.",
      });
    }

    res.status(500).json({
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "Failed to summarize file",
    });
  }
};

/**
 * Check RAG service health
 *
 * @route GET /api/ai/health
 */
const checkHealth = async (req, res) => {
  try {
    const response = await ragClient.get("/health");
    res.json({
      success: true,
      ragService: response.data,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: "RAG service is not available",
      details: error.message,
    });
  }
};

/**
 * Get indexing statistics
 *
 * @route GET /api/ai/stats
 */
const getStats = async (req, res) => {
  try {
    const response = await ragClient.get("/stats");
    res.json({
      success: true,
      stats: response.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to get stats",
    });
  }
};

/**
 * Auto-generate tags for a file
 *
 * @route POST /api/ai/auto-tag
 */
const autoTagFile = async (req, res) => {
  try {
    const { filePath, fileId, maxTags = 5 } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: "File path is required",
      });
    }

    console.log(`[AI] Auto-tagging file: ${filePath}`);

    // Call RAG service
    const response = await ragClient.post("/auto-tag", {
      file_path: filePath,
      file_id: fileId,
      max_tags: maxTags,
    });

    console.log(`[AI] Tags generated:`, response.data.tags);

    res.json(response.data);
  } catch (error) {
    console.error("[AI] Auto-tag error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error: "AI service is not available",
      });
    }

    res.status(500).json({
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "Failed to auto-tag file",
    });
  }
};

/**
 * Ask a question across multiple files
 *
 * @route POST /api/ai/ask-multi
 */
const askMultipleFiles = async (req, res) => {
  try {
    const { filePaths, question } = req.body;

    if (!filePaths || !Array.isArray(filePaths) || filePaths.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one file path is required",
      });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: "Question is required",
      });
    }

    console.log(
      `[AI] Multi-file question for ${filePaths.length} files: "${question}"`
    );

    // Call RAG service
    const response = await ragClient.post("/ask-multi", {
      file_paths: filePaths,
      question: question.trim(),
    });

    console.log(`[AI] Multi-file answer generated`);

    res.json(response.data);
  } catch (error) {
    console.error("[AI] Multi-file ask error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error: "AI service is not available",
      });
    }

    res.status(500).json({
      success: false,
      error:
        error.response?.data?.error || error.message || "Failed to get answer",
    });
  }
};

/**
 * Generate a structured document from file content
 *
 * @route POST /api/ai/generate-doc
 */
const generateDocument = async (req, res) => {
  try {
    const { filePath, fileId, docType = "summary" } = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: "File path is required",
      });
    }

    const validTypes = ["summary", "report", "outline", "key_points"];
    if (!validTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid document type. Must be one of: ${validTypes.join(
          ", "
        )}`,
      });
    }

    console.log(`[AI] Generating ${docType} for: ${filePath}`);

    // Call RAG service
    const response = await ragClient.post("/generate-doc", {
      file_path: filePath,
      file_id: fileId,
      doc_type: docType,
    });

    console.log(`[AI] Document generated successfully`);

    res.json(response.data);
  } catch (error) {
    console.error("[AI] Generate doc error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error: "AI service is not available",
      });
    }

    res.status(500).json({
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "Failed to generate document",
    });
  }
};

/**
 * Helper function to index a file after upload
 * Can be called from fileController after successful upload
 *
 * @param {string} filePath - Path to the uploaded file
 * @param {string} fileId - MongoDB file ID
 * @returns {Promise<object>} Indexing result
 */
const indexFileAsync = async (filePath, fileId) => {
  try {
    const response = await ragClient.post("/index-file", {
      file_path: filePath,
      file_id: fileId,
    });
    return response.data;
  } catch (error) {
    console.error("[AI] Async indexing failed:", error.message);
    // Don't throw - indexing failure shouldn't break file upload
    return { success: false, error: error.message };
  }
};

module.exports = {
  indexFile,
  askQuestion,
  summarizeFile,
  checkHealth,
  getStats,
  indexFileAsync,
  autoTagFile,
  askMultipleFiles,
  generateDocument,
};

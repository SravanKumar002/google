/**
 * AI Routes
 * Handles all AI/RAG related endpoints
 *
 * These routes communicate with the Python RAG microservice
 * to provide AI-powered file analysis features.
 *
 * Endpoints:
 * - POST /api/ai/index     - Index a file for AI queries
 * - POST /api/ai/ask       - Ask a question about a file
 * - POST /api/ai/summarize - Generate a file summary
 * - GET  /api/ai/health    - Check RAG service health
 * - GET  /api/ai/stats     - Get indexing statistics
 */

const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// ============================================================================
// AI ROUTES
// ============================================================================

/**
 * @route   POST /api/ai/index
 * @desc    Index a file for RAG queries
 * @body    { filePath: string, fileId?: string }
 * @returns { success: boolean, message: string, num_chunks?: number }
 */
router.post("/index", aiController.indexFile);

/**
 * @route   POST /api/ai/ask
 * @desc    Ask a question about an indexed file
 * @body    { filePath: string, question: string, fileId?: string }
 * @returns { success: boolean, answer: string, sources?: array }
 */
router.post("/ask", aiController.askQuestion);

/**
 * @route   POST /api/ai/summarize
 * @desc    Generate a summary of a file
 * @body    { filePath: string, fileId?: string }
 * @returns { success: boolean, summary: string }
 */
router.post("/summarize", aiController.summarizeFile);

/**
 * @route   GET /api/ai/health
 * @desc    Check if RAG service is running
 * @returns { success: boolean, ragService: object }
 */
router.get("/health", aiController.checkHealth);

/**
 * @route   GET /api/ai/stats
 * @desc    Get indexing statistics
 * @returns { success: boolean, stats: object }
 */
router.get("/stats", aiController.getStats);

/**
 * @route   POST /api/ai/auto-tag
 * @desc    Auto-generate tags for a file using AI
 * @body    { filePath: string, fileId?: string, maxTags?: number }
 * @returns { success: boolean, tags: string[] }
 */
router.post("/auto-tag", aiController.autoTagFile);

/**
 * @route   POST /api/ai/ask-multi
 * @desc    Ask a question across multiple files
 * @body    { filePaths: string[], question: string }
 * @returns { success: boolean, answer: string, sources?: array }
 */
router.post("/ask-multi", aiController.askMultipleFiles);

/**
 * @route   POST /api/ai/generate-doc
 * @desc    Generate a structured document from file content
 * @body    { filePath: string, docType: "summary"|"report"|"outline"|"key_points", fileId?: string }
 * @returns { success: boolean, content: string, doc_type: string }
 */
router.post("/generate-doc", aiController.generateDocument);

module.exports = router;

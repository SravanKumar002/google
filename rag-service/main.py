"""
RAG Service - Main FastAPI Application
Provides endpoints for file indexing, question answering, and summarization

Endpoints:
- POST /index-file: Index a file for RAG queries
- POST /ask: Ask a question about an indexed file
- POST /summarize: Generate a summary of a file
- GET /health: Health check endpoint
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from config import config
from text_extractor import TextExtractor
from chunker import TextChunker
from vector_store import VectorStore
from ai_generator import AIGenerator

# Initialize FastAPI app
app = FastAPI(
    title="RAG Service",
    description="Retrieval-Augmented Generation service for Google Drive Clone",
    version="1.0.0"
)

# Configure CORS to allow requests from Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
chunker = TextChunker()


# ============================================================================
# Request/Response Models
# ============================================================================

class IndexFileRequest(BaseModel):
    """Request model for file indexing"""
    file_path: str  # Relative path from uploads folder or absolute path
    file_id: Optional[str] = None  # Optional file ID for reference


class AskRequest(BaseModel):
    """Request model for asking questions"""
    file_path: str
    question: str
    file_id: Optional[str] = None


class SummarizeRequest(BaseModel):
    """Request model for summarization"""
    file_path: str
    file_id: Optional[str] = None


class AutoTagRequest(BaseModel):
    """Request model for auto-tagging"""
    file_path: str
    file_id: Optional[str] = None
    max_tags: int = 5


class MultiFileAskRequest(BaseModel):
    """Request model for asking questions across multiple files"""
    file_paths: list  # List of file paths
    question: str


class GenerateDocRequest(BaseModel):
    """Request model for document generation"""
    file_path: str
    doc_type: str  # "summary", "report", "outline", "key_points"
    file_id: Optional[str] = None


class IndexFileResponse(BaseModel):
    """Response model for file indexing"""
    success: bool
    message: str
    file_path: str
    num_chunks: Optional[int] = None
    error: Optional[str] = None


class AskResponse(BaseModel):
    """Response model for questions"""
    success: bool
    answer: str
    sources: Optional[list] = None
    error: Optional[str] = None


class SummarizeResponse(BaseModel):
    """Response model for summarization"""
    success: bool
    summary: str
    error: Optional[str] = None


class AutoTagResponse(BaseModel):
    """Response model for auto-tagging"""
    success: bool
    tags: list
    error: Optional[str] = None


class GenerateDocResponse(BaseModel):
    """Response model for document generation"""
    success: bool
    content: str
    doc_type: str
    error: Optional[str] = None


# ============================================================================
# Helper Functions
# ============================================================================

def resolve_file_path(file_path: str) -> str:
    """
    Resolve file path to absolute path.
    Handles both relative (from uploads folder) and absolute paths.
    """
    if os.path.isabs(file_path):
        return file_path
    
    # Treat as relative to uploads folder
    return os.path.join(config.UPLOADS_BASE_PATH, file_path)


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "rag-service",
        "ai_provider": config.AI_PROVIDER,
        "embedding_model": config.EMBEDDING_MODEL
    }


@app.get("/stats")
async def get_stats():
    """Get indexing statistics"""
    return VectorStore.get_index_stats()


@app.post("/index-file", response_model=IndexFileResponse)
async def index_file(request: IndexFileRequest):
    """
    Index a file for RAG queries.
    
    This endpoint:
    1. Extracts text from the file
    2. Chunks the text into smaller segments
    3. Creates embeddings and stores in FAISS index
    
    Call this after file upload to enable AI features.
    """
    try:
        # Resolve file path
        absolute_path = resolve_file_path(request.file_path)
        
        # Check if file exists
        if not os.path.exists(absolute_path):
            return IndexFileResponse(
                success=False,
                message="File not found",
                file_path=request.file_path,
                error=f"File does not exist: {absolute_path}"
            )
        
        # Check if file type is supported
        if not TextExtractor.is_supported(absolute_path):
            return IndexFileResponse(
                success=False,
                message="Unsupported file type",
                file_path=request.file_path,
                error=f"File type not supported for text extraction"
            )
        
        # Extract text
        text = TextExtractor.extract(absolute_path)
        
        if not text.strip():
            return IndexFileResponse(
                success=False,
                message="No text content found",
                file_path=request.file_path,
                error="File appears to be empty or contains no extractable text"
            )
        
        # Chunk text
        chunks = chunker.chunk_text(text)
        
        # Index chunks
        result = VectorStore.index_file(absolute_path, chunks)
        
        if result["success"]:
            return IndexFileResponse(
                success=True,
                message="File indexed successfully",
                file_path=request.file_path,
                num_chunks=result["num_chunks"]
            )
        else:
            return IndexFileResponse(
                success=False,
                message="Indexing failed",
                file_path=request.file_path,
                error=result.get("error", "Unknown error")
            )
            
    except Exception as e:
        return IndexFileResponse(
            success=False,
            message="Error indexing file",
            file_path=request.file_path,
            error=str(e)
        )


@app.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """
    Ask a question about an indexed file.
    
    This endpoint:
    1. Searches for relevant chunks using semantic similarity
    2. Uses LLM to generate answer from retrieved context
    3. Constrains answer to document content only
    """
    try:
        # Resolve file path
        absolute_path = resolve_file_path(request.file_path)
        
        # Check if file is indexed
        if not VectorStore.is_indexed(absolute_path):
            # Try to index it first
            if os.path.exists(absolute_path) and TextExtractor.is_supported(absolute_path):
                text = TextExtractor.extract(absolute_path)
                chunks = chunker.chunk_text(text)
                VectorStore.index_file(absolute_path, chunks)
            else:
                return AskResponse(
                    success=False,
                    answer="",
                    error="File not indexed. Please index the file first."
                )
        
        # Validate question
        if not request.question.strip():
            return AskResponse(
                success=False,
                answer="",
                error="Question cannot be empty"
            )
        
        # Search for relevant chunks
        results = VectorStore.search(absolute_path, request.question)
        
        if not results:
            return AskResponse(
                success=False,
                answer="",
                error="No relevant content found in the document"
            )
        
        # Generate answer using AI
        answer = AIGenerator.generate_answer(request.question, results)
        
        # Return sources for transparency
        sources = [
            {"text": chunk[:200] + "..." if len(chunk) > 200 else chunk, "score": score}
            for chunk, score in results
        ]
        
        return AskResponse(
            success=True,
            answer=answer,
            sources=sources
        )
        
    except Exception as e:
        return AskResponse(
            success=False,
            answer="",
            error=str(e)
        )


@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_file(request: SummarizeRequest):
    """
    Generate a summary of a file.
    
    This endpoint:
    1. Extracts text from the file
    2. Uses LLM to generate a comprehensive summary
    """
    try:
        # Resolve file path
        absolute_path = resolve_file_path(request.file_path)
        
        # Check if file exists
        if not os.path.exists(absolute_path):
            return SummarizeResponse(
                success=False,
                summary="",
                error=f"File not found: {request.file_path}"
            )
        
        # Check if file type is supported
        if not TextExtractor.is_supported(absolute_path):
            return SummarizeResponse(
                success=False,
                summary="",
                error="Unsupported file type for summarization"
            )
        
        # Extract text
        text = TextExtractor.extract(absolute_path)
        
        if not text.strip():
            return SummarizeResponse(
                success=False,
                summary="",
                error="No text content found in file"
            )
        
        # Generate summary
        summary = AIGenerator.generate_summary(text)
        
        return SummarizeResponse(
            success=True,
            summary=summary
        )
        
    except Exception as e:
        return SummarizeResponse(
            success=False,
            summary="",
            error=str(e)
        )


@app.post("/auto-tag", response_model=AutoTagResponse)
async def auto_tag_file(request: AutoTagRequest):
    """
    Automatically generate tags for a file based on its content.
    
    Uses AI to analyze the document and extract relevant keywords/topics.
    """
    try:
        # Resolve file path
        absolute_path = resolve_file_path(request.file_path)
        
        # Check if file exists
        if not os.path.exists(absolute_path):
            return AutoTagResponse(
                success=False,
                tags=[],
                error=f"File not found: {request.file_path}"
            )
        
        # Check if file type is supported
        if not TextExtractor.is_supported(absolute_path):
            return AutoTagResponse(
                success=False,
                tags=[],
                error="Unsupported file type for auto-tagging"
            )
        
        # Extract text
        text = TextExtractor.extract(absolute_path)
        
        if not text.strip():
            return AutoTagResponse(
                success=False,
                tags=[],
                error="No text content found in file"
            )
        
        # Generate tags using AI
        tags = AIGenerator.generate_tags(text, request.max_tags)
        
        return AutoTagResponse(
            success=True,
            tags=tags
        )
        
    except Exception as e:
        return AutoTagResponse(
            success=False,
            tags=[],
            error=str(e)
        )


@app.post("/ask-multi")
async def ask_multiple_files(request: MultiFileAskRequest):
    """
    Ask a question across multiple files.
    
    This enables cross-document analysis and comparison.
    """
    try:
        if not request.file_paths:
            return {
                "success": False,
                "answer": "",
                "error": "No files provided"
            }
        
        if not request.question.strip():
            return {
                "success": False,
                "answer": "",
                "error": "Question cannot be empty"
            }
        
        all_results = []
        file_sources = {}
        
        for file_path in request.file_paths:
            absolute_path = resolve_file_path(file_path)
            
            # Check if file is indexed, index if needed
            if not VectorStore.is_indexed(absolute_path):
                if os.path.exists(absolute_path) and TextExtractor.is_supported(absolute_path):
                    text = TextExtractor.extract(absolute_path)
                    chunks = chunker.chunk_text(text)
                    VectorStore.index_file(absolute_path, chunks)
                else:
                    continue
            
            # Search for relevant chunks
            results = VectorStore.search(absolute_path, request.question, top_k=3)
            
            for chunk, score in results:
                all_results.append((chunk, score, file_path))
        
        if not all_results:
            return {
                "success": False,
                "answer": "",
                "error": "No relevant content found in the provided documents"
            }
        
        # Sort by score and take top results
        all_results.sort(key=lambda x: x[1], reverse=True)
        top_results = all_results[:5]
        
        # Format context with file sources
        context_parts = []
        for chunk, score, file_path in top_results:
            file_name = os.path.basename(file_path)
            context_parts.append(f"[From {file_name}]: {chunk}")
        
        combined_context = "\n\n".join(context_parts)
        
        # Generate answer using AI with multi-file context
        answer = AIGenerator.generate_multi_file_answer(
            request.question, 
            combined_context,
            [os.path.basename(fp) for fp in request.file_paths]
        )
        
        # Return sources
        sources = [
            {
                "file": os.path.basename(fp),
                "text": chunk[:200] + "..." if len(chunk) > 200 else chunk,
                "score": score
            }
            for chunk, score, fp in top_results
        ]
        
        return {
            "success": True,
            "answer": answer,
            "sources": sources
        }
        
    except Exception as e:
        return {
            "success": False,
            "answer": "",
            "error": str(e)
        }


@app.post("/generate-doc", response_model=GenerateDocResponse)
async def generate_document(request: GenerateDocRequest):
    """
    Generate a structured document from file content.
    
    Supports different document types:
    - summary: Executive summary
    - report: Detailed report
    - outline: Document outline
    - key_points: Key points extraction
    """
    try:
        # Resolve file path
        absolute_path = resolve_file_path(request.file_path)
        
        # Check if file exists
        if not os.path.exists(absolute_path):
            return GenerateDocResponse(
                success=False,
                content="",
                doc_type=request.doc_type,
                error=f"File not found: {request.file_path}"
            )
        
        # Check if file type is supported
        if not TextExtractor.is_supported(absolute_path):
            return GenerateDocResponse(
                success=False,
                content="",
                doc_type=request.doc_type,
                error="Unsupported file type"
            )
        
        # Extract text
        text = TextExtractor.extract(absolute_path)
        
        if not text.strip():
            return GenerateDocResponse(
                success=False,
                content="",
                doc_type=request.doc_type,
                error="No text content found in file"
            )
        
        # Generate document based on type
        content = AIGenerator.generate_document(text, request.doc_type)
        
        return GenerateDocResponse(
            success=True,
            content=content,
            doc_type=request.doc_type
        )
        
    except Exception as e:
        return GenerateDocResponse(
            success=False,
            content="",
            doc_type=request.doc_type,
            error=str(e)
        )


@app.delete("/index/{file_path:path}")
async def remove_index(file_path: str):
    """Remove a file's index from memory"""
    absolute_path = resolve_file_path(file_path)
    removed = VectorStore.remove_index(absolute_path)
    
    return {
        "success": removed,
        "message": "Index removed" if removed else "Index not found"
    }


# ============================================================================
# Application Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    print(f"Starting RAG Service on {config.HOST}:{config.PORT}")
    print(f"AI Provider: {config.AI_PROVIDER}")
    print(f"Embedding Model: {config.EMBEDDING_MODEL}")
    
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True  # Enable auto-reload for development
    )

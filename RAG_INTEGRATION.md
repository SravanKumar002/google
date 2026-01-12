# RAG Integration for Google Drive Clone

This document explains how the RAG (Retrieval-Augmented Generation) AI feature is integrated into the Google Drive Clone.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Node.js API    │────▶│  Python RAG     │
│  (Port 5173)    │     │  (Port 5000)    │     │  (Port 8000)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                      │
         │                      │                      │
         ▼                      ▼                      ▼
    User clicks           Routes request          FAISS Index
    "Ask AI" button       to Python service       + LLM Generation
```

## Components

### 1. Python RAG Service (`/rag-service`)

FastAPI microservice that handles:

- **Text Extraction**: PDF, DOCX, TXT files using PyPDF2 and python-docx
- **Chunking**: Splits documents into 500-700 token chunks with overlap
- **Embeddings**: Uses sentence-transformers (all-MiniLM-L6-v2)
- **Vector Search**: FAISS for fast similarity search
- **Generation**: OpenAI or Gemini for answer generation

**Files:**

- `main.py` - FastAPI endpoints
- `text_extractor.py` - Multi-format text extraction
- `chunker.py` - Token-aware text chunking
- `vector_store.py` - FAISS index management
- `ai_generator.py` - LLM integration (OpenAI/Gemini)

### 2. Node.js Integration (`/backend`)

**New Files:**

- `controllers/aiController.js` - Proxy to RAG service
- `routes/aiRoutes.js` - AI endpoints

**Endpoints:**

```
POST /api/ai/index     - Index a file for RAG
POST /api/ai/ask       - Ask a question about a file
POST /api/ai/summarize - Generate file summary
GET  /api/ai/health    - Check RAG service status
GET  /api/ai/stats     - Get indexing statistics
```

### 3. React Frontend (`/frontend`)

**New Components:**

- `components/AskAIModal.jsx` - Chat-style AI interface

**Updated Files:**

- `components/FileItem.jsx` - Added AI button (✨)
- `pages/Drive.jsx` - Integrated AI modal
- `services/api.js` - Added AI API functions

## Setup Instructions

### 1. Start MongoDB

```bash
mongod
```

### 2. Start Python RAG Service

```bash
cd rag-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your OpenAI/Gemini API key
python main.py
```

### 3. Start Node.js Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 4. Start React Frontend

```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Upload a PDF, DOCX, or TXT file
2. Hover over the file to see the ✨ (sparkle) icon
3. Click the sparkle to open the AI chat
4. Ask questions or click "Summarize"

## Supported File Types

| Type | Extensions                                   |
| ---- | -------------------------------------------- |
| PDF  | `.pdf`                                       |
| Word | `.docx`                                      |
| Text | `.txt`, `.md`                                |
| Code | `.py`, `.js`, `.jsx`, `.ts`, `.tsx`, `.json` |

## Configuration

### RAG Service Environment Variables

| Variable          | Description                        | Default            |
| ----------------- | ---------------------------------- | ------------------ |
| `AI_PROVIDER`     | LLM provider: `openai` or `gemini` | `openai`           |
| `OPENAI_API_KEY`  | OpenAI API key                     | -                  |
| `GEMINI_API_KEY`  | Google Gemini API key              | -                  |
| `CHUNK_SIZE`      | Tokens per chunk                   | `600`              |
| `TOP_K_RESULTS`   | Number of context chunks           | `4`                |
| `EMBEDDING_MODEL` | Sentence transformer model         | `all-MiniLM-L6-v2` |

### RAG Prompt Constraints

The system uses strict prompts to ensure answers are grounded in document content:

```
Answer strictly using the provided context.
If the answer is not present, say "I don't know based on the provided document."
```

## Troubleshooting

### AI service is not available

- Ensure the Python RAG service is running on port 8000
- Check `RAG_SERVICE_URL` in backend `.env`

### No answer generated

- File may not be in a supported format
- File content may be empty or scanned (image-based PDF)
- Try re-indexing by uploading a new version

### Slow responses

- First query requires embedding model download (~100MB)
- Subsequent queries are faster
- Consider using a GPU for production

# RAG Service

Python microservice for Retrieval-Augmented Generation (RAG) in the Google Drive Clone.

## Features

- **File Indexing**: Extract text from PDF, DOCX, TXT files and create vector embeddings
- **Question Answering**: Ask questions about file content using semantic search
- **Summarization**: Generate AI-powered summaries of documents

## Setup

### 1. Create Virtual Environment

```bash
cd rag-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. Run the Service

```bash
python main.py
# Or with uvicorn directly:
uvicorn main:app --reload --port 8000
```

## API Endpoints

### POST /index-file

Index a file for RAG queries.

```json
{
  "file_path": "path/to/file.pdf",
  "file_id": "optional-file-id"
}
```

### POST /ask

Ask a question about an indexed file.

```json
{
  "file_path": "path/to/file.pdf",
  "question": "What is the main topic of this document?"
}
```

### POST /summarize

Generate a summary of a file.

```json
{
  "file_path": "path/to/file.pdf"
}
```

### GET /health

Health check endpoint.

### GET /stats

Get indexing statistics.

## Architecture

```
rag-service/
├── main.py           # FastAPI application & endpoints
├── config.py         # Configuration management
├── text_extractor.py # PDF/DOCX/TXT text extraction
├── chunker.py        # Text chunking with tiktoken
├── vector_store.py   # FAISS vector index management
├── ai_generator.py   # OpenAI/Gemini text generation
└── requirements.txt  # Python dependencies
```

## Supported File Types

- PDF (.pdf)
- Word Documents (.docx)
- Text files (.txt, .md)
- Code files (.py, .js, .jsx, .ts, .tsx, .json)
# google_drive_rag

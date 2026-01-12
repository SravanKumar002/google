"""
Vector Store Module
Manages FAISS vector indices for document embeddings
"""

import os
import pickle
from typing import List, Dict, Tuple, Optional
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from config import config


class VectorStore:
    """
    Manages FAISS vector indices for semantic search.
    Stores embeddings per file for efficient retrieval.
    """
    
    # In-memory storage for file indices
    # Key: file_path, Value: {"index": FAISS index, "chunks": list of text chunks}
    _file_indices: Dict[str, Dict] = {}
    
    # Singleton embedding model
    _embedding_model: Optional[SentenceTransformer] = None
    
    @classmethod
    def get_embedding_model(cls) -> SentenceTransformer:
        """Get or initialize the embedding model (singleton pattern)"""
        if cls._embedding_model is None:
            print(f"Loading embedding model: {config.EMBEDDING_MODEL}")
            cls._embedding_model = SentenceTransformer(config.EMBEDDING_MODEL)
        return cls._embedding_model
    
    @classmethod
    def create_embeddings(cls, texts: List[str]) -> np.ndarray:
        """
        Create embeddings for a list of texts.
        
        Args:
            texts: List of text chunks to embed
            
        Returns:
            Numpy array of embeddings
        """
        model = cls.get_embedding_model()
        embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        return embeddings.astype('float32')
    
    @classmethod
    def index_file(cls, file_path: str, chunks: List[str]) -> Dict:
        """
        Create FAISS index for a file's chunks.
        
        Args:
            file_path: Path to the original file (used as key)
            chunks: List of text chunks from the file
            
        Returns:
            Status dictionary with indexing info
        """
        if not chunks:
            return {"success": False, "error": "No chunks to index"}
        
        # Create embeddings
        embeddings = cls.create_embeddings(chunks)
        
        # Get embedding dimension
        dimension = embeddings.shape[1]
        
        # Create FAISS index (using L2 distance)
        index = faiss.IndexFlatL2(dimension)
        
        # Add embeddings to index
        index.add(embeddings)
        
        # Store in memory
        cls._file_indices[file_path] = {
            "index": index,
            "chunks": chunks,
            "dimension": dimension
        }
        
        return {
            "success": True,
            "file_path": file_path,
            "num_chunks": len(chunks),
            "dimension": dimension
        }
    
    @classmethod
    def search(
        cls, 
        file_path: str, 
        query: str, 
        top_k: int = None
    ) -> List[Tuple[str, float]]:
        """
        Search for similar chunks in a file's index.
        
        Args:
            file_path: Path to the indexed file
            query: Search query
            top_k: Number of results to return (default from config)
            
        Returns:
            List of (chunk_text, similarity_score) tuples
        """
        top_k = top_k or config.TOP_K_RESULTS
        
        if file_path not in cls._file_indices:
            raise ValueError(f"File not indexed: {file_path}")
        
        file_data = cls._file_indices[file_path]
        index = file_data["index"]
        chunks = file_data["chunks"]
        
        # Create query embedding
        query_embedding = cls.create_embeddings([query])
        
        # Search index
        distances, indices = index.search(query_embedding, min(top_k, len(chunks)))
        
        # Build results
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(chunks):  # Valid index
                # Convert L2 distance to similarity score (lower distance = higher similarity)
                similarity = 1 / (1 + dist)
                results.append((chunks[idx], float(similarity)))
        
        return results
    
    @classmethod
    def is_indexed(cls, file_path: str) -> bool:
        """Check if a file has been indexed"""
        return file_path in cls._file_indices
    
    @classmethod
    def remove_index(cls, file_path: str) -> bool:
        """Remove a file's index from memory"""
        if file_path in cls._file_indices:
            del cls._file_indices[file_path]
            return True
        return False
    
    @classmethod
    def get_index_stats(cls) -> Dict:
        """Get statistics about stored indices"""
        return {
            "total_files": len(cls._file_indices),
            "files": [
                {
                    "path": path,
                    "chunks": len(data["chunks"]),
                    "dimension": data["dimension"]
                }
                for path, data in cls._file_indices.items()
            ]
        }

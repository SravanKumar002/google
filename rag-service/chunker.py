"""
Text Chunking Module
Splits documents into smaller chunks for embedding and retrieval
"""

from typing import List
import tiktoken
from config import config


class TextChunker:
    """
    Splits text into overlapping chunks for vector embedding.
    Uses tiktoken for accurate token counting.
    """
    
    def __init__(
        self, 
        chunk_size: int = None, 
        chunk_overlap: int = None
    ):
        """
        Initialize chunker with configurable parameters.
        
        Args:
            chunk_size: Maximum tokens per chunk (default from config: 600)
            chunk_overlap: Overlap tokens between chunks (default from config: 100)
        """
        self.chunk_size = chunk_size or config.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or config.CHUNK_OVERLAP
        
        # Lazy load tokenizer
        self._tokenizer = None
    
    @property
    def tokenizer(self):
        """Lazy load tokenizer on first use"""
        if self._tokenizer is None:
            self._tokenizer = tiktoken.get_encoding("cl100k_base")
        return self._tokenizer
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text using tiktoken"""
        return len(self.tokenizer.encode(text))
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks.
        
        Strategy:
        1. Split by paragraphs first (preserve semantic boundaries)
        2. Combine paragraphs until chunk_size is reached
        3. Create overlap with previous chunk
        
        Args:
            text: Full document text
            
        Returns:
            List of text chunks
        """
        if not text or not text.strip():
            return []
        
        # Split by paragraphs (double newline) or single newline if no paragraphs
        paragraphs = text.split('\n\n')
        if len(paragraphs) == 1:
            paragraphs = text.split('\n')
        
        # Filter empty paragraphs
        paragraphs = [p.strip() for p in paragraphs if p.strip()]
        
        chunks = []
        current_chunk = []
        current_tokens = 0
        
        for para in paragraphs:
            para_tokens = self.count_tokens(para)
            
            # If single paragraph exceeds chunk size, split it by sentences
            if para_tokens > self.chunk_size:
                # Save current chunk if not empty
                if current_chunk:
                    chunks.append('\n\n'.join(current_chunk))
                    current_chunk = []
                    current_tokens = 0
                
                # Split large paragraph into sentences
                sentences = self._split_into_sentences(para)
                for sentence in sentences:
                    sent_tokens = self.count_tokens(sentence)
                    
                    if current_tokens + sent_tokens > self.chunk_size and current_chunk:
                        chunks.append(' '.join(current_chunk))
                        # Keep overlap
                        overlap_text = ' '.join(current_chunk)
                        overlap_tokens = self.count_tokens(overlap_text)
                        if overlap_tokens > self.chunk_overlap:
                            current_chunk = current_chunk[-2:] if len(current_chunk) > 2 else current_chunk[-1:]
                            current_tokens = self.count_tokens(' '.join(current_chunk))
                        else:
                            current_chunk = []
                            current_tokens = 0
                    
                    current_chunk.append(sentence)
                    current_tokens += sent_tokens
            else:
                # Check if adding this paragraph exceeds limit
                if current_tokens + para_tokens > self.chunk_size and current_chunk:
                    chunks.append('\n\n'.join(current_chunk))
                    
                    # Create overlap from end of previous chunk
                    overlap_chunk = current_chunk[-1:] if current_chunk else []
                    current_chunk = overlap_chunk
                    current_tokens = self.count_tokens('\n\n'.join(current_chunk)) if current_chunk else 0
                
                current_chunk.append(para)
                current_tokens += para_tokens
        
        # Don't forget the last chunk
        if current_chunk:
            chunks.append('\n\n'.join(current_chunk))
        
        return chunks
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """Simple sentence splitter"""
        # Split on common sentence endings
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]

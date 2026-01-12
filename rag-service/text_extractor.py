"""
Text Extraction Module
Handles extracting text content from various file formats (PDF, DOCX, TXT)
"""

import os
from typing import Optional
from PyPDF2 import PdfReader
from docx import Document


class TextExtractor:
    """
    Extracts text from supported file formats.
    Supported formats: PDF, DOCX, TXT, MD
    """
    
    SUPPORTED_EXTENSIONS = {'.pdf', '.docx', '.txt', '.md', '.json', '.js', '.py', '.jsx', '.ts', '.tsx'}
    
    @classmethod
    def extract(cls, file_path: str) -> str:
        """
        Extract text from a file based on its extension.
        
        Args:
            file_path: Absolute path to the file
            
        Returns:
            Extracted text content as string
            
        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If file format is not supported
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        _, ext = os.path.splitext(file_path.lower())
        
        if ext == '.pdf':
            return cls._extract_pdf(file_path)
        elif ext == '.docx':
            return cls._extract_docx(file_path)
        elif ext in {'.txt', '.md', '.json', '.js', '.py', '.jsx', '.ts', '.tsx'}:
            return cls._extract_text(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}. Supported: {cls.SUPPORTED_EXTENSIONS}")
    
    @staticmethod
    def _extract_pdf(file_path: str) -> str:
        """Extract text from PDF file using PyPDF2"""
        text_parts = []
        
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        except Exception as e:
            raise ValueError(f"Error reading PDF: {str(e)}")
        
        return "\n\n".join(text_parts)
    
    @staticmethod
    def _extract_docx(file_path: str) -> str:
        """Extract text from DOCX file using python-docx"""
        try:
            doc = Document(file_path)
            paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
            return "\n\n".join(paragraphs)
        except Exception as e:
            raise ValueError(f"Error reading DOCX: {str(e)}")
    
    @staticmethod
    def _extract_text(file_path: str) -> str:
        """Extract text from plain text files"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except UnicodeDecodeError:
            # Fallback to latin-1 encoding
            with open(file_path, 'r', encoding='latin-1') as f:
                return f.read()
    
    @classmethod
    def is_supported(cls, file_path: str) -> bool:
        """Check if file format is supported for text extraction"""
        _, ext = os.path.splitext(file_path.lower())
        return ext in cls.SUPPORTED_EXTENSIONS

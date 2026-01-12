"""
AI Generator Module
Handles text generation using OpenAI or Google Gemini
"""

from typing import List, Tuple
from config import config


class AIGenerator:
    """
    Generates answers and summaries using LLM APIs.
    Supports both OpenAI and Google Gemini.
    """
    
    # RAG prompt template - constrains model to use only provided context
    RAG_PROMPT_TEMPLATE = """You are a helpful AI assistant. Answer the user's question using ONLY the provided context from the document.

IMPORTANT RULES:
1. Answer strictly using the provided context
2. If the answer is not present in the context, say "I don't know based on the provided document."
3. Be concise and direct
4. Quote relevant parts when appropriate

CONTEXT FROM DOCUMENT:
{context}

USER QUESTION: {question}

ANSWER:"""

    # Summary prompt template
    SUMMARY_PROMPT_TEMPLATE = """Provide a comprehensive summary of the following document content.

INSTRUCTIONS:
1. Highlight the main topics and key points
2. Keep the summary concise but informative
3. Use bullet points for clarity when appropriate
4. Mention any important details, numbers, or conclusions

DOCUMENT CONTENT:
{content}

SUMMARY:"""

    # Auto-tagging prompt template
    AUTO_TAG_PROMPT_TEMPLATE = """Analyze the following document and extract the most relevant tags/keywords that describe its content.

INSTRUCTIONS:
1. Extract {max_tags} tags maximum
2. Tags should be single words or short phrases (2-3 words max)
3. Focus on main topics, themes, and key concepts
4. Return tags as a comma-separated list
5. Tags should be lowercase

DOCUMENT CONTENT:
{content}

TAGS (comma-separated):"""

    # Multi-file answer prompt template
    MULTI_FILE_PROMPT_TEMPLATE = """You are a helpful AI assistant. Answer the user's question using the provided context from MULTIPLE documents.

IMPORTANT RULES:
1. Synthesize information from all relevant sources
2. Indicate which document(s) the information comes from when helpful
3. Compare and contrast information if there are differences
4. If the answer is not present in any document, say "I don't have enough information from the provided documents."
5. Be concise and direct

FILES ANALYZED: {file_names}

CONTEXT FROM DOCUMENTS:
{context}

USER QUESTION: {question}

ANSWER:"""

    # Document generation templates
    DOCUMENT_TEMPLATES = {
        "summary": """Create an executive summary of the following document.

Include:
- Main purpose/topic
- Key findings or points
- Important conclusions
- Recommended actions (if applicable)

DOCUMENT:
{content}

EXECUTIVE SUMMARY:""",

        "report": """Create a detailed report based on the following document.

Structure:
1. Introduction/Overview
2. Main Content Analysis
3. Key Findings
4. Conclusions
5. Recommendations (if applicable)

DOCUMENT:
{content}

DETAILED REPORT:""",

        "outline": """Create a structured outline of the following document.

Format:
- Use hierarchical numbering (1., 1.1, 1.1.1, etc.)
- Include main sections and subsections
- Keep descriptions brief

DOCUMENT:
{content}

DOCUMENT OUTLINE:""",

        "key_points": """Extract and list the key points from the following document.

Format:
- Use bullet points
- Include the most important facts, findings, and conclusions
- Aim for 10-15 key points maximum
- Order by importance

DOCUMENT:
{content}

KEY POINTS:"""
    }

    @classmethod
    def generate_answer(
        cls, 
        question: str, 
        context_chunks: List[Tuple[str, float]]
    ) -> str:
        """
        Generate an answer using retrieved context chunks.
        
        Args:
            question: User's question
            context_chunks: List of (chunk_text, similarity_score) from vector search
            
        Returns:
            Generated answer string
        """
        # Combine context chunks
        context = "\n\n---\n\n".join([chunk for chunk, _ in context_chunks])
        
        # Build prompt
        prompt = cls.RAG_PROMPT_TEMPLATE.format(
            context=context,
            question=question
        )
        
        # Generate using configured provider
        if config.AI_PROVIDER == "openai":
            return cls._generate_openai(prompt)
        elif config.AI_PROVIDER == "gemini":
            return cls._generate_gemini(prompt)
        elif config.AI_PROVIDER == "groq":
            return cls._generate_groq(prompt)
        else:
            raise ValueError(f"Unknown AI provider: {config.AI_PROVIDER}")
    
    @classmethod
    def generate_summary(cls, content: str) -> str:
        """
        Generate a summary of document content.
        
        Args:
            content: Full document text (may be truncated for token limits)
            
        Returns:
            Generated summary string
        """
        # Truncate content if too long (keep first ~3000 tokens worth)
        max_chars = 12000  # Approximate limit
        if len(content) > max_chars:
            content = content[:max_chars] + "\n\n[Document truncated for summarization...]"
        
        # Build prompt
        prompt = cls.SUMMARY_PROMPT_TEMPLATE.format(content=content)
        
        # Generate using configured provider
        if config.AI_PROVIDER == "openai":
            return cls._generate_openai(prompt)
        elif config.AI_PROVIDER == "gemini":
            return cls._generate_gemini(prompt)
        elif config.AI_PROVIDER == "groq":
            return cls._generate_groq(prompt)
        else:
            raise ValueError(f"Unknown AI provider: {config.AI_PROVIDER}")

    @classmethod
    def generate_tags(cls, content: str, max_tags: int = 5) -> List[str]:
        """
        Generate tags for document content.
        
        Args:
            content: Full document text
            max_tags: Maximum number of tags to generate
            
        Returns:
            List of tag strings
        """
        # Truncate content if too long
        max_chars = 8000
        if len(content) > max_chars:
            content = content[:max_chars]
        
        # Build prompt
        prompt = cls.AUTO_TAG_PROMPT_TEMPLATE.format(
            content=content,
            max_tags=max_tags
        )
        
        # Generate using configured provider
        if config.AI_PROVIDER == "openai":
            response = cls._generate_openai(prompt)
        elif config.AI_PROVIDER == "gemini":
            response = cls._generate_gemini(prompt)
        elif config.AI_PROVIDER == "groq":
            response = cls._generate_groq(prompt)
        else:
            raise ValueError(f"Unknown AI provider: {config.AI_PROVIDER}")
        
        # Parse response into list of tags
        tags = [tag.strip().lower() for tag in response.split(",")]
        # Clean up and limit tags
        tags = [tag for tag in tags if tag and len(tag) < 50]
        return tags[:max_tags]

    @classmethod
    def generate_multi_file_answer(
        cls,
        question: str,
        context: str,
        file_names: List[str]
    ) -> str:
        """
        Generate an answer using context from multiple files.
        
        Args:
            question: User's question
            context: Combined context from multiple files
            file_names: List of file names being analyzed
            
        Returns:
            Generated answer string
        """
        # Build prompt
        prompt = cls.MULTI_FILE_PROMPT_TEMPLATE.format(
            file_names=", ".join(file_names),
            context=context,
            question=question
        )
        
        # Generate using configured provider
        if config.AI_PROVIDER == "openai":
            return cls._generate_openai(prompt)
        elif config.AI_PROVIDER == "gemini":
            return cls._generate_gemini(prompt)
        elif config.AI_PROVIDER == "groq":
            return cls._generate_groq(prompt)
        else:
            raise ValueError(f"Unknown AI provider: {config.AI_PROVIDER}")

    @classmethod
    def generate_document(cls, content: str, doc_type: str) -> str:
        """
        Generate a structured document from content.
        
        Args:
            content: Source document text
            doc_type: Type of document to generate
            
        Returns:
            Generated document string
        """
        # Get template for document type
        template = cls.DOCUMENT_TEMPLATES.get(doc_type)
        if not template:
            template = cls.DOCUMENT_TEMPLATES["summary"]  # Default to summary
        
        # Truncate content if too long
        max_chars = 12000
        if len(content) > max_chars:
            content = content[:max_chars] + "\n\n[Document truncated...]"
        
        # Build prompt
        prompt = template.format(content=content)
        
        # Generate using configured provider
        if config.AI_PROVIDER == "openai":
            return cls._generate_openai(prompt)
        elif config.AI_PROVIDER == "gemini":
            return cls._generate_gemini(prompt)
        elif config.AI_PROVIDER == "groq":
            return cls._generate_groq(prompt)
        else:
            raise ValueError(f"Unknown AI provider: {config.AI_PROVIDER}")
    
    @staticmethod
    def _generate_openai(prompt: str) -> str:
        """Generate text using OpenAI API"""
        from openai import OpenAI
        
        client = OpenAI(api_key=config.OPENAI_API_KEY)
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that answers questions based on document content."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1000,
            temperature=0.3  # Lower temperature for more focused answers
        )
        
        return response.choices[0].message.content.strip()
    
    @staticmethod
    def _generate_gemini(prompt: str) -> str:
        """Generate text using Google Gemini API"""
        import google.generativeai as genai
        
        genai.configure(api_key=config.GEMINI_API_KEY)
        
        # Use gemini-1.5-flash or gemini-pro as fallback
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        response = model.generate_content(
            prompt,
            generation_config={
                "max_output_tokens": 1000,
                "temperature": 0.3
            }
        )
        
        return response.text.strip()

    @staticmethod
    def _generate_groq(prompt: str) -> str:
        """Generate text using Groq API - fast LLM inference"""
        from groq import Groq
        
        client = Groq(api_key=config.GROQ_API_KEY)
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that answers questions based on document content."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        return response.choices[0].message.content.strip()

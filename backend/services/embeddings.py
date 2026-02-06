"""
Embedding service for intervention similarity matching.
Uses sentence-transformers for local, cost-effective embedding generation.
"""

import numpy as np
import logging
from typing import List, Dict, Tuple, Optional

logger = logging.getLogger(__name__)

import os

# Lazy import check
EMBEDDINGS_AVAILABLE = True  # We assume true until we try to import or check env



class EmbeddingService:
    """
    Service for generating and managing embeddings for intervention matching.
    Uses local sentence-transformers model for cost-effective, reliable embeddings.
    """
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize embedding service with specified model.
        
        Args:
            model_name: HuggingFace model name. 'all-MiniLM-L6-v2' is lightweight and effective.
        """
        self.model_name = model_name
        self.model = None
        
        # Check if disabled by env var (for memory constrained environments like Render free tier)
        if os.getenv("DISABLE_LOCAL_EMBEDDINGS", "false").lower() == "true":
            logger.warning("Local embeddings disabled via DISABLE_LOCAL_EMBEDDINGS env var")
            self.available = False
        else:
            self.available = EMBEDDINGS_AVAILABLE
        if self.available:
            # Lazy load: Do not load model in init
            logger.info("Embedding service initialized (lazy loading enabled)")
    
    def _ensure_model_loaded(self) -> None:
        """Ensure the sentence transformer model is loaded."""
        if not EMBEDDINGS_AVAILABLE:
            return

        if self.model is None:
            self._load_model()
    
    def _load_model(self) -> None:
        """Load the sentence transformer model."""
        if not self.available:
            return

        try:
            # Import here to avoid memory usage at startup
            from sentence_transformers import SentenceTransformer
            from sklearn.metrics.pairwise import cosine_similarity
            
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            
            # Monkey patch the similarity function if needed or store it
            self._cosine_similarity = cosine_similarity
            
            logger.info("Embedding model loaded successfully")
        except ImportError as e:
             logger.error(f"Failed to import sentence-transformers: {e}")
             self.available = False
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            self.available = False
            # Don't raise, just disable availability

    
    def generate_embedding(self, text: str) -> np.ndarray:
        """
        Generate embedding for a single text.
        
        Args:
            text: Input text to embed
            
        Returns:
            Numpy array containing the embedding vector
            
        Raises:
            RuntimeError: If model is not loaded
            ValueError: If text is empty
        """
        if not self.available:
            logger.warning("Embeddings not available - returning empty array")
            return np.array([])
            
        self._ensure_model_loaded()
        
        if not self.model:
            raise RuntimeError("Embedding model not loaded")
        
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        try:
            embedding = self.model.encode(text.strip())
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding for text: {e}")
            raise
    
    def generate_embeddings_batch(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for multiple texts efficiently.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            2D numpy array where each row is an embedding
        """
        if not self.available:
            logger.warning("Embeddings not available - returning empty array")
            return np.array([])
            
        self._ensure_model_loaded()
        
        if not self.model:
            raise RuntimeError("Embedding model not loaded")
        
        if not texts:
            return np.array([])
        
        # Filter out empty texts
        valid_texts = [text.strip() for text in texts if text and text.strip()]
        
        if not valid_texts:
            raise ValueError("No valid texts provided")
        
        try:
            embeddings = self.model.encode(valid_texts)
            return embeddings
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            raise
    
    def compute_similarity(self, query_embedding: np.ndarray, 
                          doc_embeddings: np.ndarray) -> np.ndarray:
        """
        Compute cosine similarity between query and document embeddings.
        
        Args:
            query_embedding: Single embedding vector (1D array)
            doc_embeddings: Multiple embedding vectors (2D array)
            
        Returns:
            1D array of similarity scores
        """
        if not self.available:
            logger.warning("Embeddings not available - returning zero similarities")
            return np.array([])
            
        try:
            # Ensure query_embedding is 2D for sklearn
            if query_embedding.ndim == 1:
                query_embedding = query_embedding.reshape(1, -1)
            
            if hasattr(self, '_cosine_similarity'):
                similarities = self._cosine_similarity(query_embedding, doc_embeddings)
            else:
                 from sklearn.metrics.pairwise import cosine_similarity
                 similarities = cosine_similarity(query_embedding, doc_embeddings)
                 
            return similarities.flatten()
        except Exception as e:
            logger.error(f"Error computing similarity: {e}")
            raise
    
    def find_most_similar(self, query_embedding: np.ndarray, 
                         doc_embeddings: np.ndarray,
                         top_k: int = 3) -> List[Tuple[int, float]]:
        """
        Find indices and scores of most similar documents.
        
        Args:
            query_embedding: Query embedding vector
            doc_embeddings: Document embedding matrix
            top_k: Number of top results to return
            
        Returns:
            List of (index, similarity_score) tuples, sorted by similarity desc
        """
        if not self.available:
            logger.warning("Embeddings not available - returning empty results")
            return []
            
        similarities = self.compute_similarity(query_embedding, doc_embeddings)
        
        if similarities.size == 0:
            return []
        
        # Get top k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        # Return (index, score) pairs
        results = [(int(idx), float(similarities[idx])) for idx in top_indices]
        return results


def create_intervention_text(intervention: Dict) -> str:
    """
    Create searchable text representation of an intervention for embedding.
    
    Args:
        intervention: Intervention dictionary with metadata
        
    Returns:
        Combined text suitable for embedding generation
    """
    parts = []
    
    # Add title and description (most important)
    if intervention.get('title'):
        parts.append(intervention['title'])
    
    if intervention.get('description'):
        parts.append(intervention['description'])
    
    # Add category and health issues
    if intervention.get('category'):
        parts.append(f"Category: {intervention['category']}")
    
    if intervention.get('health_issues'):
        health_issues = intervention['health_issues']
        if isinstance(health_issues, list):
            parts.append(f"Health issues: {', '.join(health_issues)}")
        else:
            parts.append(f"Health issues: {health_issues}")
    
    # Add target population and setting
    if intervention.get('target_population'):
        parts.append(f"Target: {intervention['target_population']}")
    
    if intervention.get('setting'):
        parts.append(f"Setting: {intervention['setting']}")
    
    # Add keywords if available
    if intervention.get('keywords'):
        keywords = intervention['keywords']
        if isinstance(keywords, list):
            parts.append(f"Keywords: {', '.join(keywords)}")
        else:
            parts.append(f"Keywords: {keywords}")
    
    return " | ".join(parts)

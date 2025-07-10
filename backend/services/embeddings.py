"""
Embedding service for intervention similarity matching.
Uses sentence-transformers for local, cost-effective embedding generation.
"""

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


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
        self.model: Optional[SentenceTransformer] = None
        self._load_model()
    
    def _load_model(self) -> None:
        """Load the sentence transformer model."""
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    
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
        try:
            # Ensure query_embedding is 2D for sklearn
            if query_embedding.ndim == 1:
                query_embedding = query_embedding.reshape(1, -1)
            
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
        similarities = self.compute_similarity(query_embedding, doc_embeddings)
        
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

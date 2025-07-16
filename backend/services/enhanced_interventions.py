"""
Enhanced intervention recommendation service.
Combines vector similarity search with keyword matching for optimal results.
"""

import asyncio
import httpx
import numpy as np
from typing import List, Dict, Tuple, Optional
import logging
from datetime import datetime, timedelta

from .embeddings import EmbeddingService, create_intervention_text

logger = logging.getLogger(__name__)


class EnhancedInterventionService:
    """
    Service for advanced intervention recommendations using hybrid search.
    Combines vector similarity, keyword matching, and health context scoring.
    """
    
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.intervention_cache = {
            "data": None,
            "embeddings": None,
            "timestamp": None,
            "max_age": 1800  # 30 minutes
        }
        self.s3_url = "https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/interventions/interventions-db.json"
    
    async def _fetch_interventions_from_s3(self) -> List[Dict]:
        """Fetch interventions from S3 storage."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(self.s3_url)
                response.raise_for_status()
                
                data = response.json()
                interventions = data.get("interventions", [])
                logger.info(f"Fetched {len(interventions)} interventions from S3")
                return interventions
                
        except Exception as e:
            logger.error(f"Failed to fetch interventions from S3: {e}")
            return []
    
    async def _ensure_cache_valid(self) -> None:
        """Ensure intervention cache is valid and up-to-date."""
        now = datetime.now()
        
        # Check if cache needs refresh
        if (not self.intervention_cache["data"] or 
            not self.intervention_cache["timestamp"] or
            now - self.intervention_cache["timestamp"] > timedelta(seconds=self.intervention_cache["max_age"])):
            
            logger.info("Refreshing intervention cache...")
            interventions = await self._fetch_interventions_from_s3()
            
            if interventions:
                # Try to generate embeddings for all interventions
                intervention_texts = [
                    create_intervention_text(intervention) 
                    for intervention in interventions
                ]
                
                embeddings = None
                if self.embedding_service.available:
                    try:
                        embeddings = self.embedding_service.generate_embeddings_batch(intervention_texts)
                        logger.info(f"Generated embeddings for {len(interventions)} interventions")
                    except Exception as e:
                        logger.error(f"Failed to generate embeddings: {e}")
                        embeddings = None
                else:
                    logger.warning("Embedding service not available - using keyword-only matching")
                
                self.intervention_cache.update({
                    "data": interventions,
                    "embeddings": embeddings,
                    "timestamp": now
                })
                
                logger.info(f"Cache updated with {len(interventions)} interventions" + 
                           (" and embeddings" if embeddings is not None else " (no embeddings)"))
            else:
                logger.error("No interventions fetched - cache not updated")
    
    def _get_keyword_scores(self, interventions: List[Dict], health_data: dict, 
                           query: str = "") -> np.ndarray:
        """
        Calculate keyword-based scores for interventions based on health profile.
        
        Args:
            interventions: List of intervention dictionaries
            health_data: Health statistics for the area
            query: Optional query string
            
        Returns:
            Array of keyword scores (0-1 range)
        """
        # Build risk keywords based on health data
        risk_keywords = []
        
        if health_data.get('DIABETES_CrudePrev', 0) > 15:
            risk_keywords.extend(['diabetes', 'blood_sugar', 'glucose'])
        if health_data.get('OBESITY_CrudePrev', 0) > 25:
            risk_keywords.extend(['obesity', 'weight', 'bmi'])
        if health_data.get('LPA_CrudePrev', 0) > 20:
            risk_keywords.extend(['physical', 'activity', 'exercise', 'walking'])
        if health_data.get('CSMOKING_CrudePrev', 0) > 15:
            risk_keywords.extend(['smoking', 'tobacco', 'cessation'])
        if health_data.get('BPHIGH_CrudePrev', 0) > 30:
            risk_keywords.extend(['blood_pressure', 'hypertension'])
        if health_data.get('FOODINSECU_CrudePrev', 0) > 10:
            risk_keywords.extend(['food', 'nutrition', 'food_security'])
        if health_data.get('ACCESS2_CrudePrev', 0) > 15:
            risk_keywords.extend(['healthcare', 'access', 'mobile'])
        
        # Add query-based keywords
        if query:
            query_words = [word.lower().strip() for word in query.split() if len(word) > 3]
            risk_keywords.extend(query_words)
        
        # Score each intervention
        scores = []
        for intervention in interventions:
            score = 0.0
            
            # Check health issues (high weight)
            health_issues = intervention.get("health_issues", [])
            if isinstance(health_issues, list):
                for issue in health_issues:
                    if any(keyword in issue.lower() for keyword in risk_keywords):
                        score += 0.4
            
            # Check keywords (medium weight)
            keywords = intervention.get("keywords", [])
            if isinstance(keywords, list):
                for keyword in keywords:
                    if keyword.lower() in risk_keywords:
                        score += 0.2
            
            # Check title and description (medium weight)
            title = intervention.get("title", "").lower()
            description = intervention.get("description", "").lower()
            
            for keyword in risk_keywords:
                if keyword in title:
                    score += 0.3
                if keyword in description:
                    score += 0.1
            
            scores.append(min(score, 1.0))  # Cap at 1.0
        
        return np.array(scores)
    
    def _get_health_context_scores(self, interventions: List[Dict], 
                                  health_data: dict) -> np.ndarray:
        """
        Calculate health context scores based on area-specific risk factors.
        
        Args:
            interventions: List of intervention dictionaries
            health_data: Health statistics for the area
            
        Returns:
            Array of context scores (0-1 range)
        """
        risk_score = health_data.get('RiskScore', 0)
        
        scores = []
        for intervention in interventions:
            score = 0.0
            
            # Higher risk areas benefit more from comprehensive interventions
            if risk_score > 7:
                if any(word in intervention.get('category', '').lower() 
                      for word in ['comprehensive', 'community', 'policy']):
                    score += 0.3
            
            # Consider implementation feasibility
            cost = intervention.get('implementation_cost', 'medium').lower()
            if cost == 'low':
                score += 0.2
            elif cost == 'medium':
                score += 0.1
            
            # Evidence level consideration
            evidence = intervention.get('evidence_level', 'medium').lower()
            if evidence == 'high':
                score += 0.2
            elif evidence == 'medium':
                score += 0.1
            
            scores.append(score)
        
        return np.array(scores)
    
    async def get_enhanced_recommendations(self, health_data: dict, query: str = "", 
                                         max_results: int = 3) -> List[Dict]:
        """
        Get intervention recommendations using hybrid search algorithm.
        
        Args:
            health_data: Health statistics for the area
            query: Optional search query
            max_results: Maximum number of results to return
            
        Returns:
            List of recommended interventions with relevance scores
        """
        await self._ensure_cache_valid()
        
        interventions = self.intervention_cache.get("data", [])
        embeddings = self.intervention_cache.get("embeddings")
        
        if not interventions:
            logger.warning("No interventions available")
            return []
        
        # Initialize scores
        vector_scores = np.zeros(len(interventions))
        keyword_scores = self._get_keyword_scores(interventions, health_data, query)
        context_scores = self._get_health_context_scores(interventions, health_data)
        
        # Calculate vector similarity scores if embeddings available and query provided
        if embeddings is not None and query and self.embedding_service.available:
            try:
                query_embedding = self.embedding_service.generate_embedding(query)
                if query_embedding.size > 0:
                    similarities = self.embedding_service.compute_similarity(query_embedding, embeddings)
                    vector_scores = similarities
                    logger.info("Using vector similarity scores")
                else:
                    logger.warning("Empty query embedding - using keyword-only matching")
            except Exception as e:
                logger.warning(f"Vector similarity failed, using keyword-only: {e}")
        
        # Hybrid scoring: combine vector similarity, keyword matching, and context
        if query and embeddings is not None and self.embedding_service.available and vector_scores.max() > 0:
            # With query and embeddings: weighted combination
            combined_scores = (0.5 * vector_scores + 
                             0.3 * keyword_scores + 
                             0.2 * context_scores)
        else:
            # Without embeddings or query: keyword + context only
            combined_scores = 0.7 * keyword_scores + 0.3 * context_scores
        
        # Get top interventions
        top_indices = np.argsort(combined_scores)[::-1][:max_results]
        
        # Filter out very low scores
        min_score_threshold = 0.1
        filtered_indices = [idx for idx in top_indices 
                          if combined_scores[idx] >= min_score_threshold]
        
        # Build results with scores
        results = []
        for idx in filtered_indices:
            intervention = interventions[idx].copy()
            intervention['_relevance_score'] = float(combined_scores[idx])
            intervention['_vector_score'] = float(vector_scores[idx]) if (embeddings is not None and self.embedding_service.available) else 0.0
            intervention['_keyword_score'] = float(keyword_scores[idx])
            intervention['_context_score'] = float(context_scores[idx])
            results.append(intervention)
        
        logger.info(f"Returning {len(results)} interventions with hybrid scoring")
        return results
    
    async def get_fallback_recommendations(self, health_data: dict, 
                                         max_results: int = 3) -> List[Dict]:
        """
        Fallback method using keyword matching only (for compatibility).
        
        Args:
            health_data: Health statistics for the area
            max_results: Maximum number of results to return
            
        Returns:
            List of recommended interventions
        """
        await self._ensure_cache_valid()
        
        interventions = self.intervention_cache.get("data", [])
        if not interventions:
            return []
        
        keyword_scores = self._get_keyword_scores(interventions, health_data)
        context_scores = self._get_health_context_scores(interventions, health_data)
        
        # Simple combination for fallback
        combined_scores = 0.7 * keyword_scores + 0.3 * context_scores
        
        top_indices = np.argsort(combined_scores)[::-1][:max_results]
        
        results = []
        for idx in top_indices:
            if combined_scores[idx] > 0.1:  # Minimum threshold
                intervention = interventions[idx].copy()
                intervention['_relevance_score'] = float(combined_scores[idx])
                results.append(intervention)
        
        return results

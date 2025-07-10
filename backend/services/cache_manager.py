"""
Cache management service for intervention data and API responses.
Provides in-memory caching with TTL support for performance optimization.
"""

import time
from typing import Optional, Dict, Any
from dataclasses import dataclass
import httpx
import logging

logger = logging.getLogger(__name__)

@dataclass
class CacheEntry:
    """Represents a cached entry with data and timestamp."""
    data: Any
    timestamp: float
    max_age: float  # in seconds
    
    @property
    def is_expired(self) -> bool:
        """Check if cache entry has expired."""
        return time.time() - self.timestamp > self.max_age
    
    @property
    def age_seconds(self) -> float:
        """Get age of cache entry in seconds."""
        return time.time() - self.timestamp

class CacheManager:
    """In-memory cache manager with TTL support."""
    
    def __init__(self):
        self._cache: Dict[str, CacheEntry] = {}
        self.default_max_age = 1800  # 30 minutes
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value by key, returns None if expired or not found."""
        if key not in self._cache:
            return None
        
        entry = self._cache[key]
        if entry.is_expired:
            logger.info(f"Cache entry '{key}' expired (age: {entry.age_seconds:.1f}s)")
            del self._cache[key]
            return None
        
        logger.debug(f"Cache hit for '{key}' (age: {entry.age_seconds:.1f}s)")
        return entry.data
    
    def set(self, key: str, data: Any, max_age: Optional[float] = None) -> None:
        """Set cached value with optional custom TTL."""
        max_age = max_age or self.default_max_age
        self._cache[key] = CacheEntry(
            data=data,
            timestamp=time.time(),
            max_age=max_age
        )
        logger.debug(f"Cached '{key}' with TTL {max_age}s")
    
    def invalidate(self, key: str) -> bool:
        """Invalidate a specific cache entry."""
        if key in self._cache:
            del self._cache[key]
            logger.info(f"Invalidated cache entry '{key}'")
            return True
        return False
    
    def clear(self) -> int:
        """Clear all cache entries and return count of cleared entries."""
        count = len(self._cache)
        self._cache.clear()
        logger.info(f"Cleared {count} cache entries")
        return count
    
    def cleanup_expired(self) -> int:
        """Remove expired entries and return count of removed entries."""
        expired_keys = [
            key for key, entry in self._cache.items() 
            if entry.is_expired
        ]
        for key in expired_keys:
            del self._cache[key]
        
        if expired_keys:
            logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")
        return len(expired_keys)
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_entries = len(self._cache)
        expired_entries = sum(1 for entry in self._cache.values() if entry.is_expired)
        
        return {
            "total_entries": total_entries,
            "active_entries": total_entries - expired_entries,
            "expired_entries": expired_entries,
            "entries": [
                {
                    "key": key,
                    "age_seconds": entry.age_seconds,
                    "max_age": entry.max_age,
                    "is_expired": entry.is_expired
                }
                for key, entry in self._cache.items()
            ]
        }

class InterventionCacheService:
    """Specialized cache service for intervention data."""
    
    def __init__(self, cache_manager: CacheManager):
        self.cache = cache_manager
        self.s3_url = "https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/interventions/interventions-db.json"
        self.cache_key = "interventions_data"
    
    async def get_interventions(self) -> Optional[list]:
        """Get interventions from cache or fetch from S3."""
        # Try cache first
        cached_data = self.cache.get(self.cache_key)
        if cached_data is not None:
            logger.info("Retrieved interventions from cache")
            return cached_data
        
        # Fetch from S3
        try:
            logger.info("Fetching interventions from S3...")
            async with httpx.AsyncClient() as client:
                response = await client.get(self.s3_url, timeout=10.0)
                response.raise_for_status()
                
                interventions = response.json()
                if isinstance(interventions, list) and len(interventions) > 0:
                    # Cache for 30 minutes
                    self.cache.set(self.cache_key, interventions, max_age=1800)
                    logger.info(f"Cached {len(interventions)} interventions from S3")
                    return interventions
                else:
                    logger.warning("Invalid interventions data structure from S3")
                    return None
                    
        except httpx.RequestError as e:
            logger.error(f"Failed to fetch interventions from S3: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching interventions: {e}")
            return None
    
    def invalidate_interventions(self) -> bool:
        """Invalidate interventions cache."""
        return self.cache.invalidate(self.cache_key)

# Global cache manager instance
cache_manager = CacheManager()
intervention_cache = InterventionCacheService(cache_manager)

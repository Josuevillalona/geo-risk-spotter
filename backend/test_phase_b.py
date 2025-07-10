#!/usr/bin/env python3
"""
Test the enhanced embedding service functionality.
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.embeddings import EmbeddingService, create_intervention_text
from services.enhanced_interventions import EnhancedInterventionService


def test_embedding_service():
    """Test basic embedding functionality."""
    print("🧪 Testing Embedding Service")
    print("=" * 50)
    
    try:
        # Initialize service
        embedding_service = EmbeddingService()
        print("✅ Embedding service initialized")
        
        # Test single embedding
        test_text = "Community diabetes prevention program with walking groups"
        embedding = embedding_service.generate_embedding(test_text)
        print(f"✅ Single embedding: {len(embedding)} dimensions")
        print(f"📊 Sample values: {embedding[:5]}")
        
        # Test batch embeddings
        test_texts = [
            "Diabetes prevention through physical activity",
            "Smoking cessation community program",
            "Obesity prevention nutrition education"
        ]
        
        batch_embeddings = embedding_service.generate_embeddings_batch(test_texts)
        print(f"✅ Batch embeddings: {batch_embeddings.shape}")
        
        # Test similarity
        query_embedding = embedding
        similarities = embedding_service.compute_similarity(query_embedding, batch_embeddings)
        print(f"✅ Similarities: {similarities}")
        
        # Test find most similar
        top_results = embedding_service.find_most_similar(query_embedding, batch_embeddings, top_k=2)
        print(f"✅ Top similar: {top_results}")
        
        return True
        
    except Exception as e:
        print(f"❌ Embedding service test failed: {e}")
        return False


def test_intervention_text_creation():
    """Test intervention text creation for embeddings."""
    print("\n🧪 Testing Intervention Text Creation")
    print("=" * 50)
    
    sample_intervention = {
        "title": "Community Walking Program",
        "description": "Organized walking groups for diabetes prevention",
        "category": "Physical Activity",
        "health_issues": ["diabetes", "obesity"],
        "target_population": "adults_at_risk",
        "setting": "community_centers",
        "keywords": ["walking", "exercise", "community", "prevention"]
    }
    
    text = create_intervention_text(sample_intervention)
    print(f"✅ Generated text: {text}")
    
    return len(text) > 0


async def test_enhanced_service():
    """Test the enhanced intervention service."""
    print("\n🧪 Testing Enhanced Intervention Service")
    print("=" * 50)
    
    try:
        service = EnhancedInterventionService()
        print("✅ Enhanced service initialized")
        
        # Mock health data for testing
        test_health_data = {
            "zip_code": "10001",
            "RiskScore": 8.5,
            "DIABETES_CrudePrev": 18.2,
            "OBESITY_CrudePrev": 32.1,
            "LPA_CrudePrev": 28.5,
            "CSMOKING_CrudePrev": 19.8
        }
        
        # Test recommendations with query
        print("🔍 Testing with query...")
        recommendations = await service.get_enhanced_recommendations(
            test_health_data, 
            query="diabetes prevention programs",
            max_results=3
        )
        
        print(f"✅ Got {len(recommendations)} recommendations")
        for i, rec in enumerate(recommendations, 1):
            title = rec.get('title', 'Unknown')
            relevance = rec.get('_relevance_score', 0)
            print(f"  {i}. {title} (relevance: {relevance:.3f})")
        
        # Test fallback method
        print("\n🔄 Testing fallback method...")
        fallback_recs = await service.get_fallback_recommendations(
            test_health_data,
            max_results=3
        )
        
        print(f"✅ Got {len(fallback_recs)} fallback recommendations")
        
        return len(recommendations) > 0 or len(fallback_recs) > 0
        
    except Exception as e:
        print(f"❌ Enhanced service test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Run all tests."""
    print("🚀 Testing Phase B: Enhanced RAG Implementation")
    print("=" * 60)
    
    # Test embedding service
    embedding_ok = test_embedding_service()
    
    # Test text creation
    text_ok = test_intervention_text_creation()
    
    # Test enhanced service
    enhanced_ok = await test_enhanced_service()
    
    print("\n📊 Test Results:")
    print(f"  Embedding Service: {'✅ PASS' if embedding_ok else '❌ FAIL'}")
    print(f"  Text Creation: {'✅ PASS' if text_ok else '❌ FAIL'}")
    print(f"  Enhanced Service: {'✅ PASS' if enhanced_ok else '❌ FAIL'}")
    
    if all([embedding_ok, text_ok, enhanced_ok]):
        print("\n🎉 All tests passed! Phase B infrastructure is ready.")
    else:
        print("\n⚠️  Some tests failed. Check the implementation.")


if __name__ == "__main__":
    asyncio.run(main())

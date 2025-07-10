#!/usr/bin/env python3
"""
Simple test to isolate Phase B enhanced recommendations.
"""

import asyncio
import httpx


async def test_simple():
    """Simple test of enhanced recommendations only."""
    print("🧪 Simple Enhanced RAG Test")
    print("=" * 40)
    
    test_health_data = {
        "zip_code": "10001",
        "RiskScore": 8.5,
        "DIABETES_CrudePrev": 18.2,
        "OBESITY_CrudePrev": 32.1,
        "LPA_CrudePrev": 28.5,
        "CSMOKING_CrudePrev": 19.8,
        "BPHIGH_CrudePrev": 45.3,
        "FOODINSECU_CrudePrev": 15.7,
        "ACCESS2_CrudePrev": 22.1
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            print("🔍 Testing enhanced recommendations...")
            response = await client.post(
                "http://localhost:8000/api/recommendations/enhanced",
                json={
                    "health_data": test_health_data,
                    "question_type": "lifestyle_interventions"
                }
            )
            
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                recommendations = data.get("recommendations", [])
                method = data.get("method", "unknown")
                
                print(f"✅ Success! Method: {method}")
                print(f"📈 Found {len(recommendations)} recommendations:")
                
                for i, rec in enumerate(recommendations[:3], 1):
                    title = rec.get("title", "Unknown")
                    relevance = rec.get("relevance_score", 0)
                    category = rec.get("category", "Unknown")
                    
                    print(f"  {i}. {title}")
                    print(f"     Category: {category}")
                    print(f"     Relevance: {relevance:.3f}")
                    
                    # Show enhanced scoring if available
                    scoring = rec.get("scoring", {})
                    if scoring:
                        v_score = scoring.get('vector_score', 0)
                        k_score = scoring.get('keyword_score', 0)
                        c_score = scoring.get('context_score', 0)
                        print(f"     Scoring - V:{v_score:.3f} K:{k_score:.3f} C:{c_score:.3f}")
                    print()
                
                # Test basic functionality
                print("📋 Basic Test Results:")
                print(f"  - Recommendations returned: {'✅' if len(recommendations) > 0 else '❌'}")
                print(f"  - Enhanced scoring present: {'✅' if any('scoring' in r for r in recommendations) else '❌'}")
                print(f"  - Relevance scores present: {'✅' if any('relevance_score' in r for r in recommendations) else '❌'}")
                
            else:
                print(f"❌ Failed: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Raw response: {response.text}")
                
    except Exception as e:
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_simple())

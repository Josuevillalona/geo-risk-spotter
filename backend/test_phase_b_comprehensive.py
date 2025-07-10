#!/usr/bin/env python3
"""
Comprehensive test of Phase B: Enhanced RAG functionality.
Focus on working features: enhanced recommendations with vector + keyword matching.
"""

import asyncio
import httpx
import json


async def test_phase_b_comprehensive():
    """Comprehensive test of Phase B Enhanced RAG features."""
    print("🚀 Phase B: Enhanced RAG Comprehensive Test")
    print("=" * 55)
    
    # Test scenarios with different health profiles
    test_scenarios = [
        {
            "name": "High Diabetes Risk Area",
            "data": {
                "zip_code": "10001",
                "RiskScore": 9.2,
                "DIABETES_CrudePrev": 25.8,
                "OBESITY_CrudePrev": 38.4,
                "LPA_CrudePrev": 32.1,
                "CSMOKING_CrudePrev": 12.3,
                "BPHIGH_CrudePrev": 42.7,
                "FOODINSECU_CrudePrev": 18.9,
                "ACCESS2_CrudePrev": 28.4
            }
        },
        {
            "name": "High Smoking/Tobacco Risk Area", 
            "data": {
                "zip_code": "20002",
                "RiskScore": 7.8,
                "DIABETES_CrudePrev": 12.1,
                "OBESITY_CrudePrev": 22.3,
                "LPA_CrudePrev": 18.7,
                "CSMOKING_CrudePrev": 31.2,  # High smoking
                "BPHIGH_CrudePrev": 35.8,
                "FOODINSECU_CrudePrev": 8.4,
                "ACCESS2_CrudePrev": 15.2
            }
        },
        {
            "name": "Food Insecurity Focus Area",
            "data": {
                "zip_code": "30003", 
                "RiskScore": 6.9,
                "DIABETES_CrudePrev": 15.3,
                "OBESITY_CrudePrev": 28.7,
                "LPA_CrudePrev": 25.1,
                "CSMOKING_CrudePrev": 14.8,
                "BPHIGH_CrudePrev": 31.2,
                "FOODINSECU_CrudePrev": 35.7,  # High food insecurity
                "ACCESS2_CrudePrev": 22.8
            }
        }
    ]
    
    base_url = "http://localhost:8000"
    results_summary = []
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            
            for scenario in test_scenarios:
                print(f"\n🎯 Testing: {scenario['name']}")
                print("-" * 40)
                
                # Test enhanced recommendations
                response = await client.post(
                    f"{base_url}/api/recommendations/enhanced",
                    json={
                        "health_data": scenario['data'],
                        "question_type": "lifestyle_interventions"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    recommendations = data.get("recommendations", [])
                    method = data.get("method", "unknown")
                    
                    print(f"✅ Status: Success ({method})")
                    print(f"📊 Recommendations: {len(recommendations)}")
                    
                    # Analyze recommendations
                    categories = {}
                    total_relevance = 0
                    high_relevance_count = 0
                    
                    for i, rec in enumerate(recommendations[:3], 1):
                        title = rec.get("title", "Unknown")
                        category = rec.get("category", "Unknown")
                        relevance = rec.get("relevance_score", 0)
                        cost = rec.get("implementation_cost", "Unknown")
                        evidence = rec.get("evidence_level", "Unknown")
                        
                        # Track categories
                        categories[category] = categories.get(category, 0) + 1
                        total_relevance += relevance
                        if relevance > 0.7:
                            high_relevance_count += 1
                        
                        print(f"  {i}. {title}")
                        print(f"     Category: {category} | Cost: {cost} | Evidence: {evidence}")
                        print(f"     Relevance: {relevance:.3f}")
                        
                        # Show scoring breakdown
                        scoring = rec.get("scoring", {})
                        if scoring:
                            v_score = scoring.get('vector_score', 0)
                            k_score = scoring.get('keyword_score', 0) 
                            c_score = scoring.get('context_score', 0)
                            print(f"     Scoring → Vector: {v_score:.3f}, Keyword: {k_score:.3f}, Context: {c_score:.3f}")
                        print()
                    
                    # Calculate metrics
                    avg_relevance = total_relevance / len(recommendations) if recommendations else 0
                    category_diversity = len(categories)
                    
                    scenario_result = {
                        "name": scenario['name'],
                        "success": True,
                        "recommendation_count": len(recommendations),
                        "avg_relevance": avg_relevance,
                        "high_relevance_count": high_relevance_count,
                        "category_diversity": category_diversity,
                        "top_categories": list(categories.keys())
                    }
                    
                    print(f"📈 Metrics:")
                    print(f"   Average Relevance: {avg_relevance:.3f}")
                    print(f"   High Relevance (>0.7): {high_relevance_count}/{len(recommendations)}")
                    print(f"   Category Diversity: {category_diversity}")
                    print(f"   Categories: {', '.join(categories.keys())}")
                    
                else:
                    print(f"❌ Failed: {response.status_code}")
                    print(f"   Error: {response.text}")
                    scenario_result = {
                        "name": scenario['name'],
                        "success": False,
                        "error": response.text
                    }
                
                results_summary.append(scenario_result)
            
            # Overall analysis
            print(f"\n📊 Phase B Enhanced RAG Analysis")
            print("=" * 45)
            
            successful_tests = [r for r in results_summary if r.get('success', False)]
            total_tests = len(results_summary)
            success_rate = len(successful_tests) / total_tests if total_tests > 0 else 0
            
            print(f"Success Rate: {success_rate:.1%} ({len(successful_tests)}/{total_tests})")
            
            if successful_tests:
                avg_recommendations = sum(r['recommendation_count'] for r in successful_tests) / len(successful_tests)
                avg_relevance_overall = sum(r['avg_relevance'] for r in successful_tests) / len(successful_tests)
                total_high_relevance = sum(r['high_relevance_count'] for r in successful_tests)
                avg_diversity = sum(r['category_diversity'] for r in successful_tests) / len(successful_tests)
                
                print(f"Average Recommendations per Query: {avg_recommendations:.1f}")
                print(f"Average Relevance Score: {avg_relevance_overall:.3f}")
                print(f"Total High-Relevance Recommendations: {total_high_relevance}")
                print(f"Average Category Diversity: {avg_diversity:.1f}")
                
                # Category analysis
                all_categories = []
                for result in successful_tests:
                    all_categories.extend(result.get('top_categories', []))
                
                category_counts = {}
                for cat in all_categories:
                    category_counts[cat] = category_counts.get(cat, 0) + 1
                
                print(f"\nTop Intervention Categories:")
                sorted_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
                for cat, count in sorted_categories[:5]:
                    print(f"  - {cat}: {count} recommendations")
            
            # Phase B feature validation
            print(f"\n🎯 Phase B Feature Validation")
            print("-" * 35)
            features = {
                "Enhanced scoring present": any(
                    any('scoring' in r.get('recommendations', [{}])[0] for r in [response.json()] if response.status_code == 200)
                    for response in [await client.post(f"{base_url}/api/recommendations/enhanced", 
                                                     json={"health_data": test_scenarios[0]['data'], "question_type": "lifestyle_interventions"})]
                ),
                "Relevance scores working": avg_relevance_overall > 0 if successful_tests else False,
                "Multiple recommendations": avg_recommendations >= 3 if successful_tests else False,
                "Category diversity": avg_diversity >= 2 if successful_tests else False,
                "Health-context matching": any(r['avg_relevance'] > 0.5 for r in successful_tests) if successful_tests else False
            }
            
            for feature, status in features.items():
                print(f"  {feature}: {'✅ PASS' if status else '❌ FAIL'}")
            
            overall_success = success_rate >= 0.8 and sum(features.values()) >= 4
            print(f"\n🏆 Phase B Enhanced RAG: {'✅ SUCCESSFUL' if overall_success else '⚠️ NEEDS IMPROVEMENT'}")
            
    except Exception as e:
        print(f"❌ Test exception: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_phase_b_comprehensive())

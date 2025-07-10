#!/usr/bin/env python3
"""
Test the enhanced backend with Phase B integration.
"""

import asyncio
import httpx
import json


async def test_enhanced_backend():
    """Test the enhanced backend endpoints."""
    print("🧪 Testing Enhanced Backend (Phase B)")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Test health data
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
            # Test 1: Enhanced recommendations endpoint
            print("🔍 Testing enhanced recommendations endpoint...")
            enhanced_response = await client.post(
                f"{base_url}/api/recommendations/enhanced",
                json={
                    "health_data": test_health_data,
                    "question_type": "lifestyle_interventions"  # Fixed enum value
                }
            )
            
            if enhanced_response.status_code == 200:
                enhanced_data = enhanced_response.json()
                recommendations = enhanced_data.get("recommendations", [])
                print(f"✅ Enhanced endpoint returned {len(recommendations)} recommendations")
                
                for i, rec in enumerate(recommendations[:3], 1):
                    title = rec.get("title", "Unknown")
                    relevance = rec.get("relevance_score", 0)
                    method = enhanced_data.get("method", "unknown")
                    print(f"  {i}. {title} (relevance: {relevance:.3f}, method: {method})")
                    
                    # Show scoring breakdown if available
                    scoring = rec.get("scoring", {})
                    if scoring:
                        print(f"     Scores - Vector: {scoring.get('vector_score', 0):.3f}, "
                              f"Keyword: {scoring.get('keyword_score', 0):.3f}, "
                              f"Context: {scoring.get('context_score', 0):.3f}")
            else:
                print(f"❌ Enhanced endpoint failed: {enhanced_response.status_code}")
                print(f"   Response: {enhanced_response.text}")
            
            # Test 2: Enhanced chat with interventions
            print("\n🗨️  Testing enhanced chat with interventions...")
            chat_response = await client.post(
                f"{base_url}/api/chat",
                json={
                    "message": "What intervention programs would work best for this area based on the health risks?",
                    "messages": [],
                    "selected_area": test_health_data
                }
            )
            
            if chat_response.status_code == 200:
                chat_data = chat_response.json()
                response_text = chat_data.get("response", "")
                print(f"✅ Chat response received ({len(response_text)} characters)")
                
                # Check for enhanced features
                if "Relevance:" in response_text:
                    print("🎯 Enhanced features detected in chat response")
                else:
                    print("📝 Standard chat response (no enhanced features detected)")
                
                # Show preview
                preview = response_text[:300] + "..." if len(response_text) > 300 else response_text
                print(f"📄 Response preview: {preview}")
                
            else:
                print(f"❌ Chat failed: {chat_response.status_code}")
                print(f"   Response: {chat_response.text}")
            
            print("\n📊 Test Summary:")
            print(f"  Enhanced Endpoint: {'✅ PASS' if enhanced_response.status_code == 200 else '❌ FAIL'}")
            print(f"  Enhanced Chat: {'✅ PASS' if chat_response.status_code == 200 else '❌ FAIL'}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()


async def test_startup_check():
    """Test that the backend starts up correctly."""
    print("\n🚀 Testing Backend Startup...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get("http://localhost:8000/")
            if response.status_code == 200:
                print("✅ Backend is running")
                return True
            else:
                print(f"❌ Backend startup issue: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False


async def main():
    """Run all tests."""
    # Check if backend is running
    backend_running = await test_startup_check()
    
    if backend_running:
        await test_enhanced_backend()
    else:
        print("\n⚠️  Backend is not running. Start it with: python main.py")
        print("   Then run this test again.")


if __name__ == "__main__":
    asyncio.run(main())

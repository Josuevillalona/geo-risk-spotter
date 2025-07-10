#!/usr/bin/env python3
"""
Test enhanced chat without triggering OpenRouter issues.
"""

import asyncio
import httpx


async def test_chat_simple():
    """Test chat with a simple message."""
    print("🧪 Testing Enhanced Chat Integration")
    print("=" * 45)
    
    test_health_data = {
        "zip_code": "10001",
        "RiskScore": 8.5,
        "DIABETES_CrudePrev": 18.2,
        "OBESITY_CrudePrev": 32.1,
        "LPA_CrudePrev": 28.5,
        "CSMOKING_CrudePrev": 19.8
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            # First test: chat without intervention keywords (should work)
            print("🗨️  Test 1: Basic chat (no interventions)...")
            response1 = await client.post(
                "http://localhost:8000/api/chat",
                json={
                    "message": "What are the health statistics for this area?",
                    "messages": [],
                    "selected_area": test_health_data
                }
            )
            
            print(f"📊 Status: {response1.status_code}")
            if response1.status_code == 200:
                print("✅ Basic chat working")
            else:
                print(f"❌ Basic chat failed: {response1.text}")
                return
            
            # Second test: chat with intervention keywords (enhanced features)
            print("\n🎯 Test 2: Chat with intervention keywords...")
            response2 = await client.post(
                "http://localhost:8000/api/chat",
                json={
                    "message": "What intervention programs would help this area?",
                    "messages": [],
                    "selected_area": test_health_data
                }
            )
            
            print(f"📊 Status: {response2.status_code}")
            if response2.status_code == 200:
                data = response2.json()
                response_text = data.get("response", "")
                print("✅ Enhanced chat working")
                
                # Check for enhanced features
                enhanced_features = [
                    "Relevance:" in response_text,
                    "Evidence-Based" in response_text,
                    "%" in response_text  # Relevance percentages
                ]
                
                if any(enhanced_features):
                    print("🎯 Enhanced RAG features detected in response!")
                else:
                    print("📝 Standard response (interventions may not have triggered)")
                
                # Show snippet
                preview = response_text[:200] + "..." if len(response_text) > 200 else response_text
                print(f"📄 Response preview: {preview}")
                
            else:
                error_text = response2.text
                print(f"❌ Enhanced chat failed: {error_text}")
                
                # Try to provide helpful debug info
                if "401" in error_text:
                    print("💡 Suggestion: OpenRouter API key issue. Check:")
                    print("   - API key is valid")
                    print("   - Model 'mistralai/mistral-7b-instruct:free' is available")
                elif "500" in error_text:
                    print("💡 Suggestion: Server error. Check backend logs.")
            
            print(f"\n📊 Chat Tests Summary:")
            print(f"  Basic Chat: {'✅ PASS' if response1.status_code == 200 else '❌ FAIL'}")
            print(f"  Enhanced Chat: {'✅ PASS' if response2.status_code == 200 else '❌ FAIL'}")
            
    except Exception as e:
        print(f"❌ Test exception: {e}")


if __name__ == "__main__":
    asyncio.run(test_chat_simple())

#!/usr/bin/env python3
"""
Debug OpenRouter API connectivity.
"""

import httpx
import asyncio
import os
from dotenv import load_dotenv

async def test_openrouter_direct():
    """Test OpenRouter API directly."""
    print("🔍 Testing OpenRouter API Direct Connection")
    print("=" * 50)
    
    # Load environment
    load_dotenv('backend/.env')
    api_key = os.getenv('OPENROUTER_API_KEY')
    
    if not api_key:
        print("❌ No API key found")
        return
    
    print(f"✅ API Key: {api_key[:15]}...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Test 1: Check available models
            print("\n📋 Test 1: List available models...")
            models_response = await client.get(
                "https://openrouter.ai/api/v1/models",
                headers={"Authorization": f"Bearer {api_key}"}
            )
            
            print(f"Models endpoint status: {models_response.status_code}")
            if models_response.status_code == 200:
                models_data = models_response.json()
                total_models = len(models_data.get('data', []))
                print(f"✅ Found {total_models} models")
                
                # Check if our target model exists
                our_model = "mistralai/mistral-7b-instruct:free"
                model_ids = [m['id'] for m in models_data.get('data', [])]
                model_exists = our_model in model_ids
                print(f"Target model '{our_model}': {'✅ Available' if model_exists else '❌ Not found'}")
                
                if not model_exists:
                    # Show some free alternatives
                    free_models = [m['id'] for m in models_data.get('data', []) if 'free' in m['id'].lower()]
                    print(f"💡 Free models available: {free_models[:3]}")
                
            else:
                print(f"❌ Models endpoint failed: {models_response.text}")
                return
            
            # Test 2: Try a simple chat completion
            print(f"\n💬 Test 2: Simple chat completion...")
            chat_response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://geo-risk-spotter.vercel.app",
                    "X-Title": "RiskPulse Diabetes"
                },
                json={
                    "model": "mistralai/mistral-7b-instruct:free",
                    "messages": [
                        {"role": "user", "content": "Hello, this is a test message."}
                    ],
                    "max_tokens": 50,
                    "temperature": 0.7
                }
            )
            
            print(f"Chat completion status: {chat_response.status_code}")
            if chat_response.status_code == 200:
                chat_data = chat_response.json()
                message = chat_data['choices'][0]['message']['content']
                print(f"✅ Chat completion successful!")
                print(f"📝 Response: {message[:100]}...")
            else:
                print(f"❌ Chat completion failed: {chat_response.text}")
                
                # Try alternative model
                alt_models = [
                    "mistralai/mistral-7b-instruct",
                    "microsoft/phi-3-mini-128k-instruct:free",
                    "meta-llama/llama-3.2-3b-instruct:free"
                ]
                
                for alt_model in alt_models:
                    print(f"\n🔄 Trying alternative model: {alt_model}")
                    alt_response = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {api_key}",
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://geo-risk-spotter.vercel.app"
                        },
                        json={
                            "model": alt_model,
                            "messages": [{"role": "user", "content": "Test"}],
                            "max_tokens": 20
                        }
                    )
                    
                    if alt_response.status_code == 200:
                        print(f"✅ {alt_model} works!")
                        alt_data = alt_response.json()
                        alt_message = alt_data['choices'][0]['message']['content']
                        print(f"📝 Response: {alt_message}")
                        break
                    else:
                        print(f"❌ {alt_model} failed: {alt_response.status_code}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_openrouter_direct())

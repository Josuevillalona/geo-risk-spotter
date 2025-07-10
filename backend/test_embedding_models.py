#!/usr/bin/env python3
"""
Test available embedding models on OpenRouter
"""

import requests
import os
from dotenv import load_dotenv

def test_embedding_models():
    load_dotenv('.env')
    api_key = os.getenv('OPENROUTER_API_KEY')

    if not api_key:
        print('❌ No API key found')
        return

    print(f"✅ Using API key: {api_key[:10]}...")
    
    # Test embedding models available on OpenRouter
    try:
        response = requests.get('https://openrouter.ai/api/v1/models', 
            headers={'Authorization': f'Bearer {api_key}'})

        if response.status_code == 200:
            models = response.json()['data']
            embedding_models = [m for m in models if 'embedding' in m['id'].lower()]
            
            print(f'\n📊 Found {len(embedding_models)} embedding models:')
            for model in embedding_models[:10]:  # Show first 10
                model_id = model.get('id', 'Unknown')
                context_length = model.get('context_length', 'N/A')
                print(f'- {model_id} (Context: {context_length})')
            
            # Test embedding directly since model list might not show embeddings
            print(f'\n🧪 Testing embedding models directly...')
            test_embedding_call(api_key)
                
        else:
            print(f'❌ Error: {response.status_code} - {response.text}')
            
    except Exception as e:
        print(f'❌ Error: {e}')

def test_embedding_call(api_key: str, model_id: str = 'text-embedding-ada-002'):
    """Test actual embedding generation"""
    try:
        # Try OpenAI-style embedding endpoint
        response = requests.post('https://openrouter.ai/api/v1/embeddings',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': model_id,
                'input': 'Test embedding for diabetes intervention'
            })
        
        if response.status_code == 200:
            data = response.json()
            embedding = data['data'][0]['embedding']
            print(f'✅ Embedding generated: {len(embedding)} dimensions')
            print(f'📊 First 5 values: {embedding[:5]}')
            return embedding
        else:
            print(f'❌ Embedding test failed: {response.status_code} - {response.text}')
            # Try alternative models
            for alt_model in ['text-embedding-3-small', 'openai/text-embedding-ada-002']:
                print(f'🔄 Trying alternative model: {alt_model}')
                alt_response = requests.post('https://openrouter.ai/api/v1/embeddings',
                    headers={
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'model': alt_model,
                        'input': 'Test embedding for diabetes intervention'
                    })
                if alt_response.status_code == 200:
                    alt_data = alt_response.json()
                    alt_embedding = alt_data['data'][0]['embedding']
                    print(f'✅ {alt_model} worked! {len(alt_embedding)} dimensions')
                    return alt_embedding
                else:
                    print(f'❌ {alt_model} failed: {alt_response.status_code}')
            return None
            
    except Exception as e:
        print(f'❌ Embedding test error: {e}')
        return None

if __name__ == "__main__":
    test_embedding_models()

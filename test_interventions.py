#!/usr/bin/env python3
"""
Test the Enhanced Intervention System
"""

import requests
import json

def test_intervention_system():
    """Test the intervention recommendations in the chatbot"""
    
    print("🧪 Testing Enhanced Intervention System")
    print("=" * 50)
    
    # Test data simulating a high-risk area
    test_data = {
        "message": "What intervention programs would work best for this area based on the health risks?",
        "messages": [],
        "selected_area": {
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
    }
    
    try:
        print("📤 Sending test request to chatbot...")
        response = requests.post(
            "http://localhost:8000/api/chat",
            json=test_data,
            timeout=30
        )
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            message = data.get("response", "")  # Fixed: was "message", should be "response"
            
            print("✅ SUCCESS! Chatbot responded with intervention recommendations")
            print(f"📄 Response length: {len(message)} characters")
            
            # Check if specific interventions are mentioned
            intervention_keywords = [
                "diabetes", "walking", "smoking", "nutrition", 
                "community", "wellness", "tobacco", "Alaska"
            ]
            
            found_keywords = [kw for kw in intervention_keywords if kw.lower() in message.lower()]
            
            print(f"🔍 Intervention keywords found: {', '.join(found_keywords)}")
            
            if len(found_keywords) >= 3:
                print("🎉 EXCELLENT! Multiple interventions detected in response")
            else:
                print("⚠️  Limited intervention content detected")
            
            # Show first 500 characters of response
            print(f"\n📋 Response Preview:")
            print(f"{message[:500]}...")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

def test_s3_access():
    """Test direct S3 access to interventions"""
    
    print("\n🌐 Testing S3 Interventions Access")
    print("=" * 40)
    
    try:
        response = requests.get(
            "https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/interventions/interventions-db.json",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            intervention_count = data.get("total_interventions", 0)
            version = data.get("version", "unknown")
            
            print(f"✅ S3 Access: SUCCESS")
            print(f"📊 Total interventions: {intervention_count}")
            print(f"📅 Version: {version}")
            
            # Show some intervention titles
            interventions = data.get("interventions", [])
            if interventions:
                print(f"\n📋 Sample interventions:")
                for i, intervention in enumerate(interventions[:5], 1):
                    title = intervention.get("title", "Unknown")
                    category = intervention.get("category", "Unknown")
                    print(f"  {i}. {title} ({category})")
                    
        else:
            print(f"❌ S3 Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ S3 Test failed: {e}")

if __name__ == "__main__":
    test_s3_access()
    test_intervention_system()

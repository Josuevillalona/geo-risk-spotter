#!/usr/bin/env python3
"""
Extract MORE Interventions from PDF
This script processes the full PDF to extract all remaining interventions
"""

import json
import os
from typing import List, Dict
import requests
from dotenv import load_dotenv
import fitz  # PyMuPDF

# Load environment variables
load_dotenv()

def main():
    """
    Extract all remaining interventions from the PDF
    """
    print("🚀 Enhanced Intervention Extraction - Full PDF Processing")
    print("=" * 60)
    
    pdf_path = "C:\\Users\\josue\\Downloads\\Examplesbystate1009.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found at: {pdf_path}")
        return
    
    # Check if we already have extracted text
    if os.path.exists("extracted_text.txt"):
        print("📄 Using previously extracted text...")
        with open("extracted_text.txt", "r", encoding="utf-8") as f:
            full_text = f.read()
    else:
        print("📄 Extracting text from PDF...")
        doc = fitz.open(pdf_path)
        full_text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text()
            full_text += f"\n--- Page {page_num + 1} ---\n{text}"
        doc.close()
        
        with open("extracted_text.txt", "w", encoding="utf-8") as f:
            f.write(full_text)
    
    print(f"📊 Processing {len(full_text)} characters...")
    
    # Process in larger chunks to get ALL interventions
    chunk_size = 15000
    chunks = []
    
    for i in range(0, len(full_text), chunk_size):
        chunk = full_text[i:i + chunk_size]
        chunks.append(chunk)
    
    print(f"🔄 Processing {len(chunks)} text chunks to extract ALL interventions...")
    
    # Get API key
    openai_api_key = os.getenv("OPENROUTER_API_KEY")
    if not openai_api_key:
        print("❌ No OpenRouter API key found")
        return
    
    all_interventions = []
    
    for chunk_num, chunk in enumerate(chunks, 1):
        print(f"\n🤖 Processing chunk {chunk_num}/{len(chunks)}...")
        
        prompt = f"""You are a public health expert. Extract ALL community-based public health interventions from this text chunk.

For each intervention, create a JSON object with:
- title: descriptive name
- category: Physical Activity, Disease Management, Tobacco Control, Nutrition Access, Healthcare Access, Youth Prevention, Community Outreach, Environmental Policy, Food Environment, or Policy Environment  
- health_issues: array of health conditions addressed
- target_population: who benefits
- setting: where implemented
- description: 2-3 sentence summary
- activities: array of specific actions
- outcomes: measurable results if mentioned
- implementation_cost: low/medium/high
- timeframe: duration
- evidence_level: high/medium/low based on study rigor
- source: organization or program name
- keywords: searchable terms

Extract EVERY intervention mentioned, including:
- State-specific programs (Alabama, Alaska, Arizona, etc.)
- Specific community initiatives
- Policy changes
- Health education programs
- Screening programs
- Infrastructure improvements
- Any measurable public health intervention

Text chunk:
{chunk}

Return ONLY a JSON array of intervention objects."""

        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openai_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3.5-sonnet",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 4000,
                    "temperature": 0.1
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                try:
                    chunk_interventions = json.loads(content)
                    if isinstance(chunk_interventions, list):
                        all_interventions.extend(chunk_interventions)
                        print(f"✅ Found {len(chunk_interventions)} interventions in chunk {chunk_num}")
                        
                        # Show titles for progress tracking
                        for intervention in chunk_interventions:
                            print(f"   - {intervention.get('title', 'Unknown Title')}")
                    else:
                        print(f"⚠️  Chunk {chunk_num}: Response was not a list")
                        
                except json.JSONDecodeError:
                    print(f"⚠️  Chunk {chunk_num}: Invalid JSON response")
                    with open(f"chunk_{chunk_num}_raw.txt", "w") as f:
                        f.write(content)
            else:
                print(f"❌ API error for chunk {chunk_num}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error processing chunk {chunk_num}: {e}")
    
    # Remove duplicates by title
    seen_titles = set()
    unique_interventions = []
    
    for intervention in all_interventions:
        title = intervention.get('title', '').lower().strip()
        if title and title not in seen_titles:
            seen_titles.add(title)
            unique_interventions.append(intervention)
    
    print(f"\n📋 EXTRACTION SUMMARY:")
    print(f"Total interventions found: {len(all_interventions)}")
    print(f"Unique interventions: {len(unique_interventions)}")
    
    # Save all extracted interventions
    with open("all_extracted_interventions.json", "w", encoding="utf-8") as f:
        json.dump({
            "extraction_date": "2025-06-27",
            "source_pdf": "Examplesbystate1009.pdf",
            "total_interventions": len(unique_interventions),
            "interventions": unique_interventions
        }, f, indent=2, ensure_ascii=False)
    
    print(f"✅ All extracted interventions saved to: all_extracted_interventions.json")
    
    # Show all intervention titles
    print(f"\n📋 ALL EXTRACTED INTERVENTIONS:")
    for i, intervention in enumerate(unique_interventions, 1):
        category = intervention.get('category', 'Unknown')
        title = intervention.get('title', 'Unknown Title')
        print(f"{i:2d}. {title} ({category})")

if __name__ == "__main__":
    main()

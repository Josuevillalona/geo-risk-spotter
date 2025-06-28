#!/usr/bin/env python3
"""
AI-Powered PDF Intervention Extraction Script
Extracts and structures public health interventions from PDF documents
"""

import json
import os
from typing import List, Dict
import requests
from dotenv import load_dotenv
import fitz  # PyMuPDF

# Load environment variables
load_dotenv()

def extract_text_from_pdf_ai(pdf_path: str) -> str:
    """
    Extract text from PDF using PyMuPDF
    """
    try:
        print(f"📄 Extracting text from: {pdf_path}")
        
        # Open PDF
        doc = fitz.open(pdf_path)
        page_count = len(doc)
        
        # Extract text from all pages
        full_text = ""
        for page_num in range(page_count):
            page = doc.load_page(page_num)
            text = page.get_text()
            full_text += f"\n--- Page {page_num + 1} ---\n{text}"
        
        doc.close()
        
        print(f"✅ Extracted {len(full_text)} characters from {page_count} pages")
        return full_text
        
    except Exception as e:
        print(f"❌ Error extracting PDF text: {e}")
        return ""

def structure_interventions_with_ai(text: str) -> List[Dict]:
    """
    Use OpenAI to structure extracted text into intervention format
    Process in chunks to extract more interventions
    """
    
    # Get API key
    openai_api_key = os.getenv("OPENROUTER_API_KEY")
    if not openai_api_key:
        print("❌ No OpenRouter API key found. Set OPENROUTER_API_KEY in .env file")
        return []
    
    # Define the intervention schema for AI
    intervention_schema = {
        "id": "string (format: int_XXX)",
        "title": "string",
        "category": "string (Physical Activity, Disease Management, etc.)",
        "health_issues": "array of strings (diabetes, obesity, etc.)",
        "target_population": "string",
        "setting": "string (community, workplace, etc.)",
        "description": "string (2-3 sentences)",
        "activities": "array of specific activity strings",
        "outcomes": "string (specific metrics if available)",
        "implementation_cost": "string (low/medium/high)",
        "timeframe": "string",
        "evidence_level": "string (high/medium/low)",
        "source": "string",
        "keywords": "array of searchable keywords"
    }
    
    # Split text into chunks to process more content
    chunk_size = 12000  # Increased chunk size
    text_chunks = []
    
    for i in range(0, len(text), chunk_size):
        chunk = text[i:i + chunk_size]
        text_chunks.append(chunk)
    
    print(f"📊 Processing {len(text_chunks)} text chunks...")
    
    all_interventions = []
    
    for chunk_num, chunk in enumerate(text_chunks, 1):
        print(f"🔄 Processing chunk {chunk_num}/{len(text_chunks)}...")
        
        # AI prompt for structuring interventions
        prompt = f"""Extract community-based public health interventions from this text and return as valid JSON.

IMPORTANT: Return ONLY a valid JSON array, no explanations or markdown formatting.

Schema for each intervention:
{{
  "title": "intervention name",
  "category": "Physical Activity|Disease Management|Tobacco Control|Nutrition Access|Healthcare Access|Youth Prevention|Community Outreach|Environmental Policy|Food Environment|Policy Environment",
  "health_issues": ["diabetes", "obesity", "etc"],
  "target_population": "who benefits",
  "setting": "where implemented",
  "description": "brief description",
  "activities": ["specific actions"],
  "outcomes": "measurable results",
  "implementation_cost": "low|medium|high",
  "timeframe": "duration",
  "evidence_level": "high|medium|low",
  "source": "organization/program",
  "keywords": ["searchable", "terms"]
}}

Extract ALL interventions from this text chunk {chunk_num}:

{chunk}

Return valid JSON array only:
        
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openai_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3.5-sonnet",
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 4000,
                    "temperature": 0.1
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                
                # Try to parse JSON from response
                try:
                    # Clean the response - remove markdown formatting and extra text
                    cleaned_content = content.strip()
                    
                    # Look for JSON array in the response
                    start_idx = cleaned_content.find('[')
                    end_idx = cleaned_content.rfind(']')
                    
                    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                        json_str = cleaned_content[start_idx:end_idx + 1]
                        chunk_interventions = json.loads(json_str)
                        
                        if isinstance(chunk_interventions, list):
                            all_interventions.extend(chunk_interventions)
                            print(f"✅ Extracted {len(chunk_interventions)} interventions from chunk {chunk_num}")
                            
                            # Show titles for progress
                            for intervention in chunk_interventions[-3:]:  # Show last 3
                                title = intervention.get('title', 'Unknown')
                                print(f"   📌 {title}")
                        else:
                            print(f"⚠️  Chunk {chunk_num}: Parsed content was not a list")
                    else:
                        print(f"⚠️  Chunk {chunk_num}: No JSON array found in response")
                        # Save for manual review
                        with open(f"chunk_{chunk_num}_raw.txt", "w", encoding="utf-8") as f:
                            f.write(content)
                        
                except json.JSONDecodeError as je:
                    print(f"⚠️  Chunk {chunk_num}: JSON decode error - {str(je)[:100]}")
                    # Save problematic response for debugging
                    with open(f"ai_response_chunk_{chunk_num}.txt", "w", encoding="utf-8") as f:
                        f.write(content)
                    print(f"   💾 Raw response saved to ai_response_chunk_{chunk_num}.txt")
            else:
                print(f"❌ API error for chunk {chunk_num}: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Error processing chunk {chunk_num}: {e}")
    
    # Remove duplicates based on title
    seen_titles = set()
    unique_interventions = []
    
    for intervention in all_interventions:
        title = intervention.get('title', '').lower()
        if title and title not in seen_titles:
            seen_titles.add(title)
            unique_interventions.append(intervention)
        else:
            print(f"🔄 Skipping duplicate: {intervention.get('title', 'Unknown')}")
    
    print(f"✅ Total unique interventions extracted: {len(unique_interventions)}")
    return unique_interventions

def merge_with_existing_interventions(new_interventions: List[Dict], existing_file: str = "interventions-db.json") -> Dict:
    """
    Merge new interventions with existing database
    """
    try:
        with open(existing_file, 'r') as f:
            existing_data = json.load(f)
    except FileNotFoundError:
        existing_data = {
            "version": "1.0",
            "last_updated": "2025-06-27",
            "total_interventions": 0,
            "interventions": []
        }
    
    # Add new interventions with unique IDs
    existing_ids = {int_data["id"] for int_data in existing_data["interventions"]}
    next_id = max([int(id.split("_")[1]) for id in existing_ids]) + 1 if existing_ids else 1
    
    for intervention in new_interventions:
        intervention["id"] = f"int_{next_id:03d}"
        existing_data["interventions"].append(intervention)
        next_id += 1
    
    # Update metadata
    existing_data["total_interventions"] = len(existing_data["interventions"])
    existing_data["last_updated"] = "2025-06-27"
    
    return existing_data

def main():
    """
    Main extraction pipeline
    """
    print("🚀 AI-Powered Intervention Extraction Pipeline")
    print("=" * 50)
    
    # Configuration
    pdf_path = input("Enter path to your PDF file: ").strip().strip('"')
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found at: {pdf_path}")
        return
    
    try:
        # Step 1: Extract text
        print("\n📄 Step 1: Extracting text from PDF...")
        extracted_text = extract_text_from_pdf_ai(pdf_path)
        
        if not extracted_text:
            print("❌ Failed to extract text from PDF")
            return
        
        # Save extracted text for debugging
        with open("extracted_text.txt", "w", encoding="utf-8") as f:
            f.write(extracted_text)
        print("📝 Extracted text saved to extracted_text.txt for review")
        
        # Step 2: Structure with AI
        print("\n🤖 Step 2: Structuring interventions with AI...")
        new_interventions = structure_interventions_with_ai(extracted_text)
        
        if not new_interventions:
            print("❌ No interventions extracted. Check extracted_text.txt and ai_response_raw.txt")
            return
        
        # Step 3: Merge and save
        print(f"\n📊 Step 3: Merging {len(new_interventions)} new interventions...")
        updated_data = merge_with_existing_interventions(new_interventions)
        
        # Save updated database
        output_file = "interventions-db-updated.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(updated_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Success! Updated database saved to: {output_file}")
        print(f"📈 Total interventions: {updated_data['total_interventions']}")
        
        # Show summary
        print("\n📋 New interventions added:")
        for intervention in new_interventions:
            print(f"  - {intervention['title']} ({intervention['category']})")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

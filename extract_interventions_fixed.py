#!/usr/bin/env python3
"""
AI-Powered PDF Intervention Extraction Script
Extracts and structures public health interventions from PDF documents
"""

import json
import os
import re
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

def extract_json_from_response(content: str) -> List[Dict]:
    """
    Extract JSON array from AI response, handling various formatting issues
    """
    try:
        # First, try direct parsing
        return json.loads(content.strip())
    except json.JSONDecodeError:
        pass
    
    # Try to find JSON array in the response
    content = content.strip()
    
    # Remove markdown code blocks
    content = re.sub(r'```json\s*', '', content)
    content = re.sub(r'```\s*', '', content)
    
    # Look for JSON array brackets
    start_idx = content.find('[')
    end_idx = content.rfind(']')
    
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        json_str = content[start_idx:end_idx + 1]
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass
    
    # If still failing, try to find individual objects
    objects = []
    brace_count = 0
    current_obj = ""
    in_object = False
    
    for char in content:
        if char == '{':
            if brace_count == 0:
                in_object = True
                current_obj = "{"
            else:
                current_obj += char
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            current_obj += char
            if brace_count == 0 and in_object:
                try:
                    obj = json.loads(current_obj)
                    objects.append(obj)
                except json.JSONDecodeError:
                    pass
                current_obj = ""
                in_object = False
        elif in_object:
            current_obj += char
    
    return objects

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
        
        # Simplified prompt that's more likely to produce valid JSON
        prompt = f"""Extract all public health interventions from this text. Return as valid JSON array only.

Each intervention should have:
- title: name of intervention
- category: Physical Activity, Disease Management, Tobacco Control, Nutrition Access, Healthcare Access, Youth Prevention, Community Outreach, Environmental Policy, Food Environment, or Policy Environment
- health_issues: array of health conditions
- target_population: who benefits
- setting: where implemented  
- description: brief summary
- activities: array of actions
- outcomes: results achieved
- implementation_cost: low, medium, or high
- timeframe: duration
- evidence_level: high, medium, or low
- source: organization name
- keywords: searchable terms array

Text chunk {chunk_num}:
{chunk}

Return JSON array:"""
        
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
                
                # Extract JSON using improved parsing
                chunk_interventions = extract_json_from_response(content)
                
                if isinstance(chunk_interventions, list) and len(chunk_interventions) > 0:
                    all_interventions.extend(chunk_interventions)
                    print(f"✅ Extracted {len(chunk_interventions)} interventions from chunk {chunk_num}")
                    
                    # Show titles for progress
                    for intervention in chunk_interventions[-3:]:  # Show last 3
                        title = intervention.get('title', 'Unknown')
                        print(f"   📌 {title}")
                else:
                    print(f"⚠️  Chunk {chunk_num}: No valid interventions found")
                    # Save for manual review
                    with open(f"chunk_{chunk_num}_raw.txt", "w", encoding="utf-8") as f:
                        f.write(content)
                        
            else:
                print(f"❌ API error for chunk {chunk_num}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error processing chunk {chunk_num}: {e}")
    
    # Remove duplicates based on title
    seen_titles = set()
    unique_interventions = []
    
    for intervention in all_interventions:
        title = intervention.get('title', '').lower().strip()
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
        with open(existing_file, 'r', encoding='utf-8') as f:
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
    
    # Use the known PDF path
    pdf_path = r"C:\Users\josue\Downloads\Examplesbystate1009.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found at: {pdf_path}")
        return
    
    try:
        # Step 1: Extract text (use cached if available)
        if os.path.exists("extracted_text.txt"):
            print("\n📄 Using previously extracted text...")
            with open("extracted_text.txt", "r", encoding="utf-8") as f:
                extracted_text = f.read()
        else:
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
            print("❌ No interventions extracted. Check chunk files for debugging.")
            return
        
        # Step 3: Merge and save
        print(f"\n📊 Step 3: Merging {len(new_interventions)} new interventions...")
        updated_data = merge_with_existing_interventions(new_interventions)
        
        # Save updated database
        output_file = "interventions-db-comprehensive.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(updated_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Success! Updated database saved to: {output_file}")
        print(f"📈 Total interventions: {updated_data['total_interventions']}")
        
        # Show summary
        print(f"\n📋 All {len(new_interventions)} new interventions added:")
        for i, intervention in enumerate(new_interventions, 1):
            title = intervention.get('title', 'Unknown')
            category = intervention.get('category', 'Unknown')
            print(f"{i:2d}. {title} ({category})")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import time
from typing import Optional, List, Dict
from dotenv import load_dotenv
from enum import Enum

print("Initial OPENROUTER_API_KEY:", os.getenv("OPENROUTER_API_KEY")) # Debugging line

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
print("OPENROUTER_API_KEY:", os.getenv("OPENROUTER_API_KEY"))

# Get OpenRouter API key from environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Feature flag for interventions
ENABLE_INTERVENTIONS = os.getenv("ENABLE_INTERVENTIONS", "true").lower() == "true"

# Global intervention cache (prevents repeated S3 calls)
intervention_cache = {
    "data": None,
    "timestamp": None,
    "max_age": 1800  # 30 minutes
}

app = FastAPI()

app = FastAPI()

# Configure CORS middleware
origins = [
    "https://geo-risk-spotter.vercel.app",
    "http://localhost:5173", # Allow local development
    # Add other allowed origins here if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define a Pydantic model for the incoming request data
class HealthData(BaseModel):
    zip_code: str
    RiskScore: float
    DIABETES_CrudePrev: float
    OBESITY_CrudePrev: float
    LPA_CrudePrev: float
    CSMOKING_CrudePrev: float
    BPHIGH_CrudePrev: float
    FOODINSECU_CrudePrev: float
    ACCESS2_CrudePrev: float
    # Add other raw data properties here as needed

class QuestionType(str, Enum):
    LIFESTYLE = "lifestyle_interventions"
    RISK = "risk_correlation"
    INDIVIDUAL = "individual_actions"

class RecommendationRequest(BaseModel):
    question_type: QuestionType
    health_data: HealthData

class ChatRequest(BaseModel):
    message: str
    messages: list
    selected_area: dict = None

# Define recommendation prompts
RECOMMENDATION_PROMPTS = {    QuestionType.LIFESTYLE: """
    You are a public health analyst. Based on the following health data, suggest specific lifestyle intervention programs that could be implemented at a community level. Focus on practical, evidence-based programs that address the most significant health challenges in this area.

    Health Data for {zip_code}:
    - Risk Score: {risk_score:.2f}
    - Diabetes Prevalence: {diabetes:.2f}%
    - Obesity Prevalence: {obesity:.2f}%
    - Physical Inactivity: {physical_inactivity:.2f}%
    - Smoking Rates: {smoking:.2f}%
    - High Blood Pressure: {blood_pressure:.2f}%
    - Food Insecurity: {food_insecurity:.2f}%
    - Limited Healthcare Access: {healthcare_access:.2f}%

    Provide your response in the following format:

    Ideas for Lifestyle Intervention Programs

    Community-Based & Accessible Programs:
    • Walking Programs/Clubs: Organize guided walks, designate safe walking routes, or partner with local community centers for indoor walking tracks.
    • Health Education Workshops: Regular sessions on nutrition, exercise, and disease management.

    Affordable Exercise Initiatives:
    • Free/Low-Cost Classes: Offer Zumba, aerobics, or strength training at community centers, parks, or schools.
    • Senior Fitness Programs: Targeted exercise classes for older adults.

    Nutrition & Wellness Programs:
    • Cooking Classes: Healthy meal preparation workshops focusing on affordable ingredients.
    • Community Gardens: Establish gardens in partnership with local schools and community centers.

    Note: Format each program with a clear category heading and bullet points for specific initiatives. Include practical details and focus on accessibility.
    """,
    
    QuestionType.RISK: """
    You are a public health analyst. Analyze how the following health metrics correlate to increased health risks in this area. Focus on identifying the relationships between different health factors and their combined impact on community health.

    Health Data for {zip_code}:
    - Risk Score: {risk_score:.2f}
    - Diabetes Prevalence: {diabetes:.2f}%
    - Obesity Prevalence: {obesity:.2f}%
    - Physical Inactivity: {physical_inactivity:.2f}%
    - Smoking Rates: {smoking:.2f}%
    - High Blood Pressure: {blood_pressure:.2f}%
    - Food Insecurity: {food_insecurity:.2f}%
    - Limited Healthcare Access: {healthcare_access:.2f}%

    Explain:
    1. Primary risk factors and their significance
    2. How these factors interact and compound each other
    3. Comparison to national averages
    4. Key areas requiring immediate attention

    Format your response with clear headings and use data to support your analysis.
    """,
    
    QuestionType.INDIVIDUAL: """
    You are a public health analyst. Based on the following health data, provide practical, actionable steps that individuals in this area can take to improve their health outcomes.

    Health Data for {zip_code}:
    - Risk Score: {risk_score:.2f}
    - Diabetes Prevalence: {diabetes:.2f}%
    - Obesity Prevalence: {obesity:.2f}%
    - Physical Inactivity: {physical_inactivity:.2f}%
    - Smoking Rates: {smoking:.2f}%
    - High Blood Pressure: {blood_pressure:.2f}%
    - Food Insecurity: {food_insecurity:.2f}%
    - Limited Healthcare Access: {healthcare_access:.2f}%

    Provide specific recommendations for:
    1. Immediate actions individuals can take
    2. Lifestyle modifications based on local health challenges
    3. Prevention strategies
    4. Available local resources and how to access them

    Format your response with clear headings and actionable bullet points.
    """
}

async def fetch_interventions() -> List[Dict]:
    """
    Fetch interventions from S3 with caching and error handling
    Uses existing S3 pattern from GeoJSON
    """
    current_time = time.time()
    
    # Check cache first
    if (intervention_cache["data"] and 
        intervention_cache["timestamp"] and 
        current_time - intervention_cache["timestamp"] < intervention_cache["max_age"]):
        return intervention_cache["data"]
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/interventions/interventions-db.json"
            )
            response.raise_for_status()
            
            data = response.json()
            interventions = data.get("interventions", [])
            
            # Update cache
            intervention_cache["data"] = interventions
            intervention_cache["timestamp"] = current_time
            
            print(f"Loaded {len(interventions)} interventions from S3")
            return interventions
            
    except Exception as e:
        print(f"Warning: Could not fetch interventions: {e}")
        return []  # Graceful degradation

def get_relevant_interventions(health_data: dict, query: str = "", max_results: int = 3) -> List[Dict]:
    """
    Filter interventions based on health profile using keyword matching
    Simple, reliable approach for MVP
    """
    if not intervention_cache.get("data"):
        return []
    
    # Identify high-risk health areas
    risk_keywords = []
    
    if health_data.get('DIABETES_CrudePrev', 0) > 15:
        risk_keywords.extend(['diabetes', 'blood_sugar'])
    if health_data.get('OBESITY_CrudePrev', 0) > 25:
        risk_keywords.extend(['obesity', 'weight'])
    if health_data.get('LPA_CrudePrev', 0) > 20:
        risk_keywords.extend(['physical', 'activity', 'exercise'])
    if health_data.get('CSMOKING_CrudePrev', 0) > 15:
        risk_keywords.extend(['smoking', 'tobacco'])
    if health_data.get('FOODINSECU_CrudePrev', 0) > 10:
        risk_keywords.extend(['food', 'nutrition', 'food_security'])
    if health_data.get('ACCESS2_CrudePrev', 0) > 15:
        risk_keywords.extend(['healthcare', 'access', 'mobile'])
    
    # Add query-based keywords
    if query:
        query_words = query.lower().split()
        risk_keywords.extend([word for word in query_words if len(word) > 3])
    
    # Score and filter interventions
    scored_interventions = []
    for intervention in intervention_cache["data"]:
        score = 0
        
        # Match health issues
        for issue in intervention.get("health_issues", []):
            if any(keyword in issue.lower() for keyword in risk_keywords):
                score += 3
        
        # Match keywords
        for keyword in intervention.get("keywords", []):
            if keyword.lower() in risk_keywords:
                score += 1
        
        if score > 0:
            scored_interventions.append((score, intervention))
    
    # Return top matches
    scored_interventions.sort(key=lambda x: x[0], reverse=True)
    return [intervention for score, intervention in scored_interventions[:max_results]]

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/api/analyze")
async def analyze_health_data(data: HealthData):
    if not OPENROUTER_API_KEY:
        return {"error": "OpenRouter API key not configured."}

    print("API Key being used:", OPENROUTER_API_KEY) # Debugging line

    # Format data into a prompt for the AI
    prompt = f"""
    You are a public health analyst. Analyze the following health data for Zip Code {data.zip_code} and provide a concise summary of the key risk factors for diabetes and related conditions in this area. Focus on the most significant prevalence rates and their potential implications.

    Health Data:
    - Risk Score: {data.RiskScore:.2f}
    - Diabetes Crude Prevalence: {data.DIABETES_CrudePrev:.2f}%
    - Obesity Crude Prevalence: {data.OBESITY_CrudePrev:.2f}%
    - Lack of Physical Activity Prevalence: {data.LPA_CrudePrev:.2f}%
    - Current Smoking Crude Prevalence: {data.CSMOKING_CrudePrev:.2f}%
    - High Blood Pressure Crude Prevalence: {data.BPHIGH_CrudePrev:.2f}%
    - Food Insecurity Crude Prevalence: {data.FOODINSECU_CrudePrev:.2f}%
    - Limited Access to Healthcare Prevalence: {data.ACCESS2_CrudePrev:.2f}%

    Example output: 

    Provide a summary that is easy to understand for public health officials. Do not repeat the zip code in the summary. Please make it short no more than 500 characters. 
    
    """

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "YOUR_SITE_URL", # Optional. Site URL for rankings on openrouter.ai.
                    "X-Title": "YOUR_SITE_NAME" # Optional. Site title for rankings on openrouter.ai.
                },
                json={
                    "model": "mistralai/mistral-7b-instruct:free",
                    "messages": [{"role": "user", "content": prompt}]
                },
                timeout=60.0 # Add a timeout for the API call
            )
            response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

            openrouter_response = response.json()
            ai_summary = openrouter_response['choices'][0]['message']['content']

            return {"summary": ai_summary}

    except httpx.RequestError as exc:
        print(f"An error occurred while requesting {exc.request.url!r}: {exc}")
        return {"error": f"An error occurred while communicating with the AI service: {exc}"}
    except httpx.HTTPStatusError as exc:
        print(f"Error response {exc.response.status_code} while requesting {exc.request.url!r}: {exc}")
        return {"error": f"AI service returned an error: {exc.response.status_code} - {exc.response.text}"}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": f"An unexpected error occurred: {e}"}

@app.post("/api/recommendations")
async def get_recommendations(request: RecommendationRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured.")

    data = request.health_data
    prompt = RECOMMENDATION_PROMPTS[request.question_type].format(
        zip_code=data.zip_code,
        risk_score=data.RiskScore,
        diabetes=data.DIABETES_CrudePrev,
        obesity=data.OBESITY_CrudePrev,
        physical_inactivity=data.LPA_CrudePrev,
        smoking=data.CSMOKING_CrudePrev,
        blood_pressure=data.BPHIGH_CrudePrev,
        food_insecurity=data.FOODINSECU_CrudePrev,
        healthcare_access=data.ACCESS2_CrudePrev
    )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "YOUR_SITE_URL",
                    "X-Title": "YOUR_SITE_NAME"
                },
                json={
                    "model": "mistralai/mistral-7b-instruct:free",
                    "messages": [{"role": "user", "content": prompt}]
                },
                timeout=60.0
            )
            response.raise_for_status()

            openrouter_response = response.json()
            recommendation = openrouter_response['choices'][0]['message']['content']

            return {"recommendation": recommendation}

    except httpx.RequestError as exc:
        raise HTTPException(status_code=500, detail=f"An error occurred while communicating with the AI service: {exc}")
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=f"AI service error: {exc.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not OPENROUTER_API_KEY:
        print("❌ ERROR: OPENROUTER_API_KEY environment variable not set")
        raise HTTPException(status_code=500, detail="OpenRouter API key not configured. Please check environment variables.")
    
    print(f"✅ Using OpenRouter API key: {OPENROUTER_API_KEY[:10]}...")
    
    # Prepare the system message with context about the project and data
    system_message = """You are a helpful assistant that answers questions about diabetes risk factors and health data. Format your responses clearly with:
    - Use headers (###) for main sections
    - Break information into clear paragraphs
    - Use bullet points or numbered lists for steps or multiple items
    - Keep paragraphs concise and focused
    - Highlight key statistics or numbers when relevant
    - Use subheadings (####) to organize complex responses
    
    If zip code data is provided, analyze it and provide specific insights about:
    1. Current health statistics
    2. Risk factors specific to the area
    3. Targeted recommendations based on the local context
    
    Keep responses clear, actionable, and well-structured."""

    # Format the conversation history for the API
    messages = [{"role": "system", "content": system_message}]
    
    # Add conversation history
    for msg in request.messages:
        messages.append({"role": msg["role"], "content": msg["content"]})

    # NEW: Add intervention context when relevant
    if (ENABLE_INTERVENTIONS and request.selected_area and 
        any(keyword in request.message.lower() for keyword in ['intervention', 'recommendation', 'program', 'help', 'ideas', 'solution'])):
        
        # Fetch interventions (with caching)
        if not intervention_cache.get("data"):
            await fetch_interventions()
        
        relevant_interventions = get_relevant_interventions(
            request.selected_area, 
            request.message,
            max_results=3
        )
        
        if relevant_interventions:
            intervention_context = "\n\n### Evidence-Based Intervention Options:\n"
            for i, intervention in enumerate(relevant_interventions, 1):
                intervention_context += f"\n**{i}. {intervention['title']}** ({intervention['category']})\n"
                intervention_context += f"- {intervention['description'][:180]}...\n"
                intervention_context += f"- Target: {intervention.get('target_population', 'General population').replace('_', ' ')}\n"
                intervention_context += f"- Timeline: {intervention.get('timeframe', 'Varies')}\n"
                intervention_context += f"- Cost: {intervention.get('implementation_cost', 'Medium').title()}\n"
            
            intervention_context += "\n*Base your recommendations on these proven interventions and explain how they address the specific health risks in this area.*"
            messages.append({"role": "system", "content": intervention_context})

    # If there's selected area data, add it as context
    if request.selected_area:
        context = f"\nContext for the selected area (ZIP code {request.selected_area.get('zip_code', 'unknown')}):\n"
        context += "\n".join([f"- {k}: {v}" for k, v in request.selected_area.items()])
        context_message = f"""### Area Context
    {context}
    
    Format your response using markdown with clear sections, bullet points for lists, and proper spacing between paragraphs."""
    messages.append({"role": "system", "content": context_message})
    
    # Add the current user message
    messages.append({"role": "user", "content": request.message})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "https://geo-risk-spotter.vercel.app",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "mistralai/mistral-7b-instruct:free",  # Free model available on OpenRouter
                    "messages": messages
                }
            )
            
            if response.status_code != 200:
                print(f"OpenRouter API error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=response.status_code, detail="Error from OpenRouter API")
            
            data = response.json()
            return {"response": data["choices"][0]["message"]["content"]}

    except httpx.RequestError as e:
        print(f"❌ Request error: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to AI service")
    except httpx.HTTPStatusError as e:
        print(f"❌ HTTP error: {e.response.status_code} - {e.response.text}")
        if e.response.status_code == 401:
            raise HTTPException(status_code=500, detail="AI service authentication failed. Please check API key configuration.")
        raise HTTPException(status_code=500, detail=f"AI service error: {e.response.status_code}")
    except Exception as e:
        print(f"❌ Unexpected error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Initialize intervention cache on startup
@app.on_event("startup")
async def startup_event():
    """Load interventions into cache on startup"""
    print(f"🚀 Starting RiskPulse: Diabetes backend...")
    print(f"📍 Environment check:")
    print(f"   - OPENROUTER_API_KEY: {'✅ Set' if OPENROUTER_API_KEY else '❌ Missing'}")
    print(f"   - ENABLE_INTERVENTIONS: {ENABLE_INTERVENTIONS}")
    
    if ENABLE_INTERVENTIONS:
        try:
            await fetch_interventions()
            print("✅ Intervention cache initialized")
        except Exception as e:
            print(f"⚠️ Failed to initialize intervention cache: {e}")
            # Don't fail startup if interventions can't be loaded

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

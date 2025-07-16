from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import time
from typing import Optional, List, Dict
from dotenv import load_dotenv

# Import services
from services.enhanced_interventions import EnhancedInterventionService
from services.prompt_templates import PromptTemplateService, QuestionType
from services.cache_manager import cache_manager

print("Initial OPENROUTER_API_KEY:", os.getenv("OPENROUTER_API_KEY")) # Debugging line

# Load environment variables from .env file (override existing)
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'), override=True)
print("OPENROUTER_API_KEY after .env load:", os.getenv("OPENROUTER_API_KEY"))

# Get OpenRouter API key from environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Feature flags
ENABLE_INTERVENTIONS = os.getenv("ENABLE_INTERVENTIONS", "true").lower() == "true"
ENABLE_ENHANCED_RAG = os.getenv("ENABLE_ENHANCED_RAG", "true").lower() == "true"
ENABLE_CHAT = os.getenv("ENABLE_CHAT", "true").lower() == "true"

# Service instances
enhanced_intervention_service = None
prompt_service = PromptTemplateService()

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
    # Core identifiers (required for backward compatibility)
    zip_code: str
    RiskScore: float
    
    # Original core health metrics (required for backward compatibility)
    DIABETES_CrudePrev: float
    OBESITY_CrudePrev: float
    LPA_CrudePrev: float
    CSMOKING_CrudePrev: float
    BPHIGH_CrudePrev: float
    FOODINSECU_CrudePrev: float
    ACCESS2_CrudePrev: float
    
    # Population demographics (new - optional for backward compatibility)
    TotalPopulation: Optional[float] = None
    TotalPop18plus: Optional[float] = None
    
    # Social determinants of health (new - optional for backward compatibility)
    DEPRESSION_CrudePrev: Optional[float] = None
    ISOLATION_CrudePrev: Optional[float] = None
    HOUSINSECU_CrudePrev: Optional[float] = None
    LACKTRPT_CrudePrev: Optional[float] = None
    FOODSTAMP_CrudePrev: Optional[float] = None
    
    # Additional health outcomes (new - optional for backward compatibility)
    GHLTH_CrudePrev: Optional[float] = None
    MHLTH_CrudePrev: Optional[float] = None
    PHLTH_CrudePrev: Optional[float] = None
    CHECKUP_CrudePrev: Optional[float] = None
    DENTAL_CrudePrev: Optional[float] = None
    SLEEP_CrudePrev: Optional[float] = None

class RecommendationRequest(BaseModel):
    question_type: QuestionType
    health_data: HealthData

class ChatRequest(BaseModel):
    message: str
    messages: list
    selected_area: dict = None

async def get_enhanced_relevant_interventions(health_data: dict, query: str = "", max_results: int = 3) -> List[Dict]:
    """
    Enhanced intervention recommendations using vector similarity + keyword matching.
    Falls back to empty list if enhanced service fails.
    """
    global enhanced_intervention_service
    
    if not ENABLE_ENHANCED_RAG:
        # Return empty list if enhanced RAG is disabled
        return []
    
    try:
        # Initialize enhanced service if needed
        if enhanced_intervention_service is None:
            enhanced_intervention_service = EnhancedInterventionService()
        
        # Get enhanced recommendations
        recommendations = await enhanced_intervention_service.get_enhanced_recommendations(
            health_data, query, max_results
        )
        
        if recommendations:
            print(f"✅ Enhanced RAG returned {len(recommendations)} recommendations")
            return recommendations
        else:
            print("⚠️  Enhanced RAG returned no results")
            return []
            
    except Exception as e:
        print(f"❌ Enhanced RAG failed: {e}")
        return []

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
    prompt = prompt_service.get_prompt(request.question_type).format(
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
    """
    Enhanced chat endpoint with Phase B intervention integration.
    Includes fallback mode for OpenRouter API issues.
    """
    if not ENABLE_CHAT:
        raise HTTPException(
            status_code=503, 
            detail="Chat functionality is temporarily disabled. Use /api/recommendations/enhanced for intervention recommendations."
        )
    
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

    # ENHANCED: Add intervention context when relevant (Phase B)
    if (ENABLE_INTERVENTIONS and request.selected_area and 
        any(keyword in request.message.lower() for keyword in ['intervention', 'recommendation', 'program', 'help', 'ideas', 'solution'])):
        
        # Use enhanced recommendations with fallback to legacy
        relevant_interventions = await get_enhanced_relevant_interventions(
            request.selected_area, 
            request.message,
            max_results=3
        )
        
        if relevant_interventions:
            intervention_context = "\n\n### Evidence-Based Intervention Options:\n"
            for i, intervention in enumerate(relevant_interventions, 1):
                # Enhanced display with relevance score if available
                relevance = intervention.get('_relevance_score')
                title_line = f"\n**{i}. {intervention['title']}** ({intervention['category']})"
                if relevance and ENABLE_ENHANCED_RAG:
                    title_line += f" *[Relevance: {relevance:.1%}]*"
                
                intervention_context += title_line + "\n"
                intervention_context += f"- {intervention['description'][:180]}...\n"
                intervention_context += f"- Target: {intervention.get('target_population', 'General population').replace('_', ' ')}\n"
                intervention_context += f"- Timeline: {intervention.get('timeframe', 'Varies')}\n"
                intervention_context += f"- Cost: {intervention.get('implementation_cost', 'Medium').title()}\n"
                
                # Add evidence level if available
                if intervention.get('evidence_level'):
                    intervention_context += f"- Evidence: {intervention.get('evidence_level', 'Medium').title()}\n"
            
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
    """Initialize services on startup"""
    print(f"🚀 Starting RiskPulse: Diabetes backend...")
    print(f"📍 Environment check:")
    print(f"   - OPENROUTER_API_KEY: {'✅ Set' if OPENROUTER_API_KEY else '❌ Missing'}")
    print(f"   - ENABLE_INTERVENTIONS: {ENABLE_INTERVENTIONS}")
    print(f"   - ENABLE_ENHANCED_RAG: {ENABLE_ENHANCED_RAG}")
    
    if ENABLE_INTERVENTIONS and ENABLE_ENHANCED_RAG:
        try:
            # Initialize enhanced service if enabled
            global enhanced_intervention_service
            enhanced_intervention_service = EnhancedInterventionService()
            print("✅ Enhanced RAG service initialized")
                
        except Exception as e:
            print(f"⚠️ Failed to initialize intervention system: {e}")
            # Don't fail startup if interventions can't be loaded

@app.post("/api/recommendations/enhanced")
async def get_enhanced_recommendations_endpoint(request: RecommendationRequest):
    """
    Enhanced recommendation endpoint using Phase B vector similarity + keyword matching.
    """
    if not ENABLE_ENHANCED_RAG:
        raise HTTPException(status_code=501, detail="Enhanced RAG is disabled. Use /api/recommendations instead.")
    
    try:
        # Generate smart query from health data for vector similarity
        health_data = request.health_data.dict()
        smart_query = _generate_smart_query_from_health_data(health_data)
        
        # Use enhanced intervention service
        recommendations = await get_enhanced_relevant_interventions(
            health_data,
            query=smart_query,
            max_results=5
        )
        
        if not recommendations:
            return {"recommendations": [], "message": "No relevant interventions found."}
        
        # Format recommendations with enhanced metadata
        formatted_recs = []
        for rec in recommendations:
            formatted_rec = {
                "title": rec.get("title", ""),
                "category": rec.get("category", ""),
                "description": rec.get("description", ""),
                "target_population": rec.get("target_population", ""),
                "implementation_cost": rec.get("implementation_cost", ""),
                "timeframe": rec.get("timeframe", ""),
                "evidence_level": rec.get("evidence_level", ""),
                "relevance_score": rec.get("_relevance_score", 0.0)
            }
            
            # Add scoring breakdown if available
            if ENABLE_ENHANCED_RAG:
                formatted_rec["scoring"] = {
                    "vector_score": rec.get("_vector_score", 0.0),
                    "keyword_score": rec.get("_keyword_score", 0.0),
                    "context_score": rec.get("_context_score", 0.0)
                }
            
            formatted_recs.append(formatted_rec)
        
        return {
            "recommendations": formatted_recs,
            "method": "enhanced_rag",
            "total_found": len(formatted_recs)
        }
        
    except Exception as e:
        print(f"❌ Enhanced recommendations error: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating enhanced recommendations: {str(e)}")

def _generate_smart_query_from_health_data(health_data: dict) -> str:
    """
    Generate an intelligent query from health data for vector similarity matching.
    This enables meaningful "Health Context Match" scores when no explicit query is provided.
    """
    query_terms = []
    
    # Analyze health data and build contextual query
    diabetes_rate = health_data.get('DIABETES_CrudePrev', 0)
    obesity_rate = health_data.get('OBESITY_CrudePrev', 0)
    inactivity_rate = health_data.get('LPA_CrudePrev', 0)
    smoking_rate = health_data.get('CSMOKING_CrudePrev', 0)
    hypertension_rate = health_data.get('BPHIGH_CrudePrev', 0)
    food_insecurity_rate = health_data.get('FOODINSECU_CrudePrev', 0)
    healthcare_access_rate = health_data.get('ACCESS2_CrudePrev', 0)
    
    # Priority health issues based on rates
    if diabetes_rate > 15:
        query_terms.append("diabetes prevention blood sugar glucose management")
    if obesity_rate > 25:
        query_terms.append("obesity weight management BMI reduction")
    if inactivity_rate > 20:
        query_terms.append("physical activity exercise fitness walking")
    if smoking_rate > 15:
        query_terms.append("smoking cessation tobacco quit")
    if hypertension_rate > 30:
        query_terms.append("blood pressure hypertension cardiovascular")
    if food_insecurity_rate > 10:
        query_terms.append("food security nutrition access healthy eating")
    if healthcare_access_rate > 15:
        query_terms.append("healthcare access mobile health services")
    
    # Add general health promotion terms
    query_terms.append("community health chronic disease prevention")
    
    # Create coherent query
    smart_query = " ".join(query_terms)
    
    # If no specific health issues, use general diabetes prevention query
    if not query_terms or smart_query.strip() == "community health chronic disease prevention":
        smart_query = "diabetes prevention community health chronic disease management"
    
    return smart_query

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

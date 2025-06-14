from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv('backend/.env')
print("OPENROUTER_API_KEY:", os.getenv("OPENROUTER_API_KEY"))

# Get OpenRouter API key from environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

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

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/api/analyze")
async def analyze_health_data(data: HealthData):
    if not OPENROUTER_API_KEY:
        return {"error": "OpenRouter API key not configured."}

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

    Provide a summary that is easy to understand for public health officials.
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
                    "model": "mistralai/mistral-7b-instruct",
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

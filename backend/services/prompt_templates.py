"""
Prompt templates for AI-powered health data analysis and recommendations.
Centralized prompt management for consistent, maintainable AI interactions.
"""

from enum import Enum
from typing import Dict

class QuestionType(str, Enum):
    LIFESTYLE = "lifestyle_interventions"
    RISK = "risk_correlation"
    INDIVIDUAL = "individual_actions"

class PromptTemplateService:
    """Service for managing AI prompt templates and formatting."""
    
    @staticmethod
    def get_recommendation_prompts() -> Dict[QuestionType, str]:
        """Get all recommendation prompt templates."""
        return {
            QuestionType.LIFESTYLE: """
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

1. **[Program Name]**: Brief description addressing [specific health challenge]
2. **[Program Name]**: Brief description addressing [specific health challenge]
3. **[Program Name]**: Brief description addressing [specific health challenge]

Focus on programs that:
- Are evidence-based and proven effective
- Can be implemented at a community level
- Address the highest-risk factors for this area
- Are cost-effective and sustainable
""",
            
            QuestionType.RISK: """
You are a public health epidemiologist. Analyze the following health data to identify correlations and risk factors contributing to diabetes prevalence in this area.

Health Data for {zip_code}:
- Risk Score: {risk_score:.2f}
- Diabetes Prevalence: {diabetes:.2f}%
- Obesity Prevalence: {obesity:.2f}%
- Physical Inactivity: {physical_inactivity:.2f}%
- Smoking Rates: {smoking:.2f}%
- High Blood Pressure: {blood_pressure:.2f}%
- Food Insecurity: {food_insecurity:.2f}%
- Limited Healthcare Access: {healthcare_access:.2f}%

Analyze the correlations and provide insights on:
1. **Primary Risk Factors**: Which metrics show strongest correlation with diabetes prevalence?
2. **Modifiable Factors**: Which risk factors can be addressed through interventions?
3. **Population Health Impact**: What would be the highest-impact areas for intervention?
4. **Risk Stratification**: How does this area compare to national/regional averages?
""",
            
            QuestionType.INDIVIDUAL: """
You are a certified diabetes educator and public health advisor. Based on the community health data below, provide actionable advice for individuals living in this area.

Health Data for {zip_code}:
- Risk Score: {risk_score:.2f}
- Diabetes Prevalence: {diabetes:.2f}%
- Obesity Prevalence: {obesity:.2f}%
- Physical Inactivity: {physical_inactivity:.2f}%
- Smoking Rates: {smoking:.2f}%
- High Blood Pressure: {blood_pressure:.2f}%
- Food Insecurity: {food_insecurity:.2f}%
- Limited Healthcare Access: {healthcare_access:.2f}%

Provide practical, personalized advice for:
1. **Risk Assessment**: What should individuals know about their local risk factors?
2. **Prevention Strategies**: Specific actions individuals can take to reduce diabetes risk
3. **Local Resources**: Types of resources individuals should seek in their community
4. **Warning Signs**: Key symptoms and risk factors to monitor
"""
        }
    
    @staticmethod
    def format_health_data_prompt(template: str, zip_code: str, health_data: dict) -> str:
        """Format a prompt template with health data."""
        return template.format(
            zip_code=zip_code,
            risk_score=health_data.get('RiskScore', 0),
            diabetes=health_data.get('DIABETES_CrudePrev', 0),
            obesity=health_data.get('OBESITY_CrudePrev', 0),
            physical_inactivity=health_data.get('LPA_CrudePrev', 0),
            smoking=health_data.get('CSMOKING_CrudePrev', 0),
            blood_pressure=health_data.get('BPHIGH_CrudePrev', 0),
            food_insecurity=health_data.get('FOODINSECU_CrudePrev', 0),
            healthcare_access=health_data.get('ACCESS2_CrudePrev', 0)
        )
    
    @staticmethod
    def get_chat_system_prompt() -> str:
        """Get the system prompt for general chat functionality."""
        return """You are an expert public health data analyst specializing in diabetes prevention and community health. 
You help public health professionals understand health data, identify risk factors, and develop targeted interventions.

When analyzing health data:
1. Focus on actionable insights and evidence-based recommendations
2. Consider social determinants of health and health equity
3. Prioritize interventions with the highest population health impact
4. Provide clear, accessible explanations suitable for diverse stakeholders

Always maintain a professional, supportive tone while delivering data-driven insights."""

    @staticmethod
    def format_chat_prompt_with_context(message: str, health_data: dict = None, chat_history: list = None) -> str:
        """Format a chat prompt with health data context and conversation history."""
        context_parts = []
        
        if health_data:
            context_parts.append(f"""
Current Area Health Data:
- Zip Code: {health_data.get('zip_code', 'Unknown')}
- Risk Score: {health_data.get('RiskScore', 0):.2f}
- Diabetes Prevalence: {health_data.get('DIABETES_CrudePrev', 0):.2f}%
- Obesity Prevalence: {health_data.get('OBESITY_CrudePrev', 0):.2f}%
- Physical Inactivity: {health_data.get('LPA_CrudePrev', 0):.2f}%
- Smoking Rates: {health_data.get('CSMOKING_CrudePrev', 0):.2f}%
- High Blood Pressure: {health_data.get('BPHIGH_CrudePrev', 0):.2f}%
- Food Insecurity: {health_data.get('FOODINSECU_CrudePrev', 0):.2f}%
- Limited Healthcare Access: {health_data.get('ACCESS2_CrudePrev', 0):.2f}%
""")
        
        if context_parts:
            context = "\n".join(context_parts)
            return f"{context}\n\nUser Question: {message}"
        
        return message

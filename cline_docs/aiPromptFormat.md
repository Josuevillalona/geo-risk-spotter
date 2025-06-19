## AI Prompt Format Documentation

This document outlines the AI prompt format used in the backend for generating summaries and recommendations based on health data.

### `/api/analyze` Endpoint Prompt

This endpoint uses a specific prompt to generate a concise summary of key risk factors for diabetes and related conditions based on provided zip code health data.

**System Message:**

```
You are a public health analyst. Analyze the following health data for Zip Code {data.zip_code} and provide a concise summary of the key risk factors for diabetes and related conditions in this area. Focus on the most significant prevalence rates and their potential implications.
```

**User Prompt Structure:**

The user prompt includes the health data for a specific zip code, formatted as follows:

```
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
```

The values within the curly braces `{}` are dynamically populated with the actual health data for the selected zip code.

### `/api/recommendations` Endpoint Prompts

This endpoint uses different prompts based on the `question_type` parameter to provide specific recommendations. The prompts are stored in the `RECOMMENDATION_PROMPTS` dictionary in `backend/main.py`.

(The specific formats for LIFESTYLE, RISK, and INDIVIDUAL question types are detailed in the `backend/main.py` file within the `RECOMMENDATION_PROMPTS` dictionary.)

### `/api/chat` Endpoint Prompt

This endpoint uses a system message to define the AI's role as a helpful assistant for answering questions about diabetes risk factors and health data. It also includes the conversation history and optionally provides context about the selected area's health data.

**System Message:**

```
You are a helpful assistant that answers questions about diabetes risk factors and health data. Format your responses clearly with:
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

Keep responses clear, actionable, and well-structured.
```

**User Prompt Structure:**

The user prompt contains the current message from the user.

**Context Message (Optional):**

If `selected_area` data is provided in the request, a system message with the area context is included:

```
### Area Context
Context for the selected area (ZIP code {request.selected_area.get('zip_code', 'unknown')}):
- {key}: {value}
...

Format your response using markdown with clear sections, bullet points for lists, and proper spacing between paragraphs.

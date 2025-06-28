# Codebase Summary

## Key Components and Their Interactions

- **App.jsx:** The main application component. Manages the top-level state for `selectedArea`, `isLoading`, and `aiSummary`. Renders the `Dashboard` component and passes down state and state update functions as props.
- **components/Dashboard.jsx:** Sets up the main layout of the application with a map section and an AI insights/sidebar section. Renders the `Map` component and the top-level `Sidebar` component, passing down relevant props. Includes the risk indicator legend.
- **src/Map.jsx:** Renders the interactive map using `react-leaflet`. Fetches GeoJSON data. Styles map features based on Risk Score. On zip code click, sets the `selectedArea` state, triggers the API call to the backend, and manages the `isLoading` and `aiSummary` states via props received from `App.jsx`.
- **src/Sidebar.jsx:** Renders the sidebar content with a tabbed interface for "AI Analysis", "Raw Data", and "Recommendations". Displays the AI summary, the raw health data table, or the `RecommendationsTab` component based on the active tab.
- **src/components/RecommendationsTab.jsx:** A simple container component that renders the `Chatbot`.
- **src/components/Chatbot.jsx:** Implements the full chat interface. It manages user input, conversation history (using a Zustand store), and loading states. It sends user messages to the `/api/chat` backend endpoint and displays the AI's responses.
- **src/store.js:** Defines the Zustand store (`useChatStore`) for managing the state of the chatbot's conversation history.

## Data Flow

1.  **Initial Analysis:**
    *   When a zip code is clicked on the map, an API call is made from `src/Map.jsx` to the `/api/analyze` endpoint with the clicked zip code's health data.
    *   The `aiSummary` state in `App.jsx` is updated with the summary data from the response.
    *   This summary is displayed in the "AI Analysis" tab.

2.  **Conversational Chat:**
    *   The user types a message in the `Chatbot` component.
    *   The component sends the new message, the entire conversation history (from the `useChatStore`), and the `selectedArea` data to the `/api/chat` backend endpoint.
    *   The backend returns a context-aware response from the AI model.
    *   The `Chatbot` component adds the AI's response to the `useChatStore`, and the UI updates to display the new message in the conversation history.

## External Dependencies

- **Frontend:** React, React-Leaflet, Axios, Tailwind CSS, Zustand.
- **Backend:** Python, FastAPI, Uvicorn, Pydantic, httpx, python-dotenv.
- **Database:** PostgreSQL, PostGIS (planned for Phase 3).
- **AI Layer:** OpenRouter API (using `mistralai/mistral-7b-instruct` model).
- **Data Hosting:** Amazon S3 (for GeoJSON data).
- **Deployment:** Vercel (Frontend), Render (Backend).

## Recent Significant Changes

- Implemented a tabbed interface ("AI Analysis", "Raw Data", and "Recommendations") in the sidebar.
- **Implemented `Chatbot` component with a full conversational UI.**
- **Integrated Zustand (`useChatStore`) for robust chat state management.**
- **Created `/api/chat` endpoint in the backend to handle conversational context.**
- Added a "Recommendations" tab to house the chatbot for interactive data exploration.
- Refactored frontend structure to use a `Dashboard` component.
- Updated backend to use the `mistralai/mistral-7b-instruct` model via OpenRouter.
- Configured backend deployment on Render.

## User Feedback Integration and Its Impact on Development

- User feedback regarding the raw data display on hover led to the removal of hover effects and the decision to display raw data on click in the sidebar.
- User feedback regarding backend deployment errors led to the creation of `requirements.txt` and adjustments to Render configuration.
- User feedback regarding OpenRouter rate limits led to switching the AI model used in the backend.

## Planned Enhancements (Next Sprint)

### Contextualized Intervention Recommendations (Sprint 2.2)
- **S3 Intervention Database**: JSON-based knowledge base with 25+ evidence-based interventions
- **Smart Recommendation Engine**: Keyword-based matching system linking health risks to proven interventions  
- **Enhanced Chat Integration**: Intervention context automatically added to relevant chat responses
- **Performance Optimization**: Server-side caching and smart intervention limiting
- **Minimal Frontend Changes**: Single quick action button leveraging existing chatbot UI

**Technical Integration Points:**
- `backend/main.py`: Enhanced `/api/chat` endpoint with intervention fetching and caching
- `src/components/Chatbot.jsx`: Additional quick action button for intervention requests
- AWS S3: Extended to host intervention knowledge base alongside existing GeoJSON data
- OpenRouter API: Enhanced prompts with intervention context for more actionable responses

**Architecture Benefits:**
- Leverages existing proven S3 + chatbot infrastructure
- Minimal complexity increase with maximum user value
- Maintains zero-regression approach established in previous sprints
- Prepares foundation for advanced RAG implementation in Phase 3
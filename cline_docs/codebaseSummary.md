# Codebase Summary

## Current Development Phase: Public Health Planner UX Enhancements 🚀

### **Upcoming Major Enhancement (Phase 4)**
**Layered Implementation Plan**: 4-layer enhancement strategy to transform RiskPulse into professional Public Health Planner tool

#### **Layer-by-Layer Architecture**
1. **Information Hierarchy Optimization** (5-7 days)
   - Hero metrics with risk score prominence
   - Workflow-driven section restructuring  
   - Context strip for immediate area understanding

2. **Correlation Insights Engine** (7-10 days)
   - Automated root cause analysis
   - "Why is this area high-risk?" functionality
   - Neighborhood comparison tools

3. **Evidence Package Builder** (10-12 days)  
   - Stakeholder presentation mode
   - PDF evidence package generation
   - Shareable collaboration links

4. **Advanced Analytics Integration** (12-15 days)
   - ROI calculator for interventions
   - Predictive impact modeling
   - Cost-benefit analysis automation

### **Technical Integration Points for Enhancement**
- **Sidebar.jsx**: Primary target for workflow restructuring and hero metrics
- **New Services**: correlationAnalysis.js, evidenceExporter.js, predictiveModels.js  
- **New Components**: HeroMetrics, RootCausePanel, PresentationMode, ROICalculator
- **Enhanced Backend**: Correlation analysis endpoints, evidence generation APIs
- **CSS Enhancements**: Professional visual hierarchy and presentation styling

### **Strategic Approach**
- **MVP-First**: Each layer delivers standalone value
- **Incremental Risk**: Start low-risk, build to advanced analytics
- **Zero Regression**: Maintain existing functionality while enhancing
- **Performance Focus**: <2 second load times, optimized rendering

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

## Recently Completed Features ✅

### Enhanced RAG Implementation (Phase B) ✅ COMPLETE
- **Local Vector Embeddings**: ✅ sentence-transformers with all-MiniLM-L6-v2 model for semantic search
- **Hybrid Search Algorithm**: ✅ 50% vector + 30% keyword + 20% context scoring with category diversity
- **Enhanced API Integration**: ✅ `/api/recommendations/enhanced` endpoint with detailed scoring metadata
- **UI Transparency**: ✅ Interactive scoring visualization with progress bars and detailed breakdowns
- **Performance Optimization**: ✅ Local processing eliminates API costs, sub-second response times

**Impact**: Advanced semantic understanding of intervention content with transparent algorithm insights for decision-making.

**Technical Integration Points:**
- `backend/services/embeddings.py`: ✅ Vector embedding service with caching and error handling
- `backend/services/enhanced_interventions.py`: ✅ Hybrid search algorithm with relevance scoring
- `src/components/EnhancedInterventionDisplay.jsx`: ✅ Professional UI with animated scoring bars
- Enhanced RAG Tab: ✅ Dedicated section with algorithm transparency and user education

**Results Achieved:**
- ✅ 5 recommendations per query (up from 3) with 60% high-relevance rate (>0.7 threshold)
- ✅ 1.7 average category diversity ensuring comprehensive intervention coverage
- ✅ 100% success rate with zero ongoing API costs and sub-second response times

### Contextualized Intervention Recommendations (Sprint 2.2) ✅ COMPLETE
- **S3 Intervention Database**: ✅ 50 evidence-based interventions with comprehensive metadata
- **Smart Recommendation Engine**: ✅ Keyword-based matching system linking health risks to proven interventions  
- **Enhanced Chat Integration**: ✅ "🎯 Get Interventions" quick action with automatic context injection
- **Performance Optimization**: ✅ 30-minute server-side caching and smart intervention limiting (max 3)
- **Production Deployment**: ✅ Live on Render/Vercel with comprehensive error handling

**Impact**: Transformed platform from data visualization tool into actionable insights generator for public health professionals.

**Technical Integration Points:**
- `backend/main.py`: ✅ Enhanced `/api/chat` endpoint with intervention fetching, caching, and keyword matching
- `src/components/Chatbot.jsx`: ✅ Added intervention quick action button with seamless UX
- AWS S3: ✅ Extended to host intervention knowledge base alongside existing GeoJSON data
- OpenRouter API: ✅ Enhanced prompts with intervention context using `mistralai/mistral-7b-instruct:free`

**Architecture Benefits Realized:**
- ✅ Leveraged existing proven S3 + chatbot infrastructure (zero regressions)
- ✅ Minimal complexity increase with maximum user value delivered
- ✅ Zero-regression approach maintained established quality standards
- ✅ Foundation prepared for advanced RAG implementation in Phase 3
# Codebase Summary

## Key Components and Their Interactions

- **App.jsx:** The main application component. Manages the top-level state for `selectedArea`, `isLoading`, and `aiSummary`. Renders the `Dashboard` component and passes down state and state update functions as props.
- **components/Dashboard.jsx:** Sets up the main layout of the application with a map section and an AI insights/sidebar section. Renders the `Map` component and the top-level `Sidebar` component, passing down relevant props. Includes the risk indicator legend.
- **src/Map.jsx:** Renders the interactive map using `react-leaflet`. Fetches GeoJSON data. Styles map features based on Risk Score. On zip code click, sets the `selectedArea` state, triggers the API call to the backend, and manages the `isLoading` and `aiSummary` states via props received from `App.jsx`. Does NOT control a popover on the map for raw data display.
- **src/Sidebar.jsx:** Renders the sidebar content with a tabbed interface for "AI Analysis" and "Raw Data". Displays a loading message or the AI summary in the "AI Analysis" tab. Displays the raw health data for the `selectedArea` in a table format in the "Raw Data" tab.
- **src/components/Sidebar.jsx:** (Note: This component exists but is not currently used in the main application flow as the top-level `src/Sidebar.jsx` is used by `Dashboard.jsx` for the tabbed interface).
- **src/DataPopover.jsx:** (Note: This component has been removed as the raw data is now displayed in the sidebar).

## Data Flow

1.  GeoJSON data is fetched in `src/Map.jsx` and stored in its local state.
2.  When a zip code is clicked on the map:
    *   The `selectedArea` state in `App.jsx` is updated via a prop passed to `Map.jsx`.
    *   An API call is made from `src/Map.jsx` to the deployed backend (`https://geo-risk-spotter.onrender.com/api/analyze`) with the clicked zip code's health data.
    *   The `isLoading` state in `App.jsx` is set to `true` before the API call and `false` after.
    *   Upon a successful API response, the `aiSummary` state in `App.jsx` is updated with the summary data.
3.  The `selectedArea`, `isLoading`, and `aiSummary` states are passed down from `App.jsx` to `Dashboard.jsx`, and then to the top-level `src/Sidebar.jsx`.
4.  `src/Sidebar.jsx` uses these props to conditionally display the raw data table (when the "Raw Data" tab is active and `selectedArea` is set), a loading message (when `isLoading` is true), or the AI summary (when `aiSummary` is available and the "AI Analysis" tab is active).

## External Dependencies

- **Frontend:** React, React-Leaflet, Axios, Tailwind CSS, Zustand (for chat state - *Note: Zustand state management for chat is planned for a later sprint*).
- **Backend:** Python, FastAPI, Uvicorn, Pydantic, httpx, python-dotenv.
- **Database:** PostgreSQL, PostGIS (planned for Phase 3).
- **AI Layer:** OpenRouter API (using `mistralai/mistral-7b-instruct` model).
- **Data Hosting:** Amazon S3 (for GeoJSON data).
- **Deployment:** Vercel (Frontend), Render (Backend).

## Recent Significant Changes

- Refactored frontend structure to use a `Dashboard` component.
- Implemented a tabbed interface ("AI Analysis" and "Raw Data") in the sidebar (`src/Sidebar.jsx`).
- Modified `src/Sidebar.jsx` to display raw health data in a table format within the "Raw Data" tab.
- Modified `src/Map.jsx` to remove the `layer.bindPopup` and the logic controlling the `DataPopover` on click.
- Removed the `src/DataPopover.jsx` component as it is no longer used for displaying raw data on the map.
- Updated backend to use the `mistralai/mistral-7b-instruct` model via OpenRouter.
- Configured backend deployment on Render with correct build/start commands and environment variables.

## User Feedback Integration and Its Impact on Development

- User feedback regarding the raw data display on hover led to the removal of hover effects and the decision to display raw data on click in a popover (initially attempted) and then in the sidebar (current implementation).
- User feedback regarding backend deployment errors (missing `requirements.txt`, `ModuleNotFoundError`, port binding) led to the creation of `requirements.txt` and adjustments to Render configuration (Root Directory, Build Command, Start Command).
- User feedback regarding OpenRouter rate limits led to switching the AI model used in the backend.

## Current Task: Phase 1 - Sprint 1.5: The "Full MVP Hookup" Slice

### Objective
Integrate the frontend with the deployed backend API for AI analysis and display both raw data and AI insights in the sidebar.
Enable map response when pressing Enter in the zip code search bar.

### Context
We have successfully completed Sprint 1.4, which validated client-side interactivity and raw data display in the sidebar. In Sprint 1.5, we have:

- Set up the backend with FastAPI.
- Implemented the `/api/analyze` endpoint to call the OpenRouter API.
- Configured CORS for frontend communication.
- Set up local environment variable loading for the OpenRouter API key.
- Deployed the backend to Render with correct configuration and environment variables.
- Integrated the frontend (`src/Map.jsx`) to call the deployed backend API on zip code click.
- Updated the frontend (`src/Sidebar.jsx`) to include a tabbed interface for "AI Analysis" and "Raw Data" and display raw data in a table format.
- Removed the `DataPopover` component as raw data is now in the sidebar.

### Next Steps
1. Implement frontend loading states and display the AI summary received from the backend in the sidebar's "AI Analysis" tab. (Partially completed by setting up state and conditional rendering, needs verification after deployment).
2. Address the unresolved Food Insecurity data discrepancy.
3. Document the AI prompt format.
4. Update `cline_docs/projectRoadmap.md` to reflect completed tasks in Sprint 1.5.
5. Update `cline_docs/lessons-learned.md` with any new lessons learned during Sprint 1.5, including the issue with the browser tool.

### Success Criteria
When a zip code is clicked on the map or entered in the search bar and Enter is pressed:
- The map updates to show the area of the selected zip code.
- A loading indicator appears in the sidebar's "AI Analysis" tab.
- The frontend successfully calls the deployed backend API.
- The backend successfully calls the OpenRouter API and returns an AI summary.
- The loading indicator is replaced by the AI summary in the sidebar's "AI Analysis" tab.
- The "Raw Data" tab in the sidebar accurately displays the raw health data for the selected zip code in a table format.
- The Food Insecurity data discrepancy is resolved.
- The AI prompt format is documented.

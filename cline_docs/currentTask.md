## Current Task: Phase 1 - Sprint 1.1: The "Map on a Screen" Slice

### Objective
Validate the basic frontend toolchain and deployment pipeline. This proves that your development environment, framework, and hosting are all configured correctly before any complex logic is added.

### Context
We have successfully created the project-specific `.clinerules` files. We will use the current directory directly instead of creating a separate project folder.

### Next Steps
1. Initialize a new React project using Vite (npm create vite@latest .).
2. Install core dependencies: react, react-dom, leaflet, react-leaflet, and tailwindcss.
3. Create a single Map.jsx component.
4. Inside Map.jsx, render a `<MapContainer>` with a set initial view (e.g., centered on your target state).
5. Add a `<TileLayer>` component to display a base map from OpenStreetMap.
6. Set up a new GitHub repository and push your initial code.
7. Connect the repository to Vercel for continuous deployment.

### Success Criteria
You have a live, public Vercel URL that displays a zoomable, draggable world map. Nothing more.

## Current Task: Phase 1 - Sprint 1.4: The "Interactive Raw Data" Slice

### Objective
Validate the client-side interactivity and state management. This ensures the user interaction flow is working smoothly before introducing the complexity of a backend API call.

### Context
We have successfully completed Sprint 1.2, which involved processing the shapefile, adding the GeoJSON layer to the map component, configuring the application to fetch the minified GeoJSON data (`ny_new_york_zip_codes_health_data.geojson`) from the public directory on Vercel, and adding basic styling to make the zip code outlines visible. We also removed the conflicting local `shapes.geojson` file from the project root.

### Next Steps
1. Scripting: Update your Python script to include all relevant raw metrics (poverty, inactivity, etc.) as properties in the final data.geojson.
2. Frontend: Create a Sidebar.jsx component.
3. Frontend: In your main App.jsx, use the useState hook to create a selectedArea state variable.
4. Frontend: Implement the onEachFeature prop for the `<GeoJSON>` layer. Attach an onClick event to each zip code polygon.
5. Frontend: When a polygon is clicked, update the selectedArea state with the clicked feature's properties object.
6. Frontend: Pass the selectedArea data to the Sidebar component and display the raw metrics.

### Success Criteria
When you click any zip code on the map, a sidebar appears and displays the raw data (e.g., "Poverty Rate: 0.25", "Inactivity: 0.30") for that specific area. This entire interaction happens instantly, with no loading spinner, as it's all client-side.

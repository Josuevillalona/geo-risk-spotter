## Current Task: Phase 1 - Sprint 1.2: The "Shapes on the Map" Slice

### Objective
Validate the geospatial data pipeline by rendering the geographic boundaries on the map. This confirms your shapefile is valid and can be processed and displayed by React-Leaflet.

### Context
We have successfully completed Sprint 1.1, which involved setting up the basic React project, installing dependencies, creating a Map component, rendering a map with OpenStreetMap tiles, setting up a GitHub repository, and connecting to Vercel.

### Next Steps
1. Data Prep: Download the ZCTA shapefile for your target state.
2. Scripting: Write a simple Python script using geopandas to read the shapefile and export it as a GeoJSON file (shapes.geojson). This file should contain only the geometry and the ZCTA code for each feature.
3. Frontend: Place shapes.geojson into your React project's /public directory.
4. Frontend: In your Map.jsx component, add a `<GeoJSON>` layer that loads shapes.geojson.

### Success Criteria
The live Vercel application now shows the uncolored outlines of all zip codes in your target state overlaid on the base map.

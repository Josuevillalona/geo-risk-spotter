## Current Task: Phase 1 - Sprint 1.3: The "Single-Metric Choropleth" Slice

### Objective
Validate the core data-join and visualization logic. This proves you can link health data to the geographic shapes and represent it meaningfully with color.

### Context
We have successfully completed Sprint 1.2, which involved processing the shapefile, adding the GeoJSON layer to the map component, configuring the application to fetch the minified GeoJSON data (`ny_new_york_zip_codes_geo.min.json`) from the public directory, and adding basic styling to make the zip code outlines visible. We also removed the conflicting local `shapes.geojson` file from the project root.

### Next Steps
1. Data Prep: Download the health indicator data (e.g., PLACES CSV).
2. Scripting: Update your Python script. Use pandas to read the CSV and geopandas to join it with your shapefile on the ZCTA code.
3. Scripting: Create and add a single, calculated RiskScore property to each feature in the GeoJSON.
4. Frontend: Update the `<GeoJSON>` component's style prop. Write a function that takes a feature as input and returns a fill color based on its RiskScore value.

### Success Criteria
The map on the live Vercel application is now a choropleth map. Each zip code is color-coded, clearly visualizing high- and low-risk areas based on your calculated score.

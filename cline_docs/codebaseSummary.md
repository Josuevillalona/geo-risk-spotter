## Codebase Summary

### Key Components and Their Interactions
- **App.jsx:** The main application component that renders the Map component.
- **Map.jsx:** Renders the interactive map using React-Leaflet. Fetches GeoJSON data for zip code boundaries and displays them as a GeoJSON layer.

### Data Flow
- The application fetches the minified New York zip code GeoJSON data (`ny_new_york_zip_codes_geo.min.json`) from the `/public` directory.
- The fetched GeoJSON data is stored in the `Map` component's state.
- The `GeoJSON` component in `Map.jsx` uses the fetched data to render the zip code boundaries on the map.

### External Dependencies
- **React:** Frontend JavaScript library.
- **React-Leaflet:** React components for Leaflet maps.
- **Leaflet:** JavaScript library for interactive maps.
- **Axios:** (Not currently used, but planned for future data fetching)
- **Tailwind CSS:** (Planned for styling)

### Recent Significant Changes
- Initial project setup with Vite and React.
- Added Map component with OpenStreetMap tiles.
- Integrated minified New York zip code GeoJSON data (`ny_new_york_zip_codes_geo.min.json`) fetched from the public directory.
- Added basic styling to the GeoJSON layer to make zip code outlines visible.
- Removed conflicting local `shapes.geojson` file from the project root.

### User Feedback Integration and Its Impact on Development
- User feedback on the map not displaying led to debugging the Vercel deployment and file serving issues.
- Based on user feedback and investigation, we switched from using a large, unminified GeoJSON file fetched from GitHub Raw to a smaller, minified GeoJSON file served from the public directory.
- Addressed Git LFS issues encountered with the large file.

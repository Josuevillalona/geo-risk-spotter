## Lessons Learned

## 2025-06-13 - GeoJSON File Serving Issues on Vercel

### Description
Encountered issues serving the `ny_new_york_zip_codes_health.geojson` file (approx. 49MB) from the `public` directory of the Vercel deployment. This resulted in a 404 error when the frontend attempted to fetch the file.

### Root Cause
Vercel's handling of larger static files in the `public` directory, potentially in combination with Git LFS, was unreliable for a file of this size in this project configuration.

### Solution
Switched to hosting the `ny_new_york_zip_codes_health.geojson` file on Amazon S3 and configured the S3 bucket for static website hosting. Updated the frontend to fetch the GeoJSON data directly from the public S3 object URL.

### Lessons Learned
Relying solely on Vercel's `public` directory for serving larger static assets may not be reliable. Dedicated static hosting solutions like Amazon S3 are more robust for this purpose.

## 2025-06-13 - CORS Error when Fetching from S3

### Description
After hosting the GeoJSON on S3, the Vercel application encountered a CORS error ("No 'Access-Control-Allow-Origin' header is present") when trying to fetch the file.

### Root Cause
The S3 bucket's default configuration did not include a CORS policy that allowed requests from the Vercel deployment's origin (`https://geo-risk-spotter.vercel.app`).

### Solution
Added a CORS policy to the S3 bucket permissions allowing GET requests from the Vercel application's origin.

### Lessons Learned
When fetching resources from a different domain (like S3) in a web application, ensure the resource's host is configured with a CORS policy that permits requests from the application's origin.

## 2025-06-13 - Choropleth Map Displaying Only One Color

### Description
After implementing the choropleth map with the calculated RiskScore, the entire map appeared red, indicating all zip codes were falling into the highest risk category.

### Root Cause
The color ranges defined in the `getRiskScoreColor` function in `src/Map.jsx` were designed for a score range of 0-0.6, while the actual calculated RiskScores ranged from 0 to over 30.

### Solution
Analyzed the distribution of the calculated RiskScores using Python script statistics (min, max, mean, quartiles). Updated the `getRiskScoreColor` function with new color ranges and a green-yellow-red scheme that better matched the actual range and distribution of the RiskScores.

### Lessons Learned
Ensure that the data ranges used for visualization (e.g., color scales in a choropleth map) accurately reflect the actual range and distribution of the data being visualized. Use data statistics to inform the design of visualization scales.

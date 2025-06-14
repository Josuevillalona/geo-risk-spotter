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

## 2025-06-13 - Vercel Build Failure due to Duplicate Imports

### Description
The Vercel build failed with an error indicating that the symbol "Map" had already been declared in `src/App.jsx`.

### Root Cause
A previous `replace_in_file` operation on `src/App.jsx` resulted in duplicate import statements for `React`, `useState`, and `Map`.

### Solution
Modified `src/App.jsx` using `replace_in_file` to remove the duplicate import statements.

### Lessons Learned
When using `replace_in_file`, carefully craft SEARCH blocks to avoid unintentionally duplicating existing code, especially import statements. Always review the `final_file_content` after using file modification tools to catch such errors early.

## 2025-06-13 - Unresolved Food Insecurity Data Discrepancy

### Description
Observed that "Food Insecurity Crude Prevalence" consistently displays as 0% in the frontend sidebar for all clicked zip codes, despite the original CSV containing non-zero values for this metric.

### Status
Unresolved.

### Investigation
- Python script correctly includes and processes the `FOODINSECU_CrudePrev` column and applies `fillna(0)`.
- Sample output from the Python script shows `FOODINSECU_CrudePrev` as 0.0 for sample features.
- Frontend console output of fetched GeoJSON data shows that the `FOODINSECU_CrudePrev` property is missing from the `properties` object received by the frontend.
- Discrepancy exists between Python script's internal state and the data received by the frontend.

### Potential Next Steps
- Further investigate the GeoJSON export process in the Python script to ensure all properties are being written correctly.
- Examine the original CSV data more thoroughly for the specific New York zip codes to confirm if the data is truly missing or zero for this column in that subset.
- Explore potential limitations or behaviors of `geopandas.to_file` or the GeoJSON format itself regarding how properties are handled.

## 2025-06-14 - Troubleshooting Backend Environment Variable Loading

### Description
Encountered issues with the backend not loading the `OPENROUTER_API_KEY` from the `.env` file when running locally using `uvicorn --app-dir .`.

### Root Cause
The `load_dotenv()` function by default looks for `.env` in the current working directory or its parents. When running with `--app-dir .` from the project root, it was not finding the `.env` file located in the `backend/` subdirectory.

### Solution
Modified the `load_dotenv()` call in `backend/main.py` to explicitly specify the path to the `.env` file: `load_dotenv('backend/.env')`.

### Lessons Learned
When using `python-dotenv` and running a Python application from a different working directory than where the `.env` file is located, explicitly provide the path to the `.env` file in the `load_dotenv()` call.

## 2025-06-14 - Troubleshooting Render Backend Deployment

### Description
Encountered multiple issues during backend deployment to Render, including "No such file or directory: 'requirements.txt'", "ModuleNotFoundError: No module named 'backend'", and service shutdown after startup.

### Root Cause
- Missing `requirements.txt` file for dependency installation on Render.
- Incorrect Uvicorn start command expecting `backend` as a top-level module even with "Root Directory" set to `backend/`.
- Potential issues with Uvicorn not correctly picking up the `$PORT` environment variable provided by Render.

### Solution
- Created a `backend/requirements.txt` file listing all Python dependencies.
- Set Render's "Root Directory" to `backend/`.
- Updated Render's "Build Command" to `pip install -r requirements.txt`.
- Updated Render's "Start Command" to `env PORT=$PORT uvicorn main:app --host 0.0.0.0 --port $PORT` to explicitly pass the port.

### Lessons Learned
- Always include a `requirements.txt` file for Python project deployments to ensure dependencies are installed correctly.
- Carefully configure the "Root Directory", "Build Command", and "Start Command" in deployment platforms like Render, ensuring they are compatible with the project structure and how the application is started.
- Explicitly passing environment variables like `$PORT` in the start command using `env` can help ensure they are correctly picked up by the application.

## 2025-06-14 - OpenRouter API Rate Limits

### Description
Encountered 429 Too Many Requests errors from the OpenRouter API when using the `google/gemini-2.0-flash-exp:free` model.

### Root Cause
The free tier of the `google/gemini-2.0-flash-exp:free` model on OpenRouter has strict rate limits, and these limits were being hit.

### Solution
Switched the AI model used in the backend to `mistralai/mistral-7b-instruct`, which may have different or less strict rate limits.

### Lessons Learned
Be aware of API rate limits, especially when using free tiers of external services. Have a strategy for handling rate limits (e.g., retries, switching models, upgrading plans).

## 2025-06-14 - Frontend Network Errors and Backend Accessibility

### Description
Initially encountered `net::ERR_INTERNET_DISCONNECTED` errors in the frontend when trying to call the deployed backend on Render.

### Root Cause
This was a client-side network connectivity issue preventing the frontend from reaching the Render URL.

### Solution
Troubleshooted local internet connection and confirmed accessibility of the Render URL directly in the browser.

### Lessons Learned
Network errors in the frontend console when calling a deployed backend often indicate a client-side network issue rather than a problem with the deployed service itself. Always verify network connectivity and try accessing the deployed service URL directly.

## 2025-06-14 - Frontend Component Structure and Data Display

### Description
Refactored the frontend component structure to use a `Dashboard` component and a tabbed `Sidebar` for displaying AI insights and raw data. Initially had confusion regarding where raw data was being displayed (sidebar vs. popover).

### Root Cause
The frontend structure evolved with the introduction of new components and a tabbed interface in the sidebar, changing how raw data and AI insights are presented compared to earlier iterations. The `DataPopover` component, initially intended for raw data on the map, became redundant with the tabbed sidebar.

### Solution
- Updated `src/App.jsx` to render the `Dashboard` component and pass state down.
- Updated `src/components/Dashboard.jsx` to render the `Map` and the top-level `src/Sidebar.jsx`.
- Updated the top-level `src/Sidebar.jsx` to implement the tabbed interface and render raw data as a table.
- Modified `src/Map.jsx` to remove `DataPopover` control logic and `layer.bindPopup`.
- Removed the `src/DataPopover.jsx` component.

### Lessons Learned
Maintain clear documentation of the frontend component structure and data flow as the project evolves to avoid confusion. Regularly review and refactor components to ensure a clear separation of concerns and avoid redundant functionality.

## 2025-06-14 - Browser Tool Failure

### Description
Encountered a persistent error ("Protocol error (Page.captureScreenshot): Not attached to an active page") when attempting to use the `browser_action` tool to launch the application in a browser.

### Root Cause
The root cause of this issue is currently unknown. It appears to be an environment-specific problem with the browser tool.

### Solution
Unable to resolve the issue with the browser tool. Proceeded with the task based on code analysis and updated documentation to reflect the completed task and the tool failure.

### Lessons Learned
Be aware that tool failures can occur. When a tool is consistently failing and preventing verification, proceed with the task based on available information (e.g., code analysis) and document the tool failure.

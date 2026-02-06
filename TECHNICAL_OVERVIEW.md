# RiskPulse Technical Overview

This document provides a deep dive into the technical architecture, data flow, and AI implementation of the RiskPulse platform.

## 🏗️ High-Level Architecture

RiskPulse follows a decoupled client-server architecture:

```mermaid
graph TD
    User[User] -->|Interacts| Client[React Frontend (Vite)]
    Client -->|Map Tiles| OSM[OpenStreetMap]
    Client -->|GeoJSON Data| S3[AWS S3 Bucket]
    Client -->|API Calls (Analysis/Chat)| Server[FastAPI Backend]
    
    subgraph "Backend Services"
        Server -->|Embed/Search| VectorDB[ChromaDB]
        Server -->|Inference| LLM[OpenRouter API]
    end
```

## 🔄 Data Architecture & Flow

### 1. Geospatial Data Handling (Optimized for Web)
To maintain performance and keep the repository light, large geospatial datasets are hosted externally.
-   **Source**: `ny_new_york_zip_codes_health.geojson` (~48MB)
-   **Storage**: Hosted on AWS S3 (`https://geo-risk-spotspot-geojson.s3.us-east-1.amazonaws.com/...`)
-   **Loading**: The `boroughService.js` fetches this file on initial load.
-   **Caching**: Data is cached in `localStorage` to prevent redundant network requests and enable offline capability for subsequent sessions.

### 2. Health Data Aggregation
Leaflet features are hydrated with health properties:
-   **Risk Score**: Calculated composite metric (Diabetes + Obesity + Inactivity + Hypertension).
-   **Aggregation**: Zip code level data is dynamically aggregated to provide Borough-level averages on the fly.

## 🧠 AI & RAG Implementation

The core intelligence of RiskPulse is powered by a **Retrieval-Augmented Generation (RAG)** pipeline.

### The Pipeline
1.  **Ingestion**: Domain knowledge (intervention strategies, health guidelines) is chunked and embedded using `sentence-transformers/all-MiniLM-L6-v2`.
2.  **Storage**: Embeddings are stored in a local **ChromaDB** instance (`/backend/chroma_db`).
3.  **Retrieval**:
    -   When a user asks "What can we do about obesity in Queens?", the query is embedded.
    -   ChromaDB returns the top K most relevant intervention documents.
4.  **Generation**:
    -   The system constructs a prompt containing:
        -   The User Query
        -   The Retrieved Context (Intervention docs)
        -   The Active Data Context (Selected Zip Code metrics)
    -   This prompt is sent to **OpenRouter** (Llama 3.2 or Phi-3).
5.  **Enhanced Response**: The LLM generates a response that is statistically grounded (using the data context) and evidence-based (using the retrieved docs).

### Backend `main.py` Flow
-   **`/api/chat`**: Standard endpoint for chat interactions.
-   **`/api/chat/enhanced`**: Context-aware endpoint that accepts current view state (Borough/Zip) to tailor responses.

## 📄 Evidence Builder (PDF Engine)

The reporting engine allows users to take analysis offline.
-   **Component**: `EvidenceBuilder.jsx` & `pdfGeneration.js`
-   **Process**:
    1.  **Data Collection**: Gathers current map interactions and statistics.
    2.  **AI Summary**: If not already generated, triggers a real-time background call to the LLM to write an executive summary.
    3.  **Rendering**: Uses `jsPDF` to programmatically draw the report (not just a screenshot).
    4.  **Download**: Delivers a structured PDF directly to the user's client.

## 🔒 Security & Deployment
-   **API Keys**: Managed via `.env` (excluded from git).
-   **CORS**: Configured to allow requests from the frontend domain.
-   **Render Config**:
    -   Frontend: Static Site build (`npm calculate build`).
    -   Backend: Python Web Service (`uvicorn main:app`).

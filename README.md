# RiskPulse: NYC Diabetes Risk Intelligence

**RiskPulse** is an advanced public health analytics platform designed to identify diabetes risk hotspots across New York City. By combining granular geospatial data with AI-powered analysis, it empowers public health officials and community planners to target interventions where they are needed most.

![RiskPulse App Screenshot](./public/screenshot.png) *(Note: Add a screenshot here if available)*

## 🚀 Key Features

*   **Interactive Risk Map**: Visualize diabetes risk scores, obesity rates, and healthcare gaps at the Zip Code and Borough level using Leaflet & GeoJSON.
*   **AI-Powered Intelligence**: Integrated RAG (Retrieval-Augmented Generation) chatbot that analyzes health data to provide actionable insights and contextual explanations.
*   **Evidence Package Builder**: Automatically generates professional PDF reports for grant applications and stakeholder presentations, complete with AI-generated executive summaries.
*   **Neighborhood Comparison**: Compare health metrics between different areas to identify disparities and outliers.
*   **Intervention Matching**: Recommends evidence-based public health interventions tailored to the specific risk profile of a selected community.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: CSS Modules, Modern Dashboard UI
*   **Mapping**: React Leaflet, Leaflet.js
*   **State Management**: Custom Store (Context/Hooks)
*   **PDF Generation**: jsPDF, html2canvas

### Backend
*   **API**: Python (FastAPI)
*   **AI Model**: OpenRouter (supporting Llama 3.2, Phi-3, etc.)
*   **Vector Database**: ChromaDB (for RAG)
*   **Embedding**: `all-MiniLM-L6-v2` (SentenceTransformer)
*   **Data Processing**: Pandas, NumPy

### Infrastructure
*   **Data Hosting**: AWS S3 (for large GeoJSON files)
*   **Deployment**: Render (Frontend & Backend)

## 🏁 Getting Started

### Prerequisites
*   Node.js (v16+)
*   Python (3.9+)

### 1. clone the repository
```bash
git clone https://github.com/yourusername/geo-risk-spotter.git
cd geo-risk-spotter
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Access the frontend at `http://localhost:5173`

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup Environment Variables
# Create a .env file in /backend with:
OPENROUTER_API_KEY=your_key_here

# Start API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📊 Data Sources
*   **Geospatial**: NYC Zip Code Tabulation Areas (ZCTAs) from S3 storage.
*   **Health Metrics**: CDC PLACES Data (Diabetes, Obesity, Smoking, etc.).
*   **Social Determinants**: Aggregated census data for food insecurity and healthcare access.

## 📄 License
MIT License

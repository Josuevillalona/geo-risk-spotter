## Project Context Guidelines

This document outlines project-specific context, goals, and constraints for the RiskPulse: Diabetes project, adhering to the Cline AI Development Framework principles.

### Project Overview
- **Name**: RiskPulse: Diabetes
- **Type**: Web App
- **Goals**:
  - Provide public health analysts with an interactive map to visually identify diabetes risk hotspots by zip code.
  - Allow deep exploration of the underlying data drivers through an AI-powered conversational interface.
  - Make complex geospatial health data accessible, interpretable, and actionable for resource planning.
- **Timeline**: 6-8 weeks for the complete 3-phase roadmap.
- **Complexity**: Starts as a Simple MVP, evolving to Medium complexity by Phase 3.

### Key Stakeholders and Requirements
- **Stakeholders**: Public health analysts, healthcare providers, policymakers.
- **Requirements**:
  - Interactive map displaying risk hotspots.
  - AI-powered conversational interface for data exploration.
  - Accessible and interpretable data visualizations.
  - Scalable data platform for national-scale datasets.

### Technical Architecture Overview
- **Frontend**: React (bootstrapped with Vite), React-Leaflet, Zustand (for chat state), Axios, and Tailwind CSS.
- **Backend**: Python with FastAPI and SQLAlchemy (for database interaction).
- **Database**: PostgreSQL with the PostGIS extension.
- **Deployment**: Vercel (Frontend), Render (Backend & PostgreSQL Database).
- **AI Layer**: OpenRouter (as the AI Layer API gateway), Git/GitHub for version control.

### Constraints
- **Timeline**: 6-8 weeks for the complete 3-phase roadmap.
- **Team Size**: Solo (Beginner)
- **Budget**: Limited (use cost-effective solutions).

### Adherence to Global Framework
- This project will adhere to the Cline AI Development Framework, emphasizing structured planning, methodical execution, and continuous documentation.
- Regular updates to `cline_docs/project-context.md`, `cline_docs/task-breakdown.md`, `cline_docs/progress-log.md`, and `cline_docs/lessons-learned.md` will be maintained.

### Example
- Ensure all data visualizations are accessible and interpretable by users with varying levels of technical expertise.

### Common Pitfalls
- Scope creep due to the addition of non-essential features.
- Neglecting documentation, leading to knowledge loss and maintainability issues.
- Underestimating the complexity of data integration and AI implementation.

### Actionable Guidelines for Cline
- Prioritize tasks based on the project's core goals and requirements.
- Maintain a clear and concise project context document.
- Regularly review and update the project context as the project evolves.

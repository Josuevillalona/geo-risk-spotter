## Coding Standards Guidelines

This document outlines project-specific coding standards for the Geospatial Risk Hotspot project, adhering to the Cline AI Development Framework principles.

### General Principles
- **Readability**: Code should be easy to understand and maintain.
- **Consistency**: Follow consistent naming conventions, formatting, and architectural patterns.
- **Modularity**: Break down code into small, reusable components.
- **Error Handling**: Implement comprehensive error handling with user-friendly messages.

### Tech Stack Specific Standards
- **React (Frontend)**:
  - **Component Structure**: Use functional components with hooks for state management and side effects.
  - **State Management**: Utilize Zustand for global state management. Keep component-level state local whenever possible.
  - **Styling**: Use Tailwind CSS for styling. Follow a consistent naming convention for CSS classes.
  - **Data Fetching**: Use Axios for making API requests. Handle errors gracefully.
  - **File Structure**: Organize components into logical directories based on their functionality.
- **Python/FastAPI (Backend)**:
  - **API Design**: Follow RESTful API principles. Use Pydantic for request and response validation.
  - **Database Interaction**: Use SQLAlchemy for interacting with the PostgreSQL database.
  - **Error Handling**: Implement exception handling for database operations and API calls.
  - **Code Formatting**: Follow PEP 8 guidelines for code formatting.
  - **File Structure**: Organize code into modules based on functionality (e.g., `models.py`, `routes.py`, `database.py`).
- **PostgreSQL/PostGIS (Database)**:
  - **Schema Design**: Design a clear and efficient database schema.
  - **Data Types**: Use appropriate data types for each column.
  - **Indexing**: Create indexes to optimize query performance.
  - **Spatial Queries**: Use PostGIS functions for performing spatial queries.

### Example (React Component)
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store';

const MapComponent = () => {
  const [data, setData] = useState([]);
  const apiUrl = useStore((state) => state.apiUrl);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiUrl + '/data');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [apiUrl]);

  return (
    <div>
      {/* Map rendering logic here */}
    </div>
  );
};

export default MapComponent;
```

### Common Pitfalls
- **Inconsistent Code Style**: Failing to follow consistent coding conventions.
- **Lack of Error Handling**: Neglecting to handle errors gracefully.
- **Overly Complex Components**: Creating components that are too large and difficult to maintain.
- **Inefficient Database Queries**: Writing inefficient database queries that impact performance.

### Actionable Guidelines for Cline
- Follow the coding standards outlined in this document.
- Write clean, readable code with meaningful variable names.
- Implement comprehensive error handling with user-friendly messages.
- Break down code into small, reusable components.
- Optimize database queries for performance.

## Documentation Requirements Guidelines

This document outlines project-specific documentation standards for the Geospatial Risk Hotspot project, adhering to the Cline AI Development Framework principles.

### General Principles
- **Comprehensive**: Document all critical aspects of the project, including architecture, code, testing, and deployment.
- **Accessible**: Write documentation that is easy to understand and navigate.
- **Up-to-Date**: Keep documentation current with the latest changes to the project.

### Documentation Areas
- **Project Context (cline_docs/project-context.md)**:
  - **Purpose**: Provide a high-level overview of the project, including its goals, stakeholders, and requirements.
  - **Content**: Background and motivation, success criteria and constraints, key stakeholders and requirements, technical architecture overview.
- **Task Breakdown (cline_docs/task-breakdown.md)**:
  - **Purpose**: Break down the project into smaller, manageable tasks with clear success criteria.
  - **Content**: High-level phases, specific tasks with clear success criteria, dependencies and prerequisites, risk assessment and mitigation.
- **Progress Log (cline_docs/progress-log.md)**:
  - **Purpose**: Track progress on the project, including tasks completed, issues encountered, and lessons learned.
  - **Content**: Date, task name, objective, approach, implementation, tests/validation, status, next steps.
- **Lessons Learned (cline_docs/lessons-learned.md)**:
  - **Purpose**: Document common errors and their solutions, useful code patterns, and debugging strategies.
  - **Content**: Common errors and their solutions, useful code patterns and snippets, library versions and configurations that work, debugging strategies that proved effective, performance optimizations discovered.
- **Codebase Summary (cline_docs/codebaseSummary.md)**:
  - **Purpose**: Provide a concise overview of the project structure and recent changes.
  - **Content**: Key Components and Their Interactions, Data Flow, External Dependencies (including detailed management of libraries, APIs, etc.), Recent Significant Changes, User Feedback Integration and Its Impact on Development

### Documentation Templates
- **Progress Log Entry**:
```
## [DATE] - [TASK NAME]

### Objective
What we're trying to accomplish

### Approach
How we plan to solve it

### Implementation
What was actually done

### Tests/Validation
How we verified it works

### Status
- [ ] In Progress
- [x] Complete
- [ ] Blocked (reason)

### Next Steps
What comes next
```
- **Lessons Learned Entry**:
```
## [Date] - [Issue]

### Description
Detailed description of the issue encountered.

### Root Cause
Explanation of the underlying cause of the problem.

### Solution
Steps taken to resolve the issue.

### Lessons Learned
Key takeaways and preventive measures for the future.
```

### Actionable Guidelines for Cline
- Maintain comprehensive and up-to-date documentation for all aspects of the project.
- Use the provided templates for progress logs and lessons learned.
- Ensure that documentation is accessible and easy to understand.
- Regularly review and update documentation as the project evolves.

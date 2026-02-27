# Phase 2: Project Management Core

## Objective
Enable researchers to create new projects and view the project details (entries list, pagination, filters). Implement specific delete confirmation modals for projects/entries.

## Discussion Points

1. **Delete Confirmation Modals**
   - The ROADMAP mentions "specific delete confirmation modals". Are these standard modals (e.g., "Are you sure you want to delete X?"), or do they require specific user actions like typing the project name to confirm deletion to prevent accidental data loss?
   
2. **Project View Filtering**
   - The project details view mentions "filters". Are there specific fields we should filter by in this mock phase (e.g., model used, behavior targeted, status), or just a generic text search over the entry contents/metadata?

3. **New Project Setup Data**
   - Are `name` and `description` sufficient for creating a project? Does creating a new project require selecting specific ML models or Target Behaviors at creation time, or is that defined later per-entry?

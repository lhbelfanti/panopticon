# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0

## Must-Haves (from SPEC)
- [ ] Users can login and access a Welcome Dashboard.
- [ ] Users can create a new project and add entries (tweets) manually or via bulk upload.
- [ ] Users can trigger the async prediction process and view progress.
- [ ] Users can view detailed prediction results in a modal with graphs and insights.
- [ ] The app matches the design expectations set by the defined color palette and Stitch mockups.

## Phases

### Phase 1: Foundation & Navigation
**Status**: ✅ Completed
**Objective**: Build the core layout, login screen, welcome dashboard, and global navigation sidebar with project listings.
**Requirements**: Authentication, Sidebar layout, Welcome screen activity summaries.

### Phase 2: Project Management Core
**Status**: ✅ Completed
**Objective**: Enable researchers to create new projects and view the project details (entries list, pagination, filters). Implement specific delete confirmation modals for projects/entries.
**Requirements**: New Project setup, Project View dashboard, Delete Confirmation Modal.

### Phase 3: Entry Ingestion
**Status**: ✅ Completed
**Objective**: Develop the interface for adding new entries to an existing project (single manual input and bulk CSV upload), including selecting models and behaviors to track. Also includes the single entry detailed view modal.
**Requirements**: New Entry logic, tabs for bulk/single, form validation, Detalle de Entrada Modal.

### Phase 4: Analysis & History
**Status**: ✅ Complete
**Objective**: Develop the analysis infrastructure for subprojects. This includes asynchronous triggering of analysis runs (post-prediction), maintaining a history of runs with status tracking, and generating PDF reports that tell a data-driven story with charts.
**Requirements**: Analysis triggering with exception criteria, Analysis History UI, Per-subproject insights, PDF export functionality.

### Phase 5: Containerization
**Status**: ✅ Complete
**Objective**: Dockerize the application as defined in the requirements.
**Requirements**: Multi-stage `Dockerfile`, `.dockerignore`, `compose.yml` for integration setup.
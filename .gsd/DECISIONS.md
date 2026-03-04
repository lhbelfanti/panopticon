# Architecture & Technical Decisions

## Phase 1
- **Mock Services**: Stateful In-Memory Mocks (for realistic latency and state preservation during dev).
- **Table Implementation**: Custom Build (for UI flexibility).
- **Forms**: Native HTML5 + React State (no heavy validation libraries).
- **Stitch Mockup Alignment (Gap Closure)**:
  - **Approach**: Iterative refactoring (Option A) of existing routes (`_index.tsx`, `login._index.tsx`, `Sidebar`).
  - **Sidebar Content**: "Home", "Quick Actions", "Your Projects" (with hierarchical icons), collapse toggle, and User Info/Logout at the bottom. Exclude non-MVP items from mockups.
  - **Dashboard Data**: Mimic the "Remaining Tokens" progress bar structure from the Stitch mockups using the `summary.remainingTokens` data.
  - **Responsiveness**: Focus purely on Desktop sizes; no mobile layouts required.

## AD-004: Analysis Route Path Refinement

**Status:** Accepted
**Date:** 2026-03-04
**Context:** Initial plan called for `projects.$id.subprojects.$subId.analysis.tsx`. Implementation used `projects.$id.models.$modelId.analysis.tsx`.
**Decision:** We aligned on `models.$modelId` for internal consistency with the project structure where subprojects are defined by their model identifiers.
**Consequences:** Improved path readability and consistency with child pages like `entries.tsx`.

## Phase 2
- **Delete Modals**: Standard UI modals (no typing confirmation required).
- **Project Filtering**: Column-based filters on the Project View table.
- **Projects & Models Architecture**: "Subproject" methodology. A parent Project defines the Target Behavior(s), and contains Subprojects for each selected ML Model.

## Phase 4: Analysis & History
- **Analysis vs. Prediction**: Analysis is post-prediction per subproject. It derives insights from model labels/scores.
- **Scope**: Analysis is executed within the scope of a specific **Subproject (Model)**.
- **Concurrency**: Supports multiple analysis runs per subproject.
- **Persistence**: Results are stored in the server-side mock to enable an **Analysis History**.
- **Reporting**: Export format is exclusively **PDF**, generated on-the-fly from historical analysis data.
- **Triggering**: Entire project-level trigger with optional exclusion criteria.
- **Methodology**: Asynchronous refresh state management.

### Phase 4 UI & Interaction
- **Analysis Access**: A dedicated "Analysis" screen accessible from the Subproject view.
- **Screen Layout**: Two tabs: "New Analysis" (for configuration and triggering) and "History" (list of past runs).
- **Exclusion Logic**: Integrated into the `EntriesTable` via an "Exclude entries" mode. Toggles a checkbox column; checked = included, unchecked = excluded. Researchers use existing table filters to handle selection in bulk.
- **PDF Generation**: Async frontend generation using `jspdf` or similar, pulling data from the subproject analysis results.

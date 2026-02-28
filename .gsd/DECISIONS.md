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

## Phase 2
- **Delete Modals**: Standard UI modals (no typing confirmation required).
- **Project Filtering**: Column-based filters on the Project View table.
- **Projects & Models Architecture**: "Subproject" methodology. A parent Project defines the Target Behavior(s), and contains Subprojects for each selected ML Model.

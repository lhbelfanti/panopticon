# Architecture & Technical Decisions

## Phase 1
- **Mock Services**: Stateful In-Memory Mocks (for realistic latency and state preservation during dev).
- **Table Implementation**: Custom Build (for UI flexibility).
- **Forms**: Native HTML5 + React State (no heavy validation libraries).

## Phase 2
- **Delete Modals**: Standard UI modals (no typing confirmation required).
- **Project Filtering**: Column-based filters on the Project View table.
- **Projects & Models Architecture**: "Subproject" methodology. A parent Project defines the Target Behavior(s), and contains Subprojects for each selected ML Model.

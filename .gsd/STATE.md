## Current Position
- **Current Phase:**
    - [x] Fix accessibility to new analysis screen <!-- id: 18 -->
    - [x] Reposition analysis tabs (New/History) to centered content area <!-- id: 19 -->
    - [x] Refine analysis button UI (integrated status, text size, single line) <!-- id: 20 -->
    - [x] Apply sentence-case capitalization across all analysis text <!-- id: 21 -->
    - [x] Make history actions always visible <!-- id: 22 -->
    - [x] Verify all analysis tests pass <!-- id: 23 -->
    - [x] Move version number to sidebar footer <!-- id: 24 -->
    - [x] Implement dynamic, translated recent activity messages <!-- id: 25 -->
    - [x] Phase 5: Project Management - Project Settings, UI reorganization, and validation refinement
    - [x] Implement Project Settings (Edit Project)
    - [x] Move New Entry button to FAB
    - [x] Enforce model availability/intersection validation
    - [x] Enforce behavior compatibility in edit mode
    - [x] Relocate Predict button to table footer
    - [x] Add login check and redirect on main dashboard
    - [x] Store userId in session cookie
    - [x] Make Sidebar Logo a link to Dashboard Home
- **Status:** Phase 4 (Analysis & History) fully verified and tested. Phase 5 Project Management features complete. Added Dashboard Login redirect and userId session extension. Sidebar Logo is now a home link.

## Current Position
- **Phase**: 6 (completed)
- **Task**: 6-01-PLAN.md — Write ENDPOINTS.md
- **Status**: Verified and committed (bb0295c)

## Last Session Summary
Phase 6 Plan 01 executed successfully. Created ENDPOINTS.md (859 lines) at project root covering all 25 endpoints across 8 domains (Auth, Users, Config, Projects, Entries, Predictions, Analysis, Dashboard). Documented security ownership chain, type definitions, pagination/error patterns, and all 9 research gaps with recommended resolutions.

## Next Steps
1. Phase 6 complete — ENDPOINTS.md ready for backend team.

## Accumulated Context

### Roadmap Evolution
- Phase 6 added: Endpoints — audit all frontend API calls and produce a complete RESTful endpoint specification (ENDPOINTS.md) for backend development, including security analysis for user-scoped data access.

### Decisions Made (Phase 6)
- Use /v1 suffix at end of URL path (e.g. GET /projects/v1), not as a prefix
- Numeric subprojectId is the canonical path param for entries, predictions, analysis — not model name string
- Backend auto-creates one subproject per model on project creation; no separate POST subprojects endpoint initially
- PATCH /projects/{id}/v1 treats behaviors and models as full replacements (not additive)
- Export endpoint is dedicated (text/csv stream), not a variant of the JSON entries list
- Dashboard endpoints derive userId from JWT, never accept it as a request param
- Config endpoints require Authorization by default; team to revisit if registration form needs them before login (Gap 8)

**Status**: Active (updated 2026-03-10)

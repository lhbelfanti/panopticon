---
phase: 6-endpoints
plan: 01
subsystem: api
tags: [rest, endpoints, specification, bff, jwt, security]

# Dependency graph
requires: []
provides:
  - ENDPOINTS.md at project root — complete RESTful API specification for backend development
  - 25 endpoints across 8 domains (Auth, Users, Config, Projects, Entries, Predictions, Analysis, Dashboard)
  - Security ownership checklist for all non-auth endpoints
  - 9 design gaps documented with recommended resolutions
affects: [backend-implementation, bff-updates]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "/v1 suffix at end of URL path (not prefix)"
    - "BFF pattern: loaders/actions call backend; browser never calls backend directly"
    - "Pagination envelope: { data, total, page, limit, totalPages }"
    - "Error envelope: { error: { code, message } }"
    - "Numeric subprojectId as canonical path param (not model name string)"

key-files:
  created:
    - ENDPOINTS.md
  modified: []

key-decisions:
  - "Use /v1 suffix at end of URL path, not as a prefix (e.g. GET /projects/v1)"
  - "Numeric subprojectId is the canonical path param for entries, predictions, and analysis endpoints — not model name string"
  - "Backend auto-creates one subproject per model on project creation; no separate POST subprojects endpoint needed initially"
  - "PATCH /projects/{id}/v1 treats behaviors and models arrays as full replacements, not additive"
  - "Export endpoint is a dedicated endpoint (text/csv stream), not a variant of the JSON entries list"
  - "Dashboard endpoints derive userId from JWT; never accept userId in request params"
  - "Config endpoints (behaviors, platforms) require Authorization by default — team to revisit if registration form needs them before login"

patterns-established:
  - "All list endpoints use pagination envelope: { data[], total, page, limit, totalPages }"
  - "Entry filter params: filterCol, filterVal, filterOp, filterBias"
  - "409 Conflict for duplicate in-progress runs (predictions, analysis)"
  - "204 No Content for delete and logout endpoints"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-03-10
---

# Phase 6 Plan 01: Endpoints Summary

**25-endpoint RESTful specification across Auth, Users, Config, Projects, Entries, Predictions, Analysis, and Dashboard domains with security ownership chain and all 9 research gaps resolved**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-10T12:40:06Z
- **Completed:** 2026-03-10T12:42:13Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created ENDPOINTS.md (859 lines) covering all 25 endpoints across 8 domains
- Documented per-endpoint: screen, resource, verb, path params, query params, request body, headers, and response shapes
- Established security ownership checklist mapping every non-auth endpoint to its JWT verification requirement
- Resolved all 9 research gaps with concrete recommended resolutions (or team decision flags for gaps 1 and 8)
- Defined canonical type definitions: TargetBehavior, MLModel, EntryVerdict, PredictionRunStatus, AnalysisStatus, SocialMediaType, TwitterMetadata, AnalysisResult

## Task Commits

1. **Task 1: Write ENDPOINTS.md** - `bb0295c` (docs)

**Plan metadata:** (included in final docs commit)

## Files Created/Modified
- `/Users/lhbelfanti/workspace/github/panopticon/ENDPOINTS.md` — Complete RESTful API specification for the Panopticon backend

## Decisions Made
- `/v1` suffix at end of URL path (e.g. `GET /projects/v1`), not as a prefix — per phase requirements
- Numeric `subprojectId` is the canonical path param for entries/predictions/analysis, not model name string — more stable and RESTful
- Backend auto-creates one subproject per model on project creation; no separate POST subprojects endpoint needed initially
- PATCH /projects/{id}/v1 treats `behaviors` and `models` as full replacements; additive-only behavior stays in BFF if needed
- Export is a dedicated endpoint returning CSV stream, not a variant of the JSON list endpoint
- Dashboard endpoints always derive userId from JWT, never accept it as a request param
- Config endpoints require Authorization by default; flagged as a team decision if public access is needed

## Deviations from Plan

None — plan executed exactly as written. All required information was available in RESEARCH.md.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness
- ENDPOINTS.md is ready for backend team consumption
- BFF layer will need updating: resolve model slug → numeric subprojectId before calling entries/predictions/analysis endpoints
- Team decision needed on config endpoint auth (Gap 8) before finalizing backend auth middleware scope

---
*Phase: 6-endpoints*
*Completed: 2026-03-10*

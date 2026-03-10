---
phase: 6-endpoints
verified: 2026-03-10T00:00:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
---

# Phase 6: Endpoints Verification Report

**Phase Goal:** Audit all frontend API calls to produce a complete, RESTful endpoint specification (ENDPOINTS.md) for backend development, including security analysis for user-scoped data access.
**Verified:** 2026-03-10
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | ENDPOINTS.md exists at project root and is complete enough for a backend developer to implement every endpoint without reading frontend code | VERIFIED | File exists at `/ENDPOINTS.md`, 859 lines, all 8 domains present with full per-endpoint specs |
| 2 | Every mocked API call found in the research audit maps to exactly one documented endpoint | VERIFIED | 24 endpoints in ENDPOINTS.md; all 22 distinct service functions from RESEARCH.md map to documented endpoints (export split into dedicated endpoint per Gap 6; predictPendingEntries maps to POST predictions endpoint) |
| 3 | Every endpoint has screen, HTTP verb, versioned URL, path params, query params, request body, headers, and response shapes documented | VERIFIED | All 24 H3 sections have `**Screen:**`, `**Resource:**`, param tables (or explicit "No params" prose), `**Headers:**`, and `**Response:**` with status codes |
| 4 | The security model is documented — ownership chain, which endpoints require Authorization header, and what the backend must verify per resource | VERIFIED | Resource Ownership Chain section present; Security Checklist table covers all 13 non-auth resource rows; every endpoint documents Authorization requirement |
| 5 | The identified gaps and design decisions are surfaced with recommended resolutions so the backend team does not encounter ambiguity | VERIFIED | All 9 gaps from RESEARCH.md are addressed in the Design Decisions section; Gap 8 correctly marked "Requires team decision" |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `ENDPOINTS.md` | Complete RESTful endpoint specification — Auth, Users, Config, Projects, Entries, Predictions, Analysis, Dashboard domains | VERIFIED | 859 lines; 24 endpoints across all 8 domains; all sections present |

---

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `ENDPOINTS.md#entries` | subprojectId resolution | Gap 2 and Gap 3 documentation | WIRED | Design note on `GET /projects/{id}/subprojects/{subprojectId}/entries/v1` explicitly states BFF must resolve model slug to numeric subprojectId; Gap 2 and Gap 3 in Design Decisions section provide full context |
| `ENDPOINTS.md#security` | Authorization header requirement | Per-endpoint header table | WIRED | All 24 endpoints have explicit `**Headers:**` section; auth endpoints say "not required"; all others say "required". Security Checklist table maps every resource to its ownership check |

---

### Requirements Coverage

| Requirement | Status | Evidence |
|---|---|---|
| RESTful conventions with /v1 suffix (not /api/v1 prefix) | SATISFIED | Overview section explicitly states the convention; all 24 endpoints end with `/v1`; zero endpoints use `/api/v1` prefix |
| Per-endpoint documentation: screen, resource, verb, path params, query params, body, headers, response | SATISFIED | All 24 H3 sections have Screen (24/24), Resource (24/24), verb+path in code block, param tables, Headers section, Response section |
| Security analysis for user-scoped data access | SATISFIED | Resource Ownership Chain section; Security Checklist with 13-row table; Authorization: Bearer documented per endpoint; Gap 7 resolves implicit userId scoping |
| Resource relationship mapping | SATISFIED | ASCII tree in Resource Ownership Chain section: User > Projects > Subprojects > Entries > PredictionRuns / AnalysisRuns; plus the GET /projects sidebar lightweight projection design note |
| Deliverable: ENDPOINTS.md at project root | SATISFIED | File confirmed at `/Users/lhbelfanti/workspace/github/panopticon/ENDPOINTS.md` |

---

### Anti-Patterns Found

| File | Issue | Severity | Impact |
|---|---|---|---|
| `ENDPOINTS.md` — Security Checklist (line 819) | `GET /projects/{id}/subprojects/v1` is listed in the security checklist table but has no corresponding H3 endpoint section and no frontend service function calls it. Gap 1 discussion in Design Decisions explicitly says "There is no separate POST /projects/{id}/subprojects/v1 endpoint." The GET variant is equally undocumented. | Info | No functional gap — the backend team will not implement an endpoint that the frontend never calls. However, the security checklist row implies this endpoint exists, which may cause confusion. The row is a copy from RESEARCH.md's security matrix and represents a forward-looking consideration, not a current service call. |
| `6-01-SUMMARY.md` | Summary claims "25 endpoints" but ENDPOINTS.md contains 24 H3 sections. The discrepancy is one: the undocumented `GET /projects/{id}/subprojects/v1` was counted in the PLAN's inventory but correctly omitted from ENDPOINTS.md because no frontend function calls it. | Info | Documentation inconsistency only. The actual ENDPOINTS.md is correct and internally consistent with the frontend audit. |

---

### Human Verification Required

None. This phase delivers a static documentation artifact (ENDPOINTS.md). All verification is programmatic.

---

### Gaps Summary

No gaps blocking goal achievement. Phase 6 fully achieves its goal.

The two anti-pattern notes above are informational inconsistencies, not blockers:

1. The security checklist row for `GET /projects/{id}/subprojects/v1` is harmless — it appears in RESEARCH.md's scope-check matrix (which was copied verbatim per plan instructions) and represents a theoretical future endpoint, not a current one. The absence of an H3 section for it is correct behavior since no frontend service function calls it.

2. The "25 endpoints" claim in SUMMARY.md is a minor documentation error (should be 24). The ENDPOINTS.md itself is accurate.

Both are inconsequential for the stated goal: a backend developer can open ENDPOINTS.md and implement every endpoint without reading frontend code. The document is unambiguous about which endpoints exist (24 H3 sections) and which are design decisions (Gap 1 discussion).

---

### Endpoint Coverage Cross-Check

Research inventory service functions and their ENDPOINTS.md mapping:

| Domain | Service Function | Maps To | Status |
|---|---|---|---|
| Auth | `signup()` | `POST /auth/signup/v1` | COVERED |
| Auth | `login()` | `POST /auth/login/v1` | COVERED |
| Auth | `logout()` | `POST /auth/logout/v1` | COVERED |
| Auth | `requestPasswordReset()` | `POST /auth/password-reset/v1` | COVERED |
| Users | `getUserById()` | `GET /users/me/v1` | COVERED |
| Config | `getBehaviorsConfig()` | `GET /config/behaviors/v1` | COVERED |
| Config | `getSupportedPlatforms()` | `GET /config/platforms/v1` | COVERED |
| Projects | `getProjects()` | `GET /projects/v1` | COVERED |
| Projects | `getProjectsForSidebar()` | `GET /projects/sidebar/v1` | COVERED |
| Projects | `getProjectById()` | `GET /projects/{id}/v1` | COVERED |
| Projects | `createProject()` | `POST /projects/v1` | COVERED |
| Projects | `updateProject()` | `PATCH /projects/{id}/v1` | COVERED |
| Projects | `deleteProject()` | `DELETE /projects/{id}/v1` | COVERED |
| Entries | `getEntries()` (list) | `GET /projects/{id}/subprojects/{subprojectId}/entries/v1` | COVERED |
| Entries | `getEntries()` (export) | `GET /projects/{id}/subprojects/{subprojectId}/entries/export/v1` | COVERED |
| Entries | `deleteEntry()` | `DELETE /projects/{id}/subprojects/{subprojectId}/entries/{entryId}/v1` | COVERED |
| Entries | `addEntriesToProject()` | `POST /projects/{id}/subprojects/{subprojectId}/entries/v1` | COVERED |
| Entries | `predictPendingEntries()` | `POST /projects/{id}/subprojects/{subprojectId}/predictions/v1` | COVERED |
| Predictions | `getPredictionRuns()` | `GET /projects/{id}/subprojects/{subprojectId}/predictions/v1` | COVERED |
| Analysis | `triggerProjectAnalysis()` | `POST /projects/{id}/subprojects/{subprojectId}/analysis/v1` | COVERED |
| Analysis | `getSubprojectAnalysisHistory()` | `GET /projects/{id}/subprojects/{subprojectId}/analysis/v1` | COVERED |
| Analysis | `getAnalysisRunById()` | `GET /projects/{id}/subprojects/{subprojectId}/analysis/{runId}/v1` | COVERED |
| Dashboard | `getDashboardSummary()` | `GET /dashboard/summary/v1` | COVERED |
| Dashboard | `getRecentActivities()` | `GET /dashboard/activities/v1` | COVERED |

**22 distinct service function call sites → 24 documented endpoints** (getEntries maps to 2 endpoints: list and export; predictPendingEntries maps to a Predictions domain endpoint). All service functions accounted for.

---

_Verified: 2026-03-10_
_Verifier: Claude (gsd-verifier)_

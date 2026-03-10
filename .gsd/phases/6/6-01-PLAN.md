---
phase: 6-endpoints
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - ENDPOINTS.md
autonomous: true
requirements:
  - RESTful conventions with /v1 suffix
  - Per-endpoint documentation (screen, resource, verb, path params, query params, body, headers, response)
  - Security analysis for user-scoped data access
  - Resource relationship documentation

must_haves:
  truths:
    - "ENDPOINTS.md exists at the project root and is complete enough for a backend developer to implement every endpoint without reading frontend code"
    - "Every mocked API call found in the research audit maps to exactly one documented endpoint in ENDPOINTS.md"
    - "Every endpoint has its associated screen, HTTP verb, versioned URL, path params, query params, request body, headers, and response shapes documented"
    - "The security model is documented — ownership chain, which endpoints require Authorization header, and what the backend must verify per resource"
    - "The identified gaps and design decisions are surfaced with recommended resolutions so the backend team does not encounter ambiguity"
  artifacts:
    - path: "ENDPOINTS.md"
      provides: "Complete RESTful endpoint specification for backend development"
      contains: "Auth, Users, Config, Projects, Entries, Predictions, Analysis, Dashboard domains"
  key_links:
    - from: "ENDPOINTS.md#entries"
      to: "subprojectId resolution"
      via: "Gap 2 and Gap 3 documentation"
      pattern: "subprojectId.*numeric"
    - from: "ENDPOINTS.md#security"
      to: "Authorization header requirement"
      via: "per-endpoint header table"
      pattern: "Authorization.*Bearer"
---

<objective>
Produce ENDPOINTS.md at the project root — a complete, authoritative RESTful endpoint specification covering all eight resource domains discovered during research: Auth, Users, Config, Projects, Entries, Predictions, Analysis, and Dashboard.

Purpose: Give the backend team a single document they can consume directly to implement the Panoptic backend API. No frontend code reading required after this document exists.
Output: ENDPOINTS.md at /ENDPOINTS.md
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.gsd/ROADMAP.md
@.gsd/phases/6/RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write ENDPOINTS.md</name>
  <files>ENDPOINTS.md</files>
  <action>
Create ENDPOINTS.md at the project root. The research is complete and high-confidence — this task is purely about writing the document clearly and completely. Do not read any additional source files; all required information is in RESEARCH.md.

Structure the document exactly as follows:

---

# ENDPOINTS.md — Panopticon API Specification

Section 1 — Overview
- One paragraph on the BFF pattern: the frontend never calls the backend from the browser. React Router loaders/actions (server-side) call these REST endpoints and forward the Authorization header extracted from the session cookie.
- One paragraph on versioning: all endpoints use a `/v1` suffix at the END of the URL path (not a prefix). Example: `GET /projects/v1`, not `GET /api/v1/projects`.

Section 2 — Resource Ownership Chain
Render the hierarchy as a text tree:
```
User
└── Projects
    └── Subprojects (one per ML model, auto-created on project creation)
        └── Entries
            ├── PredictionRuns
            └── AnalysisRuns
```
Follow with one sentence: "All non-auth endpoints are scoped to the authenticated user. The backend must extract `userId` from the JWT and verify resource ownership on every request."

Section 3 — Common Request Headers
Table with two rows: `Authorization: Bearer <token>` (required on all non-auth endpoints, description: JWT from login response), `Content-Type: application/json` (required on POST/PATCH endpoints with a body).

Section 4 — Common Response Patterns
Show two JSON blocks:
1. Pagination envelope (used by all list endpoints): `{ "data": [...], "total": 45, "page": 1, "limit": 10, "totalPages": 5 }`
2. Error envelope: `{ "error": { "code": "string", "message": "string" } }`

Section 5 — Type Definitions
Define all shared enums and types as TypeScript, copied exactly from RESEARCH.md:
- TargetBehavior (enum)
- MLModel (enum)
- EntryVerdict (enum)
- PredictionRunStatus (enum)
- AnalysisStatus (enum)
- SocialMediaType (enum)
- TwitterMetadata (interface)
- AnalysisResult (interface)

Section 6 — Endpoints by Domain
Create one H2 subsection per domain. Within each domain, create one H3 per endpoint. Each endpoint entry uses this exact template:

**Screen:** [name of screen(s) that trigger this call]
**Resource:** [primary resource name]

```
VERB /path/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|

(Use separate tables for Path Params, Query Params, Request Body. Omit any table that has no rows.)

**Headers:**
- Authorization: Bearer [token] — required / not required

**Response:**
- `200 OK` / `201 Created` / `204 No Content`: [describe shape or "No body"]
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Resource does not exist

Document the following endpoints in the following order:

--- AUTH domain ---

POST /auth/signup/v1
  Screen: Register
  Body: { email: string, password: string }
  No Authorization header required
  201: { id: number, email: string }
  400: email already registered or validation failure

POST /auth/login/v1
  Screen: Login
  Body: { username: string, password: string }
  No Authorization header required
  200: { token: string, expiresAt: string (ISO 8601), userId: number }
  401: invalid credentials

POST /auth/logout/v1
  Screen: Logout (any page)
  No body
  Authorization header required
  204: No body
  401: invalid or missing token

POST /auth/password-reset/v1
  Screen: Forgot Password
  Body: { email: string }
  No Authorization header required
  204: No body (always succeeds to prevent email enumeration)
  400: validation failure

--- USERS domain ---

GET /users/me/v1
  Screen: All pages (sidebar, root loader)
  No path or query params, no body
  Authorization header required
  200: { id: number, email: string, name?: string }
  401, 403

--- CONFIG domain ---

Note before documenting config endpoints: Add a design note — "These endpoints return reference/configuration data. Whether they require authentication depends on whether the registration form needs them before login. Current recommendation: require Authorization to keep the surface area small; revisit if public access is needed."

GET /config/behaviors/v1
  Screen: All pages (root loader), New Entry, New Project
  No params
  Authorization header required (see note above)
  200: array of behavior config objects — { id: TargetBehavior, label: string, models: MLModel[], color: string, icon: string }[]

GET /config/platforms/v1
  Screen: New Entry
  No params
  Authorization header required (see note above)
  200: { platforms: SocialMediaType[] }

--- PROJECTS domain ---

GET /projects/v1
  Screen: New Entry (full project list with subprojects)
  Query params: page (integer, default 1), limit (integer, default 10)
  Authorization header required
  200: pagination envelope, data: Project[] where Project = { id: number, name: string, description?: string, behaviors: TargetBehavior[], subprojects: Subproject[] }
  Subproject = { id: number, model: MLModel }

GET /projects/sidebar/v1
  Screen: All pages (sidebar, root loader)
  No params
  Authorization header required
  200: { projects: { id: number, name: string, subprojects: { id: number, model: MLModel }[] }[] }
  Note: returns a lightweight projection — no description, no behaviors, just the fields the sidebar needs. Avoids over-fetching on every page load.

POST /projects/v1
  Screen: New Project
  Body: { name: string, description?: string, behaviors: TargetBehavior[], models: MLModel[] }
  Authorization header required
  201: full Project object (same shape as GET /projects/v1 data item)
  Design note: backend auto-creates one Subproject per entry in `models`. The `subprojects` array in the response reflects these created subprojects.
  400: validation (name required, at least one behavior and one model), 401, 403

GET /projects/{id}/v1
  Screen: Project Detail, Project Settings
  Path param: id (integer) — project ID
  Authorization header required
  200: full Project object
  401, 403, 404

PATCH /projects/{id}/v1
  Screen: Project Settings (Edit Project)
  Path param: id (integer)
  Body (all fields optional): { name?: string, description?: string, behaviors?: TargetBehavior[], models?: MLModel[] }
  Authorization header required
  Design note — Gap 4 (additive-only): The current mock only adds behaviors/models, never removes them. The backend PATCH should treat the `behaviors` and `models` arrays as full replacements (not additive). If removal must be prevented at the application level, enforce it in the BFF layer, not the backend.
  200: updated full Project object
  400, 401, 403, 404

DELETE /projects/{id}/v1
  Screen: Project Settings, Project Detail (confirm modal)
  Path param: id (integer)
  No body
  Authorization header required
  204: No body. Cascading delete: all subprojects, entries, prediction runs, and analysis runs for this project are deleted.
  401, 403, 404

--- ENTRIES domain ---

GET /projects/{id}/subprojects/{subprojectId}/entries/v1
  Screen: Subproject Entries (project entries table)
  Path params: id (integer, project ID), subprojectId (integer, subproject ID)
  Query params:
    page (integer, default 1)
    limit (integer, default 10)
    filterCol ("id" | "text" | "verdict" | "score") — optional
    filterVal (string) — optional, used with filterCol
    filterOp (">" | "<" | ">=" | "<=" | "=" | "~=") — optional, used only when filterCol is "score"
    filterBias (float) — optional, tolerance margin for the "~=" fuzzy operator
  Authorization header required
  200: pagination envelope, data: Entry[] where Entry = { id: number, text: string, verdict: EntryVerdict, score?: number, socialMediaType: SocialMediaType, metadata?: TwitterMetadata, createdAt: string }
  Design note — Gap 2/3: The frontend currently uses the model name string (e.g. "bert_spanish") as the route param. The backend must accept the numeric `subprojectId`. The BFF will require updating to resolve model slug → subproject ID before calling this endpoint.
  401, 403, 404

GET /projects/{id}/subprojects/{subprojectId}/entries/export/v1
  Screen: Entries Export (triggered from subproject entries view)
  Path params: id (integer), subprojectId (integer)
  Query params: same filter params as the entries list endpoint (filterCol, filterVal, filterOp, filterBias). No pagination — returns all matching entries.
  Authorization header required
  Response headers: Content-Type: text/csv, Content-Disposition: attachment; filename="entries-export.csv"
  200: CSV stream (no JSON envelope)
  Design note — Gap 6: This is a dedicated endpoint, not a variant of the entries list. It streams CSV and must not be conflated with the JSON list endpoint.
  401, 403, 404

POST /projects/{id}/subprojects/{subprojectId}/entries/v1
  Screen: New Entry (single and bulk upload)
  Path params: id (integer), subprojectId (integer)
  Body: { entries: { text: string, metadata?: TwitterMetadata }[], socialMediaType?: SocialMediaType }
  Note: accepts an array to support both single (array of 1) and bulk (array of N) ingestion in one call.
  Authorization header required
  201: { created: number } — count of entries successfully created
  400: validation (text required per entry), 401, 403, 404

DELETE /projects/{id}/subprojects/{subprojectId}/entries/{entryId}/v1
  Screen: Subproject Entries (delete icon in table row)
  Path params: id (integer), subprojectId (integer), entryId (integer)
  No body
  Authorization header required
  204: No body
  401, 403, 404

--- PREDICTIONS domain ---

POST /projects/{id}/subprojects/{subprojectId}/predictions/v1
  Screen: Subproject Entries (Predict button)
  Path params: id (integer), subprojectId (integer)
  No body — triggers prediction for all entries with verdict "Pending" in this subproject
  Authorization header required
  201: { runId: number, status: PredictionRunStatus, totalEntries: number }
  409 Conflict: a prediction run is already in progress for this subproject
  401, 403, 404

GET /projects/{id}/subprojects/{subprojectId}/predictions/v1
  Screen: Prediction Runs (history tab)
  Path params: id (integer), subprojectId (integer)
  Query params: page (integer, default 1), limit (integer, default 10)
  Authorization header required
  200: pagination envelope, data: PredictionRun[] where PredictionRun = { id: number, projectId: number, subprojectId: number, totalEntries: number, processedEntries: number, status: PredictionRunStatus, createdAt: string, completedAt?: string }
  401, 403, 404

--- ANALYSIS domain ---

POST /projects/{id}/subprojects/{subprojectId}/analysis/v1
  Screen: Analysis (trigger button)
  Path params: id (integer), subprojectId (integer)
  Body: { excludedEntryIds: number[] } — may be empty array if no entries are excluded
  Authorization header required
  201: { runId: number, status: AnalysisStatus } — status is always "processing" on creation
  409 Conflict: an analysis run is already processing for this subproject
  401, 403, 404

GET /projects/{id}/subprojects/{subprojectId}/analysis/v1
  Screen: Analysis (history list)
  Path params: id (integer), subprojectId (integer)
  Query params: page (integer, default 1), limit (integer, default 10)
  Authorization header required
  200: pagination envelope, data: AnalysisRunSummary[] where AnalysisRunSummary = { id: number, subprojectId: number, status: AnalysisStatus, createdAt: string, completedAt?: string } (no result payload — summaries only)
  Design note — Gap 9: The UI polls this list to detect when a run transitions from "processing" to "completed" or "failed". The backend should update status synchronously or via a background job. The lifecycle is: processing → completed | failed.
  401, 403, 404

GET /projects/{id}/subprojects/{subprojectId}/analysis/{runId}/v1
  Screen: Analysis Report modal
  Path params: id (integer), subprojectId (integer), runId (integer)
  No query params or body
  Authorization header required
  200: { id: number, subprojectId: number, status: AnalysisStatus, createdAt: string, completedAt?: string, result?: AnalysisResult } — `result` is present only when status is "completed"
  401, 403, 404
  Note: This endpoint is called from an internal BFF route (`api.v1.projects.$id.models.$modelId.analysis.$runId.tsx`) which is the only client-side fetch in the app.

--- DASHBOARD domain ---

GET /dashboard/summary/v1
  Screen: Dashboard (/)
  No path or query params, no body
  Authorization header required
  200: { totalProjects: number, totalEntries: number, totalAnalysisRuns: number, pendingEntries: number }
  Design note — Gap 7: No explicit userId in the request. The backend derives the user from the JWT and scopes the response accordingly. Always returns data for the authenticated user only.
  401

GET /dashboard/activities/v1
  Screen: Dashboard (/)
  No path or query params, no body
  Authorization header required
  200: { activities: { id: number, type: string, description: string, createdAt: string }[] }
  Design note — Gap 7: Same implicit user scoping as /dashboard/summary/v1.
  401

Section 7 — Security Checklist
Copy the scope-check matrix from RESEARCH.md verbatim into a table under an H2 "Security Checklist" heading. Add a brief intro sentence: "The backend must perform the following ownership checks on every request, after validating the JWT."

Section 8 — Design Decisions and Open Questions
Create a numbered list for each of the 9 gaps from RESEARCH.md. For each gap:
- State the gap title
- One sentence describing the problem
- One sentence with the recommended resolution (or mark as "Requires team decision" for gaps 1 and 8)

Gap 1 (Subproject creation): Recommend always using PATCH /projects/{id}/v1 to add models; no separate POST subprojects endpoint needed initially.
Gap 2 (modelId vs subprojectId): Recommend numeric subprojectId as the canonical path param; BFF must be updated to resolve model slug → subproject ID.
Gap 3 (Entry ownership): Recommend subprojectId as the scope key for entries; (projectId, modelId_string) composite is not stable.
Gap 4 (updateProject additive-only): Recommend full array replacement on PATCH; removal prevention, if needed, belongs in BFF.
Gap 5 (filter operators): Already resolved — document exact query param names: filterCol, filterVal, filterOp, filterBias.
Gap 6 (export stream): Already resolved — dedicated endpoint with text/csv response.
Gap 7 (dashboard implicit userId): Already resolved — userId always derived from JWT, never in request params.
Gap 8 (config auth): Requires team decision — recommend requiring Authorization initially.
Gap 9 (analysis polling): Already resolved — GET /analysis/{runId}/v1 is the polling endpoint; lifecycle is processing → completed | failed.
  </action>
  <verify>
    <automated>test -f /Users/lhbelfanti/workspace/github/panopticon/ENDPOINTS.md && echo "ENDPOINTS.md exists" && wc -l /Users/lhbelfanti/workspace/github/panopticon/ENDPOINTS.md</automated>
  </verify>
  <done>
ENDPOINTS.md exists at the project root. It contains sections for Overview, Resource Ownership Chain, Common Headers, Common Response Patterns, Type Definitions, all eight endpoint domains (Auth, Users, Config, Projects, Entries, Predictions, Analysis, Dashboard), a Security Checklist table, and a Design Decisions section addressing all 9 research gaps. Every mocked API call from RESEARCH.md maps to exactly one documented endpoint.
  </done>
</task>

</tasks>

<verification>
After the executor writes ENDPOINTS.md, verify:
1. File exists: `test -f ENDPOINTS.md`
2. All eight domains present: grep for "## Auth", "## Users", "## Config", "## Projects", "## Entries", "## Predictions", "## Analysis", "## Dashboard"
3. All 25 endpoints from the research inventory are present (count H3 headings or grep for verb patterns)
4. Security checklist table is present: grep for "Security Checklist"
5. All 9 design gaps are documented: grep for "Gap 1" through "Gap 9"
</verification>

<success_criteria>
A backend developer can open ENDPOINTS.md and implement every endpoint without reading a single line of frontend code. The document resolves all identified ambiguities (subprojectId vs modelId, updateProject semantics, config auth, export as dedicated endpoint) and documents the security ownership chain clearly.
</success_criteria>

<output>
After completion, create `.gsd/phases/6/6-01-SUMMARY.md` following the summary template.
</output>

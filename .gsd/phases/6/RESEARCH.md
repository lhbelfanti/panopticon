# Phase 6: Endpoints — Research

**Researched:** 2026-03-10
**Domain:** RESTful API specification, frontend service audit, security modeling
**Confidence:** HIGH (all findings derived directly from source code)

---

## Summary

Phase 6 is a documentation and specification phase, not an implementation phase. The goal is to audit every mocked API call in the frontend and produce a complete, authoritative ENDPOINTS.md that the backend team can consume directly.

All API calls live under `app/services/api/` as server-only TypeScript files. The app uses a BFF (Backend For Frontend) pattern: React Router loaders and actions call these service functions server-side; no fetch calls reach the browser. Every service function currently returns mocked data or manipulates in-memory stores. The backend must implement the real HTTP endpoints that will replace these mocks.

The ownership chain is: `User → Projects → Subprojects (one per ML model) → Entries → Prediction Runs / Analysis Runs`. Every resource except auth endpoints belongs to a user and must be scoped by `userId` for security.

**Primary recommendation:** Produce ENDPOINTS.md by grouping endpoints into seven resource domains — Auth, Users, Config, Projects, Entries, Predictions, Analysis — following REST conventions with version suffix `/v1`, and include full per-endpoint specification (screen, resource, verb, path params, query params, body, headers, response shape).

---

## Complete API Call Inventory

All calls audited from source. Confidence: HIGH (read directly from code).

### Auth domain — `app/services/api/auth/index.server.ts`

| Service Function | Used In | Operation | Notes |
|---|---|---|---|
| `signup(body)` | `login._index.tsx` action | Register new user | body: `{ email, password }` |
| `login(body)` | `login._index.tsx` action | Log in | body: `{ username, password }` → returns `token`, `expiresAt`, `userId` |
| `logout(request, token)` | `logout.tsx` action | Log out | Destroys session cookie |
| `requestPasswordReset(email)` | `login._index.tsx` action | Forgot password | body: `{ email }` |

Session is stored as an httpOnly cookie (`panopticon_session`) containing `token`, `expiresAt`, `userId`. The BFF reads the cookie server-side and forwards `Authorization: Bearer <token>` to the backend.

### Users domain — `app/services/api/users/users.server.ts`

| Service Function | Used In | Operation |
|---|---|---|
| `getUserById(id)` | `session.server.ts` (root loader) | Get current user profile |

### Config domain — `app/services/api/config.server.ts`

| Service Function | Used In | Operation |
|---|---|---|
| `getAppConfig()` | `entries.new.tsx` loader, root | Returns `{ behaviors[], platforms[], tokenQuota }` |
| `getBehaviorsConfig()` | root loader, `config.server.ts` | Returns list of behavior configs with models, colors, icons |
| `getSupportedPlatforms()` | via `config.server.ts` | Returns list of social media platforms |

### Projects domain — `app/services/api/projects/index.server.ts`

| Service Function | Used In | Operation |
|---|---|---|
| `getProjects()` | `entries.new.tsx` loader | List all projects (full detail) |
| `getProjectsForSidebar()` | `session.server.ts` (root) | List projects with id/name/subprojects only |
| `getProjectById(id)` | `projects.$id.tsx` layout loader | Get single project |
| `createProject(data)` | `projects.new.tsx` action | Create project |
| `updateProject(id, data)` | `projects.$id.settings.tsx` action | Update project (name, description, add behaviors/models) |
| `deleteProject(id)` | `projects.$id._index.tsx` action, `projects.$id.settings.tsx` action | Delete project |

`createProject` body: `{ name, description?, behaviors: TargetBehavior[], models: MLModel[] }`. Backend auto-creates one subproject per model.

`updateProject` body (partial): `{ name?, description?, behaviors?: TargetBehavior[], models?: MLModel[] }`. Current mock logic only ADDS new behaviors/models (no removal). This additive-only constraint should be flagged in ENDPOINTS.md.

### Entries domain — `app/services/api/entries/index.server.ts`

| Service Function | Used In | Operation |
|---|---|---|
| `getEntries(params)` | `projects.$id.models.$modelId._index.tsx` loader, `projects.$id.models.$modelId.analysis.tsx` loader, `projects.$id.models.$modelId.export.tsx` loader | List entries (paginated, filterable) |
| `deleteEntry(projectId, modelId, entryId)` | `projects.$id.models.$modelId._index.tsx` action | Delete a single entry |
| `addEntriesToProject(projectId, modelIds[], entriesData[], socialMediaType?)` | `entries.new.tsx` action | Add entries (single or bulk) to a project across one or more subprojects |
| `predictPendingEntries(projectId, modelId)` | `projects.$id.models.$modelId._index.tsx` action | Trigger prediction for all pending entries in a subproject |

`getEntries` query params from code:
- `page` (integer, default 1)
- `limit` (integer, default 10; export uses 10000 to fetch all)
- `filterCol` — `"id" | "text" | "verdict" | "score"`
- `filterVal` — string value
- `filterOp` — `">" | "<" | ">=" | "<=" | "=" | "~="` (used only with score filter)
- `filterBias` — float, tolerance margin for `~=` operator

Export route (`projects.$id.models.$modelId.export.tsx`) uses the same `getEntries` function with `limit: 10000` and returns a CSV stream. This maps to a dedicated export endpoint.

`addEntriesToProject` — entry data shape per item: `{ text: string, metadata?: TwitterMetadata }`. TwitterMetadata: `{ date?, isReply: boolean, hasQuote: boolean, quotedText?, isQuoteAReply? }`. `socialMediaType` currently only `"twitter"`.

### Predictions domain — `app/services/api/predictions/index.server.ts`

| Service Function | Used In | Operation |
|---|---|---|
| `getPredictionRuns(projectId, modelId)` | `projects.$id.models.$modelId.predictions.ts` loader | List prediction runs for a subproject |

PredictionRun shape: `{ id, projectId, modelId, totalEntries, processedEntries, status: "Running"|"Completed"|"Failed", createdAt, completedAt? }`.

The `predictPendingEntries` call (entries domain) **triggers** a run and creates a PredictionRun record. `getPredictionRuns` only **reads** the history.

### Analysis domain — `app/services/api/analysis/index.server.ts`

| Service Function | Used In | Operation |
|---|---|---|
| `triggerProjectAnalysis(subprojectId, excludedEntryIds[])` | `projects.$id.models.$modelId.analysis.tsx` action | Trigger new analysis run for a subproject |
| `getSubprojectAnalysisHistory(subprojectId)` | `projects.$id.models.$modelId.analysis.tsx` loader | List analysis run summaries (no result payload) |
| `getAnalysisRunById(runId)` | `api.v1.projects.$id.models.$modelId.analysis.$runId.tsx` loader | Get single analysis run (full result) |

### Dashboard domain — `app/services/api/dashboard/index.server.ts`

| Service Function | Used In | Operation |
|---|---|---|
| `getDashboardSummary()` | `_index.tsx` loader | Get aggregate stats for current user |
| `getRecentActivities()` | `_index.tsx` loader | Get recent activity feed for current user |

---

## Resource Hierarchy and Ownership Chain

```
User
└── Projects (userId scopes all project access)
    ├── Project fields: id, name, description, behaviors[], models[]
    └── Subprojects (one per ML model, auto-created)
        ├── Subproject fields: id, model
        └── Entries (scoped to projectId + modelId/subprojectId)
            ├── Entry fields: id, text, verdict, score, socialMediaType, metadata, createdAt
            ├── PredictionRuns (one per "predict all pending" trigger)
            └── AnalysisRuns (one per "trigger analysis" action)
                └── AnalysisResult (full result, fetched separately)
```

Key security observation: the current mock uses `projectId` (integer) and `modelId` (string like `"bert_spanish"`) as a composite key for entries. In the backend, `subprojectId` (the numeric `Subproject.id`) should be the primary scoping key for entries, not the `(projectId, modelId)` pair — the model name is not a stable identifier. ENDPOINTS.md must call this out.

The existing internal API route `api.v1.projects.$id.models.$modelId.analysis.$runId.tsx` already uses path params `{id, modelId, runId}` — this is the only route that currently has explicit versioning in its React Router path name.

---

## RESTful URL Conventions

Based on phase requirements: no `/api/v1` prefix, version goes at END as `/v1` suffix.

Pattern: `/{resource}/{id}/{sub-resource}/{sub-id}/v1`

Example: `GET /projects/42/models/bert_spanish/entries/v1`

**Notes on naming:**
- `modelId` in the frontend is actually the model name string (e.g. `"bert_spanish"`). The backend should accept the `subprojectId` (numeric) instead, or the model slug — ENDPOINTS.md must decide which. The subproject numeric ID is cleaner and more RESTful.
- "Subprojects" could be named "subprojects" or "models" in the URL. The existing React Router route already uses "models" (`projects.$id.models.$modelId`). Using "subprojects" in the REST API is more semantically accurate.
- Behaviors and models (ML model configs) are configuration/reference data, not user-owned resources — they belong to the Config domain.

---

## Security Requirements

All non-auth endpoints require:

**Header:** `Authorization: Bearer <token>`

The BFF extracts the token from the session cookie and forwards it. The backend must:
1. Validate the JWT on every request
2. Extract `userId` from the token
3. Verify that the requested resource (project, entry, analysis run) belongs to that `userId`

**Scope-check matrix:**

| Resource | Security Check |
|---|---|
| `GET /users/me/v1` | Token userId == user being fetched |
| `GET/POST /projects/v1` | Scoped to userId from token |
| `GET/PATCH/DELETE /projects/{id}/v1` | Project.userId == token userId |
| `GET /projects/{id}/subprojects/v1` | Project.userId == token userId |
| `GET/POST /projects/{id}/subprojects/{subprojectId}/entries/v1` | Project.userId == token userId |
| `DELETE /projects/{id}/subprojects/{subprojectId}/entries/{entryId}/v1` | Project.userId == token userId |
| `POST /projects/{id}/subprojects/{subprojectId}/predictions/v1` | Project.userId == token userId |
| `GET /projects/{id}/subprojects/{subprojectId}/predictions/v1` | Project.userId == token userId |
| `POST /projects/{id}/subprojects/{subprojectId}/analysis/v1` | Project.userId == token userId |
| `GET /projects/{id}/subprojects/{subprojectId}/analysis/v1` | Project.userId == token userId |
| `GET /projects/{id}/subprojects/{subprojectId}/analysis/{runId}/v1` | Project.userId == token userId |
| `GET /dashboard/summary/v1` | Scoped to userId from token |
| `GET /dashboard/activities/v1` | Scoped to userId from token |

---

## Pagination Pattern

Discovered from `getEntries` implementation and route loader:

```
Query params: ?page=1&limit=10
Response body:
{
  "entries": [...],
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

Apply this pattern to all list endpoints (projects, entries, prediction runs, analysis runs).

---

## Endpoint Map by Screen

| Screen | Frontend Route | Endpoints Called |
|---|---|---|
| Login | `/login` | POST /auth/login/v1 |
| Register | `/login` (register view) | POST /auth/signup/v1 |
| Forgot Password | `/login` (forgot view) | POST /auth/password-reset/v1 |
| Logout | `/logout` | POST /auth/logout/v1 |
| Dashboard | `/` | GET /dashboard/summary/v1, GET /dashboard/activities/v1 |
| Sidebar (all pages) | root layout | GET /projects/sidebar/v1, GET /users/me/v1, GET /config/behaviors/v1 |
| New Entry | `/entries/new` | GET /projects/v1 (full list), GET /config/platforms/v1, POST /projects/{id}/subprojects/{subprojectId}/entries/v1 |
| Project List | sidebar | GET /projects/sidebar/v1 |
| Project Detail | `/projects/:id` | GET /projects/{id}/v1 |
| Project Settings | `/projects/:id/settings` | PATCH /projects/{id}/v1, DELETE /projects/{id}/v1 |
| New Project | `/projects/new` | POST /projects/v1 |
| Subproject Entries | `/projects/:id/models/:modelId` | GET /projects/{id}/subprojects/{subprojectId}/entries/v1 (paginated+filtered), DELETE /projects/{id}/subprojects/{subprojectId}/entries/{entryId}/v1, POST /projects/{id}/subprojects/{subprojectId}/predictions/v1 |
| Entries Export | `/projects/:id/models/:modelId/export` | GET /projects/{id}/subprojects/{subprojectId}/entries/export/v1 (CSV stream) |
| Prediction Runs | `/projects/:id/models/:modelId/predictions` | GET /projects/{id}/subprojects/{subprojectId}/predictions/v1 |
| Analysis | `/projects/:id/models/:modelId/analysis` | GET /projects/{id}/subprojects/{subprojectId}/analysis/v1, POST /projects/{id}/subprojects/{subprojectId}/analysis/v1 |
| Analysis Report (modal) | internal to analysis page | GET /projects/{id}/subprojects/{subprojectId}/analysis/{runId}/v1 |

---

## Type Definitions to Include in ENDPOINTS.md

These are the canonical TypeScript types from the codebase that map to request/response bodies.

### TargetBehavior (enum)
`"illicit_drugs" | "hate_speech" | "cyberbullying" | "sexism" | "suicidal_ideation_depression" | "eating_disorders"`

### MLModel (enum)
`"bert_spanish" | "roberta_english" | "llama3_zero_shot" | "svm_baseline"`

### EntryVerdict (enum)
`"Pending" | "In Progress" | "Positive" | "Negative" | "Error"`

### PredictionRunStatus (enum)
`"Running" | "Completed" | "Failed"`

### AnalysisStatus (enum)
`"processing" | "completed" | "failed"`

### SocialMediaType (enum)
`"twitter"` (extensible)

### TwitterMetadata
```typescript
{
  date?: string;
  isReply: boolean;
  hasQuote: boolean;
  quotedText?: string;
  isQuoteAReply?: boolean;
}
```

### AnalysisResult
```typescript
{
  totalEntries: number;
  analyzedEntries: number;
  excludedEntries: number;
  behaviorDistribution: { behaviorId: string; count: number; percentage: number; }[];
  confidenceMetrics: {
    average: number;
    median: number;
    distribution: { range: string; count: number; }[];
  };
  insights: {
    topBehaviorId: string;
    confidenceTrend: "high" | "medium" | "low";
    verdictConcentration: "positive" | "negative" | "mixed";
  };
}
```

---

## Identified Gaps and Issues to Flag in ENDPOINTS.md

### Gap 1: Subproject creation is implicit
When creating a project, the backend auto-creates one subproject per selected model. The planner must decide whether to expose a separate `POST /projects/{id}/subprojects/v1` endpoint for adding models later (matching `updateProject` mock behavior), or always do it via PATCH /projects/{id}.

### Gap 2: `modelId` vs `subprojectId` key confusion
The frontend uses model name strings (`"bert_spanish"`) as the route param `:modelId`, but the data model has a numeric `Subproject.id`. The REST API should use the numeric subproject ID as the path param for clarity and stability. ENDPOINTS.md must define which identifier the backend accepts and note that the BFF will need updating.

### Gap 3: Entry ownership requires subprojectId
Entries are currently scoped by `(projectId, modelId_string)`. In the backend, entries should be owned by a subproject. The endpoint must accept `subprojectId` (numeric) to resolve the right entry set. The frontend currently passes `modelId` as a string — this is a known inconsistency.

### Gap 4: `updateProject` is additive-only
The mock only adds new behaviors/models; it never removes them. The real PATCH endpoint should clarify whether it supports removal. If removal is needed, ENDPOINTS.md should specify the full replacement behavior (replace arrays entirely).

### Gap 5: `getEntries` filter operators need API representation
The `filterOp` supports `">" | "<" | ">=" | "<=" | "=" | "~="` and `filterBias` for the fuzzy match. These are query string params with no standardized encoding. ENDPOINTS.md should define the exact query param names and valid values.

### Gap 6: Export endpoint returns a stream, not JSON
`/export` returns `Content-Type: text/csv`. It shares the same filter params as the entries list endpoint. This needs a dedicated endpoint spec entry, not just a variant of the entries list.

### Gap 7: Dashboard endpoints are user-scoped but userId is implicit
`getDashboardSummary()` and `getRecentActivities()` take no explicit userId. The backend derives the user from the token. The endpoint spec should document that the response is always scoped to the authenticated user.

### Gap 8: Config endpoints (behaviors, platforms) may be public
`getBehaviorsConfig()` and `getSupportedPlatforms()` return static-ish reference data. The planner should decide if these require authentication. If the app needs them before login (e.g., on the registration form), they must be public.

### Gap 9: Analysis run polling
The analysis `triggerProjectAnalysis` returns immediately with a `"processing"` status. The UI currently relies on reload (`submit(null, { replace: true })`) to refresh history. The backend should support polling via `GET /analysis/{runId}/v1` (already mapped via the existing internal route). ENDPOINTS.md should document the lifecycle: `processing → completed | failed`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---|---|---|
| CSV streaming | Custom serializer | Standard `Content-Type: text/csv` streaming pattern (already in the codebase) |
| JWT validation | Custom parser | Standard JWT library in backend lang |
| Pagination | Custom cursor logic | Standard `page`/`limit`/`total`/`totalPages` envelope (already established) |
| Filter query params | Custom DSL | Explicit named params as established: `filterCol`, `filterVal`, `filterOp`, `filterBias` |

---

## Architecture Patterns

### BFF Pattern (established)
The frontend never calls the backend directly from the browser. All API calls happen in React Router loaders/actions (server-side). The BFF:
1. Reads the session cookie to get the JWT token
2. Calls backend REST endpoints with `Authorization: Bearer <token>`
3. Returns shaped data to the client

ENDPOINTS.md documents the backend contract, not the BFF internal routes.

### Existing internal API route
`app/routes/api.v1.projects.$id.models.$modelId.analysis.$runId.tsx` — this is an internal BFF route used to poll a specific analysis run from the client (via `fetch` in the browser, not a loader). This is the only client-facing fetch in the app and represents the polling use case. The backend endpoint it will call is `GET /projects/{id}/subprojects/{subprojectId}/analysis/{runId}/v1`.

---

## Sources

### Primary (HIGH confidence)
All findings are sourced directly from reading the project's TypeScript source files:

- `app/services/api/auth/index.server.ts` + `types.ts` + `session.server.ts`
- `app/services/api/projects/index.server.ts` + `types.ts`
- `app/services/api/entries/index.server.ts` + `types.ts` + `mocks/platforms.ts`
- `app/services/api/predictions/index.server.ts` + `types.ts`
- `app/services/api/analysis/index.server.ts` + `types.ts`
- `app/services/api/dashboard/index.server.ts` + `types.ts`
- `app/services/api/users/users.server.ts` + `types.ts`
- `app/services/api/config.server.ts`
- `app/services/api/mock/store.ts`
- All route files under `app/routes/`
- `app/root.tsx`

### Secondary (MEDIUM confidence)
- RESTful conventions and `/v1` suffix pattern: specified in phase requirements (ROADMAP.md)

---

## Metadata

**Confidence breakdown:**
- API inventory: HIGH — read directly from service files
- Type definitions: HIGH — read directly from TypeScript types
- Security requirements: HIGH — ownership chain clear from data model
- URL conventions: HIGH — derived from phase spec + existing internal route pattern
- Gaps/Issues: HIGH — identified from code inconsistencies between mock and ideal REST design

**Research date:** 2026-03-10
**Valid until:** Stable — this is a code audit of the current frontend, no external dependencies

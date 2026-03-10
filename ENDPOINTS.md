# ENDPOINTS.md — Panopticon API Specification

---

## Overview

The Panopticon frontend uses a Backend For Frontend (BFF) pattern. The browser never calls the backend directly. All API communication happens inside React Router loaders and actions, which run server-side. These server-side functions read the session cookie to extract the JWT token and forward it as an `Authorization: Bearer <token>` header to the backend REST API. The browser only receives the shaped response returned by the loader or action.

All endpoints use a `/v1` version suffix at the **end** of the URL path, not as a prefix. The pattern is `/{resource}/{id}/{sub-resource}/v1`. For example: `GET /projects/v1`, not `GET /api/v1/projects`. This convention applies across all domains without exception.

---

## Resource Ownership Chain

```
User
└── Projects
    └── Subprojects (one per ML model, auto-created on project creation)
        └── Entries
            ├── PredictionRuns
            └── AnalysisRuns
```

All non-auth endpoints are scoped to the authenticated user. The backend must extract `userId` from the JWT and verify resource ownership on every request.

---

## Common Request Headers

| Header | Required | Description |
|---|---|---|
| `Authorization: Bearer <token>` | Required on all non-auth endpoints | JWT returned from the login response |
| `Content-Type: application/json` | Required on POST/PATCH endpoints with a body | JSON request body |

---

## Common Response Patterns

**Pagination envelope** (used by all list endpoints):
```json
{
  "data": [],
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

**Error envelope**:
```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

---

## Type Definitions

```typescript
type TargetBehavior =
  | "illicit_drugs"
  | "hate_speech"
  | "cyberbullying"
  | "sexism"
  | "suicidal_ideation_depression"
  | "eating_disorders";

type MLModel =
  | "bert_spanish"
  | "roberta_english"
  | "llama3_zero_shot"
  | "svm_baseline";

type EntryVerdict =
  | "Pending"
  | "In Progress"
  | "Positive"
  | "Negative"
  | "Error";

type PredictionRunStatus = "Running" | "Completed" | "Failed";

type AnalysisStatus = "processing" | "completed" | "failed";

type SocialMediaType = "twitter"; // extensible

interface TwitterMetadata {
  date?: string;
  isReply: boolean;
  hasQuote: boolean;
  quotedText?: string;
  isQuoteAReply?: boolean;
}

interface AnalysisResult {
  totalEntries: number;
  analyzedEntries: number;
  excludedEntries: number;
  behaviorDistribution: {
    behaviorId: string;
    count: number;
    percentage: number;
  }[];
  confidenceMetrics: {
    average: number;
    median: number;
    distribution: { range: string; count: number }[];
  };
  insights: {
    topBehaviorId: string;
    confidenceTrend: "high" | "medium" | "low";
    verdictConcentration: "positive" | "negative" | "mixed";
  };
}
```

---

## Auth

### POST /auth/signup/v1

**Screen:** Register
**Resource:** User

```
POST /auth/signup/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Body | email | string | Yes | User email address |
| Body | password | string | Yes | User password |

**Headers:**
- Authorization: Bearer [token] — not required

**Response:**
- `201 Created`: `{ id: number, email: string }`
- `400 Bad Request`: Email already registered or validation failure
- `401 Unauthorized`: N/A

---

### POST /auth/login/v1

**Screen:** Login
**Resource:** Session

```
POST /auth/login/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Body | username | string | Yes | User email used as username |
| Body | password | string | Yes | User password |

**Headers:**
- Authorization: Bearer [token] — not required

**Response:**
- `200 OK`: `{ token: string, expiresAt: string (ISO 8601), userId: number }`
- `401 Unauthorized`: Invalid credentials

---

### POST /auth/logout/v1

**Screen:** Logout (any page)
**Resource:** Session

```
POST /auth/logout/v1
```

No path params, query params, or request body.

**Headers:**
- Authorization: Bearer [token] — required

**Response:**
- `204 No Content`: No body
- `401 Unauthorized`: Missing or invalid token

---

### POST /auth/password-reset/v1

**Screen:** Forgot Password
**Resource:** PasswordReset

```
POST /auth/password-reset/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Body | email | string | Yes | Email address to send the reset link to |

**Headers:**
- Authorization: Bearer [token] — not required

**Response:**
- `204 No Content`: No body — always succeeds to prevent email enumeration
- `400 Bad Request`: Validation failure

---

## Users

### GET /users/me/v1

**Screen:** All pages (sidebar, root loader)
**Resource:** User

```
GET /users/me/v1
```

No path params, query params, or request body.

**Headers:**
- Authorization: Bearer [token] — required

**Response:**
- `200 OK`: `{ id: number, email: string, name?: string }`
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user

---

## Config

> **Design note:** These endpoints return reference/configuration data. Whether they require authentication depends on whether the registration form needs them before login. Current recommendation: require Authorization to keep the surface area small; revisit if public access is needed.

### GET /config/behaviors/v1

**Screen:** All pages (root loader), New Entry, New Project
**Resource:** BehaviorConfig

```
GET /config/behaviors/v1
```

No path params, query params, or request body.

**Headers:**
- Authorization: Bearer [token] — required (see design note above)

**Response:**
- `200 OK`: `{ id: TargetBehavior, label: string, models: MLModel[], color: string, icon: string }[]`
- `401 Unauthorized`: Missing or invalid token

---

### GET /config/platforms/v1

**Screen:** New Entry
**Resource:** Platform

```
GET /config/platforms/v1
```

No path params, query params, or request body.

**Headers:**
- Authorization: Bearer [token] — required (see design note above)

**Response:**
- `200 OK`: `{ platforms: SocialMediaType[] }`
- `401 Unauthorized`: Missing or invalid token

---

## Projects

### GET /projects/v1

**Screen:** New Entry (full project list with subprojects)
**Resource:** Project

```
GET /projects/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Query | page | integer | No | Page number, default 1 |
| Query | limit | integer | No | Items per page, default 10 |

**Headers:**
- Authorization: Bearer [token] — required

**Response:**
- `200 OK`: Pagination envelope, `data: Project[]` where:
  ```typescript
  interface Project {
    id: number;
    name: string;
    description?: string;
    behaviors: TargetBehavior[];
    subprojects: { id: number; model: MLModel }[];
  }
  ```
- `401 Unauthorized`: Missing or invalid token

---

### GET /projects/sidebar/v1

**Screen:** All pages (sidebar, root loader)
**Resource:** Project

```
GET /projects/sidebar/v1
```

No path params, query params, or request body.

**Headers:**
- Authorization: Bearer [token] — required

**Response:**
- `200 OK`:
  ```json
  {
    "projects": [
      { "id": 1, "name": "string", "subprojects": [{ "id": 1, "model": "bert_spanish" }] }
    ]
  }
  ```
  > **Note:** Returns a lightweight projection — no description, no behaviors, only the fields the sidebar needs. Avoids over-fetching on every page load.
- `401 Unauthorized`: Missing or invalid token

---

### POST /projects/v1

**Screen:** New Project
**Resource:** Project

```
POST /projects/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Body | name | string | Yes | Project name |
| Body | description | string | No | Project description |
| Body | behaviors | TargetBehavior[] | Yes | At least one behavior required |
| Body | models | MLModel[] | Yes | At least one model required |

**Headers:**
- Authorization: Bearer [token] — required

> **Design note:** The backend auto-creates one Subproject per entry in `models`. The `subprojects` array in the response reflects these created subprojects.

**Response:**
- `201 Created`: Full Project object (same shape as `GET /projects/v1` data item)
- `400 Bad Request`: Validation failure — name required, at least one behavior and one model required
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user

---

### GET /projects/{id}/v1

**Screen:** Project Detail, Project Settings
**Resource:** Project

```
GET /projects/{id}/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |

**Headers:**
- Authorization: Bearer [token] — required

**Response:**
- `200 OK`: Full Project object
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Project does not exist

---

### PATCH /projects/{id}/v1

**Screen:** Project Settings (Edit Project)
**Resource:** Project

```
PATCH /projects/{id}/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |
| Body | name | string | No | Updated project name |
| Body | description | string | No | Updated project description |
| Body | behaviors | TargetBehavior[] | No | Full replacement of behaviors array |
| Body | models | MLModel[] | No | Full replacement of models array |

**Headers:**
- Authorization: Bearer [token] — required

> **Design note — Gap 4 (additive-only):** The current mock only adds behaviors/models, never removes them. The backend PATCH should treat the `behaviors` and `models` arrays as full replacements (not additive). If removal must be prevented at the application level, enforce it in the BFF layer, not the backend.

**Response:**
- `200 OK`: Updated full Project object
- `400 Bad Request`: Validation failure
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Project does not exist

---

### DELETE /projects/{id}/v1

**Screen:** Project Settings, Project Detail (confirm modal)
**Resource:** Project

```
DELETE /projects/{id}/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |

**Headers:**
- Authorization: Bearer [token] — required

> **Cascading delete:** All subprojects, entries, prediction runs, and analysis runs for this project are deleted.

**Response:**
- `204 No Content`: No body
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Project does not exist

---

## Entries

### GET /projects/{id}/subprojects/{subprojectId}/entries/v1

**Screen:** Subproject Entries (project entries table)
**Resource:** Entry

```
GET /projects/{id}/subprojects/{subprojectId}/entries/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |
| Path | subprojectId | integer | Yes | Subproject ID |
| Query | page | integer | No | Page number, default 1 |
| Query | limit | integer | No | Items per page, default 10 |
| Query | filterCol | "id" \| "text" \| "verdict" \| "score" | No | Column to filter on |
| Query | filterVal | string | No | Filter value; used with filterCol |
| Query | filterOp | ">" \| "<" \| ">=" \| "<=" \| "=" \| "~=" | No | Comparison operator; used only when filterCol is "score" |
| Query | filterBias | float | No | Tolerance margin for the "~=" fuzzy operator |

**Headers:**
- Authorization: Bearer [token] — required

> **Design note — Gap 2/3:** The frontend currently uses the model name string (e.g. `"bert_spanish"`) as the route param. The backend must accept the numeric `subprojectId`. The BFF will require updating to resolve model slug → subproject ID before calling this endpoint.

**Response:**
- `200 OK`: Pagination envelope, `data: Entry[]` where:
  ```typescript
  interface Entry {
    id: number;
    text: string;
    verdict: EntryVerdict;
    score?: number;
    socialMediaType: SocialMediaType;
    metadata?: TwitterMetadata;
    createdAt: string;
  }
  ```
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Project or subproject does not exist

---

### GET /projects/{id}/subprojects/{subprojectId}/entries/export/v1

**Screen:** Entries Export (triggered from subproject entries view)
**Resource:** Entry

```
GET /projects/{id}/subprojects/{subprojectId}/entries/export/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |
| Path | subprojectId | integer | Yes | Subproject ID |
| Query | filterCol | "id" \| "text" \| "verdict" \| "score" | No | Column to filter on |
| Query | filterVal | string | No | Filter value; used with filterCol |
| Query | filterOp | ">" \| "<" \| ">=" \| "<=" \| "=" \| "~=" | No | Comparison operator; used only when filterCol is "score" |
| Query | filterBias | float | No | Tolerance margin for the "~=" fuzzy operator |

No pagination params — returns all matching entries.

**Headers:**
- Authorization: Bearer [token] — required

> **Design note — Gap 6:** This is a dedicated endpoint, not a variant of the entries list. It streams CSV and must not be conflated with the JSON list endpoint.

**Response:**
- `200 OK`: CSV stream
  - Response headers: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="entries-export.csv"`
  - No JSON envelope
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Project or subproject does not exist

---

### POST /projects/{id}/subprojects/{subprojectId}/entries/v1

**Screen:** New Entry (single and bulk upload)
**Resource:** Entry

```
POST /projects/{id}/subprojects/{subprojectId}/entries/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |
| Path | subprojectId | integer | Yes | Subproject ID |
| Body | entries | `{ text: string, metadata?: TwitterMetadata }[]` | Yes | Array of entries; accepts 1 (single) or N (bulk) |
| Body | socialMediaType | SocialMediaType | No | Social media platform type |

**Headers:**
- Authorization: Bearer [token] — required

**Response:**
- `201 Created`: `{ created: number }` — count of entries successfully created
- `400 Bad Request`: Validation failure — text required per entry
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Project or subproject does not exist

---

### DELETE /projects/{id}/subprojects/{subprojectId}/entries/{entryId}/v1

**Screen:** Subproject Entries (delete icon in table row)
**Resource:** Entry

```
DELETE /projects/{id}/subprojects/{subprojectId}/entries/{entryId}/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |
| Path | subprojectId | integer | Yes | Subproject ID |
| Path | entryId | integer | Yes | Entry ID |

**Headers:**
- Authorization: Bearer [token] — required

**Response:**
- `204 No Content`: No body
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Entry does not exist

---

## Predictions

### POST /projects/{id}/subprojects/{subprojectId}/predictions/v1

**Screen:** Subproject Entries (Predict button)
**Resource:** PredictionRun

```
POST /projects/{id}/subprojects/{subprojectId}/predictions/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |
| Path | subprojectId | integer | Yes | Subproject ID |

No request body — triggers prediction for all entries with verdict "Pending" in this subproject.

**Headers:**
- Authorization: Bearer [token] — required

**Response:**
- `201 Created`: `{ runId: number, status: PredictionRunStatus, totalEntries: number }`
- `409 Conflict`: A prediction run is already in progress for this subproject
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Project or subproject does not exist

---

### GET /projects/{id}/subprojects/{subprojectId}/predictions/v1

**Screen:** Prediction Runs (history tab)
**Resource:** PredictionRun

```
GET /projects/{id}/subprojects/{subprojectId}/predictions/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |
| Path | subprojectId | integer | Yes | Subproject ID |
| Query | page | integer | No | Page number, default 1 |
| Query | limit | integer | No | Items per page, default 10 |

**Headers:**
- Authorization: Bearer [token] — required

**Response:**
- `200 OK`: Pagination envelope, `data: PredictionRun[]` where:
  ```typescript
  interface PredictionRun {
    id: number;
    projectId: number;
    subprojectId: number;
    totalEntries: number;
    processedEntries: number;
    status: PredictionRunStatus;
    createdAt: string;
    completedAt?: string;
  }
  ```
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Project or subproject does not exist

---

## Analysis

### POST /projects/{id}/subprojects/{subprojectId}/analysis/v1

**Screen:** Analysis (trigger button)
**Resource:** AnalysisRun

```
POST /projects/{id}/subprojects/{subprojectId}/analysis/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |
| Path | subprojectId | integer | Yes | Subproject ID |
| Body | excludedEntryIds | number[] | Yes | IDs of entries to exclude; may be an empty array |

**Headers:**
- Authorization: Bearer [token] — required

**Response:**
- `201 Created`: `{ runId: number, status: AnalysisStatus }` — status is always `"processing"` on creation
- `409 Conflict`: An analysis run is already processing for this subproject
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Project or subproject does not exist

---

### GET /projects/{id}/subprojects/{subprojectId}/analysis/v1

**Screen:** Analysis (history list)
**Resource:** AnalysisRun

```
GET /projects/{id}/subprojects/{subprojectId}/analysis/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |
| Path | subprojectId | integer | Yes | Subproject ID |
| Query | page | integer | No | Page number, default 1 |
| Query | limit | integer | No | Items per page, default 10 |

**Headers:**
- Authorization: Bearer [token] — required

> **Design note — Gap 9:** The UI polls this list to detect when a run transitions from `"processing"` to `"completed"` or `"failed"`. The backend should update status synchronously or via a background job. The lifecycle is: `processing → completed | failed`.

**Response:**
- `200 OK`: Pagination envelope, `data: AnalysisRunSummary[]` where:
  ```typescript
  interface AnalysisRunSummary {
    id: number;
    subprojectId: number;
    status: AnalysisStatus;
    createdAt: string;
    completedAt?: string;
  }
  ```
  No result payload — summaries only.
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Project or subproject does not exist

---

### GET /projects/{id}/subprojects/{subprojectId}/analysis/{runId}/v1

**Screen:** Analysis Report modal
**Resource:** AnalysisRun

```
GET /projects/{id}/subprojects/{subprojectId}/analysis/{runId}/v1
```

| Param type | Name | Type | Required | Description |
|---|---|---|---|---|
| Path | id | integer | Yes | Project ID |
| Path | subprojectId | integer | Yes | Subproject ID |
| Path | runId | integer | Yes | Analysis run ID |

**Headers:**
- Authorization: Bearer [token] — required

> **Note:** This endpoint is called from the internal BFF route `api.v1.projects.$id.models.$modelId.analysis.$runId.tsx` — the only client-side fetch in the app and the primary polling endpoint for run status.

**Response:**
- `200 OK`:
  ```typescript
  {
    id: number;
    subprojectId: number;
    status: AnalysisStatus;
    createdAt: string;
    completedAt?: string;
    result?: AnalysisResult; // present only when status is "completed"
  }
  ```
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but resource does not belong to user
- `404 Not Found`: Analysis run does not exist

---

## Dashboard

### GET /dashboard/summary/v1

**Screen:** Dashboard (/)
**Resource:** DashboardSummary

```
GET /dashboard/summary/v1
```

No path params, query params, or request body.

**Headers:**
- Authorization: Bearer [token] — required

> **Design note — Gap 7:** No explicit userId in the request. The backend derives the user from the JWT and scopes the response accordingly. Always returns data for the authenticated user only.

**Response:**
- `200 OK`: `{ totalProjects: number, totalEntries: number, totalAnalysisRuns: number, pendingEntries: number }`
- `401 Unauthorized`: Missing or invalid token

---

### GET /dashboard/activities/v1

**Screen:** Dashboard (/)
**Resource:** Activity

```
GET /dashboard/activities/v1
```

No path params, query params, or request body.

**Headers:**
- Authorization: Bearer [token] — required

> **Design note — Gap 7:** Same implicit user scoping as `/dashboard/summary/v1`. The backend derives userId from the JWT.

**Response:**
- `200 OK`: `{ activities: { id: number, type: string, description: string, createdAt: string }[] }`
- `401 Unauthorized`: Missing or invalid token

---

## Security Checklist

The backend must perform the following ownership checks on every request, after validating the JWT.

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

## Design Decisions and Open Questions

1. **Gap 1 — Subproject creation is implicit**
   When a project is created, the backend auto-creates one subproject per entry in the `models` array. There is no separate `POST /projects/{id}/subprojects/v1` endpoint. Recommended resolution: use `PATCH /projects/{id}/v1` to add new models to an existing project, which triggers implicit subproject creation. No separate subproject endpoint needed initially.

2. **Gap 2 — `modelId` vs `subprojectId` key confusion**
   The frontend currently uses the model name string (e.g. `"bert_spanish"`) as the `:modelId` route param, but the data model has a numeric `Subproject.id`. Recommended resolution: the backend accepts numeric `subprojectId` as the canonical path param. The BFF must be updated to resolve model slug → subproject ID before calling backend endpoints.

3. **Gap 3 — Entry ownership requires `subprojectId`**
   Entries are currently scoped by `(projectId, modelId_string)` in the mock. In the backend, entries must be owned by a subproject and scoped by numeric `subprojectId`. Recommended resolution: use `subprojectId` as the primary scope key for all entry endpoints. The `(projectId, modelId_string)` composite is not stable.

4. **Gap 4 — `updateProject` is additive-only**
   The current mock only adds new behaviors/models and never removes them. Recommended resolution: treat `behaviors` and `models` arrays as full replacements on PATCH. If removal prevention is required at the application level, enforce it in the BFF layer, not the backend.

5. **Gap 5 — `getEntries` filter operators need API representation**
   The filter supports `filterOp` values: `">" | "<" | ">=" | "<=" | "=" | "~="` and a `filterBias` float for the fuzzy match. Recommended resolution: already resolved — use the established query param names: `filterCol`, `filterVal`, `filterOp`, `filterBias`.

6. **Gap 6 — Export endpoint returns a stream, not JSON**
   The export endpoint returns `Content-Type: text/csv` and shares filter params with the entries list, but it is a separate endpoint. Recommended resolution: already resolved — `GET /projects/{id}/subprojects/{subprojectId}/entries/export/v1` is a dedicated endpoint with CSV streaming. It must not be conflated with the JSON list endpoint.

7. **Gap 7 — Dashboard endpoints are user-scoped but userId is implicit**
   `getDashboardSummary()` and `getRecentActivities()` take no explicit userId. Recommended resolution: already resolved — userId is always derived from the JWT. The response is always scoped to the authenticated user only. Never include userId in the request params for these endpoints.

8. **Gap 8 — Config endpoints may or may not require authentication**
   `GET /config/behaviors/v1` and `GET /config/platforms/v1` return reference data. If the registration form needs them before login, they must be public. **Requires team decision.** Current recommendation: require Authorization to keep the attack surface small; revisit if public access is needed.

9. **Gap 9 — Analysis run polling**
   `triggerProjectAnalysis` returns immediately with `"processing"` status. The UI polls for completion. Recommended resolution: already resolved — `GET /projects/{id}/subprojects/{subprojectId}/analysis/{runId}/v1` is the polling endpoint. The lifecycle is: `processing → completed | failed`. The backend must update status synchronously or via a background job; the frontend has no webhook mechanism.

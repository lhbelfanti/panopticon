# Frontend Mock Auditor Memory

## Project Overview
- **Framework**: React Router v7 (file-system routing, SSR with loaders/actions)
- **Styling**: Tailwind CSS v4
- **i18n**: react-i18next with JSON locale files in `/public/locales/{en,es}/common.json`
- **Charts**: Recharts
- **PDF Generation**: jsPDF + jspdf-autotable (client-side)
- **No HTTP client**: All data fetching uses React Router loaders/actions (server-side)

## Mock Architecture
- **All backend calls are mocked in-memory** in `app/services/api/*/index.server.ts`
- In-memory stores: `entriesStore`, `predictionStore`, `analysisStore`, `projects[]`
- Simulated delays with `setTimeout` to mimic network latency
- No real API calls exist
- Mock data files: `app/services/api/entries/mocks/platforms.ts`, `app/services/api/mock/store.ts`
- Session uses cookie-based storage with fallback secret
- `app/services/api/config.server.ts` aggregates behaviors, platforms, tokenQuota into AppConfig

## Key Hardcoded Data Locations
- `app/services/api/dashboard/index.server.ts` - hardcoded summary stats and 3 activity items
- `app/services/api/projects/index.server.ts` - BEHAVIOR_CONFIGS (6 items), seed projects (2)
- `app/services/api/entries/index.server.ts` - mockTextPool (10 items), entry generation
- `app/services/api/entries/mocks/platforms.ts` - single platform "twitter"
- `app/services/api/users/users.server.ts` - hardcoded user (id=1, "Lucas Belfanti")
- `app/services/api/analysis/index.server.ts` - hardcoded behaviorDistribution & confidenceMetrics
- `app/services/api/auth/session.server.ts` - fallback SESSION_SECRET
- `app/services/api/auth/index.server.ts` - mock JWT token, no real auth validation
- `app/components/Dashboard/SummaryGrid/types.ts` - DEFAULT_TOKEN_QUOTA = 5_000_000
- `app/components/Sidebar/index.tsx` - fallback "Research User" / "@research"
- `app/components/EntryIngestion/TweetCard.tsx` - inline SVG avatar placeholder
- `app/components/Modals/AnalysisReportModal.tsx` - COLORS array for pie chart
- `app/utils/behaviorColors.ts` - BEHAVIOR_COLOR_MAP -- legitimately frontend-only

## Route Structure (12 routes total)
- `/` - Dashboard (auth required)
- `/login` - Auth (login/register/forgot)
- `/logout` - Logout action
- `/projects/new` - Create project
- `/projects/:id` - Project layout (loads project via Outlet context)
- `/projects/:id` (index) - Project detail
- `/projects/:id/settings` - Project settings
- `/projects/:id/models/:modelId` - Entries table
- `/projects/:id/models/:modelId/analysis` - Analysis page
- `/projects/:id/models/:modelId/export` - CSV export (resource route)
- `/projects/:id/models/:modelId/predictions` - Prediction runs (resource route)
- `/entries/new` - New entry ingestion

## Corrections from Previous Pass
- `NewProjectForm.tsx` does NOT have a hardcoded `modelsList` -- models from behaviorConfigs intersection
- `root.tsx` calls `getSessionUser(request)` not `getUserById(1)` directly
- Route count is 12 (including layout route `projects.$id.tsx`)
- `users.ts` client-side file was deleted (no longer exists)

## Audit Completed
- Full endpoint specification generated: 2026-03-09
- Total endpoints identified: 23
